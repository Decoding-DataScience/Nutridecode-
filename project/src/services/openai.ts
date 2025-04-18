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
    perServing: {
      calories: number;
      protein: number;
      carbs: number;
      fats: {
        total: number;
        saturated: number;
      };
      sugar: number;
      salt: number;
      omega3: number;
    };
    per100g: {
      calories: number;
      protein: number;
      carbs: number;
      fats: {
        total: number;
        saturated: number;
      };
      sugar: number;
      salt: number;
      omega3: number;
    };
  };
  healthClaims: string[];
  packaging: {
    materials: string[];
    recyclingInfo: string;
    sustainabilityClaims: string[];
    certifications: string[];
  };
  storage: {
    instructions: string[];
    bestBefore: string;
  };
  manufacturer: {
    name: string;
    address: string;
    contact: string;
  };
}

export async function analyzeFoodLabel(imageBase64: string): Promise<AnalysisResult> {
  const startTime = Date.now();
  const temperature = 0.1; // Set fixed temperature for consistent results
  const model = "gpt-4-turbo"; // Using GPT-4 model with vision support
  
  try {
    const base64Image = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const response = await openai.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: "system",
          content: `You are a food label analysis expert. Analyze the food label image and extract ONLY information that is explicitly stated on the label. Be extremely precise and thorough in your analysis. Format the response as a JSON object with the following structure:
          {
            "productName": "exact product name from label",
            "ingredients": {
              "list": ["all ingredients with exact percentages as shown (e.g., 'Rapeseed oil (78%)')"],
              "preservatives": ["identified preservatives with E-numbers and full names"],
              "additives": ["identified additives with full names"],
              "antioxidants": ["identified antioxidants with full chemical names"],
              "stabilizers": ["identified stabilizers"]
            },
            "allergens": {
              "declared": ["explicitly declared allergens in CAPS"],
              "mayContain": ["may contain warnings"]
            },
            "nutritionalInfo": {
              "servingSize": "stated serving size with exact measurements",
              "perServing": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fats": {
                  "total": number,
                  "saturated": number
                },
                "sugar": number,
                "salt": number,
                "omega3": number
              },
              "per100g": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fats": {
                  "total": number,
                  "saturated": number
                },
                "sugar": number,
                "salt": number,
                "omega3": number
              }
            },
            "healthClaims": ["all health-related claims exactly as written"],
            "packaging": {
              "materials": ["packaging materials with specifications"],
              "recyclingInfo": "complete recycling instructions",
              "sustainabilityClaims": ["all sustainability claims exactly as written"],
              "certifications": ["all certification marks and symbols shown"]
            },
            "storage": {
              "instructions": ["storage instructions exactly as written"],
              "bestBefore": "exact date format as shown"
            },
            "manufacturer": {
              "name": "company name",
              "address": "full address as shown",
              "contact": "contact information if provided"
            }
          }
          IMPORTANT: 
          1. Capture ALL ingredients with their exact percentages when shown
          2. Identify and classify preservatives, additives, and antioxidants
          3. Maintain exact wording and numerical values as shown on the label
          4. Include all percentages, measurements, and units exactly as displayed
          5. Capture all certification marks, symbols, and recycling information
          6. Note any specific dietary certifications (e.g., vegetarian, vegan)
          7. Extract all health claims and sustainability statements verbatim`
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
      const content = response.choices[0].message.content;
      if (!content) {
        console.error('Empty response content from OpenAI');
        throw new Error('Empty response from OpenAI');
      }
      console.log('OpenAI Response:', content);
      
      const analysisResult = JSON.parse(content);
      console.log('Parsed Analysis Result:', analysisResult);
      
      const processingTimeMs = Date.now() - startTime;

      // Add metadata to the result
      const result = {
        ...analysisResult,
        metadata: {
          timestamp: new Date().toISOString(),
          temperature,
          model,
          queryType: "food-label-analysis",
          processingTimeMs,
        }
      } as AnalysisResult;

      console.log('Final Result:', result);
      return result;
    } catch (parseError: unknown) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Response content:', response.choices[0]?.message?.content);
      throw new Error('Failed to parse analysis results: ' + (parseError instanceof Error ? parseError.message : String(parseError)));
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