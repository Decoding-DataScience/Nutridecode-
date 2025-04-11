import OpenAI from 'openai';
import { getUserPreferences } from './preferences';
import type { UserPreferences } from './preferences';
import type { AnalysisResult } from './openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface PreferenceBasedAnalysis extends AnalysisResult {
  preferencesMatch: {
    dietaryCompliance: {
      compliant: boolean;
      violations: string[];
      warnings: string[];
    };
    allergenSafety: {
      safe: boolean;
      detectedAllergens: string[];
      crossContaminationRisks: string[];
    };
    nutritionalAlignment: {
      aligned: boolean;
      concerns: string[];
      recommendations: string[];
    };
    sustainabilityMatch: {
      matches: boolean;
      positiveAspects: string[];
      improvements: string[];
    };
  };
  personalizedRecommendations: string[];
  alternativeProducts?: string[];
}

export async function analyzeWithPreferences(
  analysis: AnalysisResult,
  preferences?: UserPreferences
): Promise<PreferenceBasedAnalysis> {
  try {
    // If preferences not provided, fetch them
    if (!preferences) {
      preferences = await getUserPreferences();
    }

    // Create a detailed prompt based on user preferences
    const prompt = createPreferenceBasedPrompt(analysis, preferences);

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a personalized nutrition analysis expert. Analyze food products based on user preferences and provide detailed recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const preferenceAnalysis = JSON.parse(content);
    
    return {
      ...analysis,
      ...preferenceAnalysis
    };
  } catch (error) {
    console.error('Error in preference-based analysis:', error);
    throw error;
  }
}

function createPreferenceBasedPrompt(analysis: AnalysisResult, preferences: UserPreferences | null): string {
  if (!preferences) {
    return JSON.stringify(analysis);
  }

  return `Analyze this food product based on the following user preferences and provide personalized insights:

Product Analysis:
${JSON.stringify(analysis, null, 2)}

User Preferences:
${JSON.stringify(preferences, null, 2)}

Provide a detailed analysis in JSON format with the following structure:
{
  "preferencesMatch": {
    "dietaryCompliance": {
      "compliant": boolean,
      "violations": ["list any violations of dietary restrictions"],
      "warnings": ["list any potential concerns"]
    },
    "allergenSafety": {
      "safe": boolean,
      "detectedAllergens": ["list allergens that match user's alerts"],
      "crossContaminationRisks": ["list potential cross-contamination risks"]
    },
    "nutritionalAlignment": {
      "aligned": boolean,
      "concerns": ["list nutritional concerns based on health goals"],
      "recommendations": ["provide specific recommendations"]
    },
    "sustainabilityMatch": {
      "matches": boolean,
      "positiveAspects": ["list matching sustainability features"],
      "improvements": ["suggest sustainability improvements"]
    }
  },
  "personalizedRecommendations": [
    "List of specific recommendations based on user preferences"
  ],
  "alternativeProducts": [
    "Suggest alternative products if there are significant mismatches"
  ]
}

Focus on:
1. Strict compliance with dietary restrictions
2. Detailed allergen analysis including cross-contamination risks
3. Alignment with health goals and nutritional preferences
4. Sustainability preferences
5. Practical recommendations for alternatives if needed`;
}

export async function getDetailedIngredientAnalysis(
  ingredient: string,
  preferences: UserPreferences | null
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a nutrition expert providing personalized ingredient analysis based on user preferences."
        },
        {
          role: "user",
          content: `Analyze this ingredient: ${ingredient}
          
User Preferences: ${JSON.stringify(preferences, null, 2)}

Provide detailed information about:
1. What it is and its source
2. Nutritional value and health benefits
3. Any concerns based on user's dietary restrictions or allergens
4. How it aligns with user's health goals
5. Sustainability aspects
6. Alternative ingredients if it doesn't match preferences`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content || 'No detailed analysis available.';
  } catch (error) {
    console.error('Error analyzing ingredient:', error);
    throw error;
  }
} 