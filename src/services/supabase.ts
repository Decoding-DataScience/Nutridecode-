import { createClient } from '@supabase/supabase-js';
import type { AnalysisResult } from './openai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnalysisFilters {
  startDate?: string;
  endDate?: string;
  temperature?: number;
}

export async function saveAnalysis(analysis: AnalysisResult, imageUrl: string) {
  try {
    console.log('Starting analysis save process...');
    
    // Check if we have the required credentials
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase credentials are missing');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting user:', userError);
      throw new Error('Authentication error');
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Preparing analysis data for user:', user.id);

    // Check if analysis already exists
    const { data: existingAnalysis } = await supabase
      .from('food_analyses')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('product_name', analysis.productName)
      .order('created_at', { ascending: false })
      .limit(1);

    if (existingAnalysis && existingAnalysis.length > 0) {
      const lastAnalysisTime = new Date(existingAnalysis[0].created_at);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - lastAnalysisTime.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // If the same product was analyzed less than 1 hour ago
      if (hoursDiff < 1) {
        throw new Error('This product was recently analyzed. Please wait before analyzing it again.');
      }
    }

    // Prepare the analysis data with current timestamp
    const analysisData = {
      user_id: user.id,
      image_url: imageUrl,
      product_name: analysis.productName,
      ingredients_list: analysis.ingredients.list || [],
      preservatives: analysis.ingredients.preservatives || [],
      additives: analysis.ingredients.additives || [],
      antioxidants: analysis.ingredients.antioxidants || [],
      stabilizers: analysis.ingredients.stabilizers || [],
      declared_allergens: analysis.allergens?.declared || [],
      may_contain_allergens: analysis.allergens?.mayContain || [],
      serving_size: analysis.nutritionalInfo?.servingSize || '',
      nutritional_info: {
        perServing: analysis.nutritionalInfo?.perServing || {},
        per100g: analysis.nutritionalInfo?.per100g || {}
      },
      health_score: calculateHealthScore(analysis),
      health_claims: analysis.healthClaims || [],
      packaging_materials: analysis.packaging?.materials || [],
      recycling_info: analysis.packaging?.recyclingInfo || '',
      sustainability_claims: analysis.packaging?.sustainabilityClaims || [],
      certifications: analysis.packaging?.certifications || [],
      created_at: new Date().toISOString(),
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0',
        analysis_type: 'detailed'
      }
    };

    console.log('Attempting to save analysis data:', { ...analysisData, user_id: '[REDACTED]' });

    // Insert the analysis
    const { data, error: insertError } = await supabase
      .from('food_analyses')
      .insert(analysisData)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting analysis:', insertError);
      if (insertError.code === '23505') {
        throw new Error('This analysis has already been saved. Please try again later.');
      } else if (insertError.code === '42P01') {
        throw new Error('Database table not found. Please check your database setup');
      } else {
        throw new Error(`Database error: ${insertError.message}`);
      }
    }

    if (!data) {
      throw new Error('No data returned from insert operation');
    }

    console.log('Successfully saved analysis with ID:', data.id);
    return data;

  } catch (error) {
    console.error('Error in saveAnalysis:', error);
    throw error;
  }
}

function calculateHealthScore(analysis: AnalysisResult): number {
  let score = 0;
  
  try {
    // Base score starts at 65
    score = 65;

    // Analyze ingredients
    const ingredients = analysis.ingredients || {};
    
    // Healthy fats (rapeseed oil, olive oil, etc.) +1.5
    if (ingredients.list?.some(i => 
      i.toLowerCase().includes('rapeseed oil') || 
      i.toLowerCase().includes('olive oil') ||
      i.toLowerCase().includes('sunflower oil'))) {
      score += 1.5;
    }

    // Minimal allergens +1
    if (!analysis.allergens?.declared?.length && !analysis.allergens?.mayContain?.length) {
      score += 1;
    }

    // Preservatives penalty -1
    if (ingredients.preservatives?.length > 0 || 
        ingredients.list?.some(i => i.toLowerCase().includes('edta'))) {
      score -= 1;
    }

    // High calorie penalty -1
    if (analysis.nutritionalInfo?.per100g?.calories > 300) {
      score -= 1;
    }

    // Eco-friendly packaging +1
    if (analysis.packaging?.recyclingInfo || 
        analysis.packaging?.sustainabilityClaims?.length > 0) {
      score += 1;
    }

    // Moderate sugar/salt penalty -0.5
    if (analysis.nutritionalInfo?.per100g?.sugar > 5 || 
        analysis.nutritionalInfo?.per100g?.salt > 1.5) {
      score -= 0.5;
    }

    // Overall ingredient clarity +0.5
    if (ingredients.list?.length > 0 && ingredients.list.every(i => i.length > 0)) {
      score += 0.5;
    }

  } catch (error) {
    console.error('Error calculating health score:', error);
    return 65; // Return base score if there's an error
  }

  // Ensure score stays within 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function getAnalysisHistory(filters?: AnalysisFilters) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      return [];
    }

    let query = supabase
      .from('food_analyses')
      .select(`
        id,
        created_at,
        product_name,
        image_url,
        ingredients_list,
        preservatives,
        additives,
        antioxidants,
        stabilizers,
        declared_allergens,
        may_contain_allergens,
        serving_size,
        nutritional_info,
        health_score,
        health_claims,
        packaging_materials,
        recycling_info,
        sustainability_claims,
        certifications,
        metadata
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (filters) {
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters.temperature) {
        query = query.eq('metadata->temperature', filters.temperature);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analysis history:', error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('No analysis history found for user:', user.id);
      return [];
    }

    console.log('Fetched analysis history:', data.length, 'items');

    return data.map(item => ({
      id: item.id,
      created_at: item.created_at,
      product_name: item.product_name,
      image_url: item.image_url,
      health_score: item.health_score,
      analysis_result: {
        productName: item.product_name,
        ingredients: {
          list: item.ingredients_list || [],
          preservatives: item.preservatives || [],
          additives: item.additives || [],
          antioxidants: item.antioxidants || [],
          stabilizers: item.stabilizers || []
        },
        allergens: {
          declared: item.declared_allergens || [],
          mayContain: item.may_contain_allergens || []
        },
        nutritionalInfo: item.nutritional_info || {},
        healthScore: item.health_score,
        healthClaims: item.health_claims || [],
        packaging: {
          materials: item.packaging_materials || [],
          recyclingInfo: item.recycling_info || '',
          sustainabilityClaims: item.sustainability_claims || [],
          certifications: item.certifications || []
        }
      }
    }));
  } catch (error) {
    console.error('Unexpected error in getAnalysisHistory:', error);
    return [];
  }
}

export async function getAnalysisById(id: string) {
  const { data, error } = await supabase
    .from('food_analyses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAnalyticsData() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('food_analyses')
    .select('*')
    .eq('user_id', user.id);

  if (error) {
    throw error;
  }

  return {
    totalQueries: data.length,
    successfulQueries: data.filter(item => !item.metadata?.error).length,
    averageProcessingTime: data.reduce((acc, item) => acc + (item.metadata?.processingTimeMs || 0), 0) / data.length,
    errorRate: (data.filter(item => item.metadata?.error).length / data.length) * 100
  };
}

export async function exportAnalysisData(format: 'csv' | 'json' = 'csv') {
  const data = await getAnalysisHistory();
  
  if (format === 'csv') {
    // Convert data to CSV format
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    return `${headers}\n${rows.join('\n')}`;
  }
  
  return JSON.stringify(data, null, 2);
}