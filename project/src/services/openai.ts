import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface AnalysisMetadata {
  timestamp: string;
  temperature: number;
  model: string;
  queryType: string;
  processingTimeMs: number;
  error?: string;
  warning?: string;
}

export interface AnalysisResult {
  metadata: AnalysisMetadata;
  productName: string;
  ingredients: {
    list: string[];
    preservatives: string[];
    additives: string[];
    antioxidants: string[];
    stabilizers: string[];
  };
  allergens: {
    declared: string[];
    mayContain: string[];
  };
  nutritionalInfo: {
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    sugar: number;
    vitamins: Record<string, string>;
    minerals: Record<string, string>;
  };
  healthClaims: string[];
  packaging: {
    materials: string[];
    recyclingInfo: string;
    sustainabilityClaims: string[];
    certifications: string[];
  };
  alternatives: {
    healthier: string[];
    sustainable: string[];
  };
}

export async function analyzeFoodLabel(imageBase64: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  const temperature = 0.1; // Set fixed temperature for consistent results
  const model = "gpt-4-1106-vision-preview"; // Updated to the latest vision model
  
  try {
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await openai.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: "system",
          content: `You are a food label analysis expert. Analyze the food label image and extract ONLY information that is explicitly stated on the label. Format the response as a JSON object with the following structure:
          {
            "productName": "exact product name from label",
            "ingredients": {
              "list": ["all ingredients in order"],
              "preservatives": ["identified preservatives"],
              "additives": ["identified additives"],
              "antioxidants": ["identified antioxidants"],
              "stabilizers": ["identified stabilizers"]
            },
            "allergens": {
              "declared": ["explicitly declared allergens"],
              "mayContain": ["may contain warnings"]
            },
            "nutritionalInfo": {
              "servingSize": "stated serving size",
              "calories": number,
              "protein": number,
              "carbs": number,
              "fats": number,
              "sugar": number,
              "vitamins": {"vitamin": "amount"},
              "minerals": {"mineral": "amount"}
            },
            "healthClaims": ["health-related claims on packaging"],
            "packaging": {
              "materials": ["packaging materials listed"],
              "recyclingInfo": "recycling instructions",
              "sustainabilityClaims": ["sustainability claims"],
              "certifications": ["certifications shown"]
            },
            "alternatives": {
              "healthier": ["healthier alternatives based on ingredients"],
              "sustainable": ["eco-friendly alternatives"]
            }
          }
          IMPORTANT: Only include information that is explicitly shown on the label. Leave arrays empty if no information is provided.`
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            },
            {
              type: "text",
              text: "Analyze this food label and provide only the information that is explicitly shown on the packaging."
            }
          ]
        }
      ],
      max_tokens: 4096,
      response_format: { type: "json_object" }
    });

    try {
      const analysisResult = JSON.parse(response.choices[0].message.content);
      const processingTimeMs = Date.now() - startTime;

      // Add metadata to the result
      return {
        ...analysisResult,
        metadata: {
          timestamp: new Date().toISOString(),
          temperature,
          model,
          queryType: "food-label-analysis",
          processingTimeMs,
        }
      } as AnalysisResult;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse analysis results');
    }
  } catch (error) {
    console.error('Error analyzing food label:', error);
    
    const metadata: AnalysisMetadata = {
      timestamp: new Date().toISOString(),
      temperature,
      model,
      queryType: "food-label-analysis",
      processingTimeMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        metadata.error = 'Authentication failed. Please check your API key.';
      } else if (error.message.includes('timeout')) {
        metadata.error = 'Request timed out. Please try again.';
      } else if (error.message.includes('rate limit')) {
        metadata.error = 'Too many requests. Please wait a moment and try again.';
      }
    }
    
    throw new Error(JSON.stringify({ metadata }));
  }
}

export function validateImage(imageBase64: string): boolean {
  if (!imageBase64.match(/^data:image\/(jpeg|png|heif);base64,/)) {
    return false;
  }

  const base64Length = imageBase64.length - (imageBase64.indexOf(',') + 1);
  const sizeInBytes = (base64Length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  
  return sizeInMB <= 10;
}