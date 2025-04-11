import { supabase } from '../lib/supabase';

export interface UserPreferences {
  id: string;
  user_id: string;
  dietary_restrictions: string[];
  preferred_diets: string[];
  allergen_alerts: string[];
  allergen_sensitivity: 'low' | 'medium' | 'high';
  health_goals: string[];
  daily_calorie_target: number | null;
  macro_preferences: {
    protein: number;
    carbs: number;
    fats: number;
  };
  nutrients_to_track: string[];
  nutrients_to_avoid: string[];
  ingredients_to_avoid: string[];
  preferred_ingredients: string[];
  eco_conscious: boolean;
  packaging_preferences: string[];
  notification_preferences: {
    allergen_alerts: boolean;
    health_insights: boolean;
    sustainability_tips: boolean;
    weekly_summary: boolean;
  };
  created_at: string;
  updated_at: string;
}

export const defaultPreferences: Partial<UserPreferences> = {
  dietary_restrictions: [],
  preferred_diets: [],
  allergen_alerts: [],
  allergen_sensitivity: 'medium',
  health_goals: [],
  daily_calorie_target: 2000,
  macro_preferences: {
    protein: 30,
    carbs: 40,
    fats: 30
  },
  nutrients_to_track: [],
  nutrients_to_avoid: [],
  ingredients_to_avoid: [],
  preferred_ingredients: [],
  eco_conscious: false,
  packaging_preferences: [],
  notification_preferences: {
    allergen_alerts: true,
    health_insights: true,
    sustainability_tips: true,
    weekly_summary: true
  }
};

export async function getUserPreferences(): Promise<UserPreferences | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return default preferences
        return {
          ...defaultPreferences,
          id: 'default',
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as UserPreferences;
      }
      throw error;
    }

    return data || {
      ...defaultPreferences,
      id: 'default',
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as UserPreferences;
  } catch (error) {
    console.error('Error in getUserPreferences:', error);
    throw error;
  }
}

export async function updateUserPreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }

    // First, try to get existing preferences
    const { data: existingPrefs, error: fetchError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Prepare the preferences data
    const preferencesData = {
      ...defaultPreferences,
      ...preferences,
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    if (existingPrefs) {
      // Update existing preferences
      const { data, error: updateError } = await supabase
        .from('user_preferences')
        .update(preferencesData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return data;
    } else {
      // Create new preferences
      const newPreferencesData = {
        ...preferencesData,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('user_preferences')
        .insert(newPreferencesData)
        .select()
        .single();

      if (insertError) throw insertError;
      return data;
    }
  } catch (error) {
    console.error('Error in updateUserPreferences:', error);
    throw error;
  }
}

export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Kosher',
  'Halal',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo'
];

export const COMMON_ALLERGENS = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree Nuts',
  'Peanuts',
  'Wheat',
  'Soybeans'
];

export const HEALTH_GOALS = [
  'Weight Loss',
  'Weight Gain',
  'Muscle Building',
  'Heart Health',
  'Better Sleep',
  'More Energy',
  'Digestive Health',
  'Blood Sugar Control'
];

export const NUTRIENTS_TO_TRACK = [
  'Protein',
  'Fiber',
  'Vitamin D',
  'Calcium',
  'Iron',
  'Potassium',
  'Omega-3',
  'Antioxidants'
];

export const PACKAGING_PREFERENCES = [
  'Recyclable',
  'Biodegradable',
  'Minimal Packaging',
  'Plastic-Free',
  'Reusable Container'
]; 