import { createClient } from '@supabase/supabase-js';
import type { AnalysisResult } from './openai';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AnalysisFilters {
  startDate?: string;
  endDate?: string;
  temperature?: number;
}

export async function saveAnalysis(analysis: AnalysisResult, imageUrl: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('food_analyses')
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      product_name: analysis.productName,
      ingredients_list: analysis.ingredients.list,
      preservatives: analysis.ingredients.preservatives,
      additives: analysis.ingredients.additives,
      antioxidants: analysis.ingredients.antioxidants,
      stabilizers: analysis.ingredients.stabilizers,
      declared_allergens: analysis.allergens.declared,
      may_contain_allergens: analysis.allergens.mayContain,
      serving_size: analysis.nutritionalInfo.servingSize,
      calories: analysis.nutritionalInfo.calories,
      protein: analysis.nutritionalInfo.protein,
      carbs: analysis.nutritionalInfo.carbs,
      fats: analysis.nutritionalInfo.fats,
      sugar: analysis.nutritionalInfo.sugar,
      vitamins: analysis.nutritionalInfo.vitamins,
      minerals: analysis.nutritionalInfo.minerals,
      health_claims: analysis.healthClaims,
      packaging_materials: analysis.packaging.materials,
      recycling_info: analysis.packaging.recyclingInfo,
      sustainability_claims: analysis.packaging.sustainabilityClaims,
      certifications: analysis.packaging.certifications,
      healthier_alternatives: analysis.alternatives.healthier,
      sustainable_alternatives: analysis.alternatives.sustainable,
      metadata: analysis.metadata
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAnalysisHistory(filters?: AnalysisFilters) {
  let query = supabase
    .from('food_analyses')
    .select('*')
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
    throw error;
  }

  return data;
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