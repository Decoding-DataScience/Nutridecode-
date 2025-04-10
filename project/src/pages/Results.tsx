import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Leaf,
  Scale,
  Heart,
  RecycleIcon,
  Share2,
  Download,
  ChevronRight,
  Star,
  AlertCircle,
  Droplet,
  Apple,
  Info,
  Save,
  Check,
  X
} from 'lucide-react';
import type { AnalysisResult } from '../services/openai';
import { saveAnalysis } from '../services/supabase';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis as AnalysisResult;
  const imageUrl = location.state?.imageUrl as string;
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!analysis) {
      navigate('/scan');
      return;
    }

    // Save analysis to Supabase
    const saveToHistory = async () => {
      try {
        await saveAnalysis(analysis, imageUrl);
      } catch (error) {
        console.error('Error saving analysis:', error);
      }
    };

    saveToHistory();
  }, [analysis, imageUrl, navigate]);

  const downloadAsPDF = async () => {
    const element = document.getElementById('results-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`${analysis.productName}-analysis.pdf`);
  };

  const downloadAsImage = async () => {
    const element = document.getElementById('results-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${analysis.productName}-analysis.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!analysis) return null;

  const calculateHealthScore = () => {
    let score = 65; // Start with base score of 6.5/10 * 100

    // Analyze fat content and type
    if (analysis.ingredients.list.some(i => i.toLowerCase().includes('rapeseed oil'))) {
      score += 15; // Healthy unsaturated fats
    }

    // Check for preservatives
    if (analysis.ingredients.preservatives.length > 0) {
      score -= 10; // Penalty for synthetic preservatives like EDTA
    }

    // Check for high calorie content
    if (analysis.nutritionalInfo.perServing.calories > 100) {
      score -= 10;
    }

    // Add points for eco-friendly packaging
    if (analysis.packaging.sustainabilityClaims.some(claim => 
      claim.toLowerCase().includes('recycled') || 
      claim.toLowerCase().includes('sustainable'))) {
      score += 10;
    }

    // Add points for certifications (vegetarian, etc.)
    if (analysis.packaging.certifications.length > 0) {
      score += 5;
    }

    // Add points for omega-3 content
    if (analysis.healthClaims.some(claim => 
      claim.toLowerCase().includes('omega'))) {
      score += 5;
    }

    // Deduct points for sugar and salt content
    if (analysis.nutritionalInfo.perServing.sugar > 0) {
      score -= 5;
    }

    // Ensure score stays within 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const scoreColor = getScoreColor(healthScore);

  const getIngredientColor = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase();
    
    // Concerning ingredients
    if (
      lowerIngredient.includes('edta') ||
      lowerIngredient.includes('sugar') ||
      lowerIngredient.includes('salt')
    ) {
      return 'bg-red-50 text-red-800 border-red-200';
    }
    
    // Moderate ingredients
    if (
      lowerIngredient.includes('water') ||
      lowerIngredient.includes('spirit vinegar') ||
      lowerIngredient.includes('lemon juice concentrate')
    ) {
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    }
    
    // Healthy ingredients
    if (
      lowerIngredient.includes('rapeseed oil') ||
      lowerIngredient.includes('egg') ||
      lowerIngredient.includes('paprika extract')
    ) {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [ingredientDetails, setIngredientDetails] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const getIngredientDetails = async (ingredient: string) => {
    setIsLoading(true);
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a nutrition expert. Provide detailed information about food ingredients, including their health benefits and potential concerns. Keep the response concise but informative."
          },
          {
            role: "user",
            content: `Provide detailed information about ${ingredient} as a food ingredient. Include:
            1. What it is
            2. Its main health benefits
            3. Any potential health concerns
            4. Common uses in food
            Format the response in clear paragraphs.`
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const details = response.choices[0]?.message?.content || 'No detailed information available for this ingredient.';
      setIngredientDetails(details);
    } catch (error) {
      console.error('Error fetching ingredient details:', error);
      setIngredientDetails('Error fetching ingredient details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIngredientClick = (ingredient: string) => {
    setSelectedIngredient(ingredient);
    getIngredientDetails(ingredient);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (!analysis || !imageUrl) {
        throw new Error('Missing analysis data or image');
      }

      console.log('Starting save process...');
      const savedData = await saveAnalysis(analysis, imageUrl);
      console.log('Analysis saved successfully:', savedData);
      
      setIsSaved(true);
      setShowSaveDialog(false);
      
      // Show success message and redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving analysis:', error);
      setSaveError(
        error instanceof Error 
          ? error.message 
          : 'Failed to save analysis. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full bg-white shadow-sm z-50"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-center text-gray-900">
              {analysis.productName}
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSaveDialog(true)}
                disabled={isSaved}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaved
                    ? 'bg-green-50 text-green-600'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Analysis</span>
                  </>
                )}
              </button>
              <button
                onClick={downloadAsPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={downloadAsImage}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Share2 className="w-4 h-4" />
                <span>Image</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Save Confirmation Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-4">Save Analysis Results</h3>
            <p className="text-gray-600 mb-6">
              Do you want to save this analysis to your history? You'll be able to access it later from your dashboard.
            </p>
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">
                {saveError}
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Analysis</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Success Toast */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Analysis saved successfully!</span>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4" id="results-content">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Original Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-1/3"
            >
              <div className="sticky top-24">
                <div className="bg-white rounded-2xl p-4 shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Original Food Label</h2>
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Food Label"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Analysis Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:w-2/3"
            >
              {/* Product Name */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg mb-6"
              >
                <h1 className="text-3xl font-bold text-gray-900">{analysis.productName}</h1>
                <div className={`text-2xl font-bold ${getScoreColor(healthScore)} mt-2`}>
                  Health Score: {healthScore}/100
                </div>
              </motion.section>

              {/* Ingredients Breakdown */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Ingredients Analysis</h2>
                  <div className="flex items-center space-x-2">
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">Healthy</span>
                    <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full ml-2"></span>
                    <span className="text-sm text-gray-600">Moderate</span>
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full ml-2"></span>
                    <span className="text-sm text-gray-600">Concerning</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {analysis.ingredients.list.map((ingredient, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getIngredientColor(ingredient)}`}
                    >
                      <span className="font-medium">{ingredient}</span>
                      <button
                        onClick={() => handleIngredientClick(ingredient)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="View ingredient details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Ingredient Details Modal */}
                {selectedIngredient && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                      <h3 className="text-xl font-bold mb-4">{selectedIngredient}</h3>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <div className="prose max-w-none mb-6">
                          <p className="text-gray-600 whitespace-pre-line">{ingredientDetails}</p>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedIngredient(null);
                          setIngredientDetails('');
                        }}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Preservatives & Additives */}
                {(analysis.ingredients.preservatives.length > 0 || analysis.ingredients.additives.length > 0) && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Preservatives & Additives</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.ingredients.preservatives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Preservatives</h4>
                          {analysis.ingredients.preservatives.map((preservative, index) => (
                            <div key={index} className="p-3 bg-red-50 rounded-lg text-red-800 border border-red-200">
                              {preservative}
                            </div>
                          ))}
                        </div>
                      )}
                      {analysis.ingredients.additives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-700">Additives</h4>
                          {analysis.ingredients.additives.map((additive, index) => (
                            <div key={index} className="p-3 bg-yellow-50 rounded-lg text-yellow-800 border border-yellow-200">
                              {additive}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.section>

              {/* Nutritional Information */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg mb-6"
              >
                <h2 className="text-2xl font-bold mb-6">Nutritional Information</h2>
                <p className="text-sm text-gray-600 mb-4">Serving Size: {analysis.nutritionalInfo.servingSize}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Apple className="w-6 h-6 text-red-500 mb-2" />
                    <span className="text-sm text-gray-600">Calories</span>
                    <span className="text-xl font-bold">{analysis.nutritionalInfo.perServing.calories}</span>
                    <span className="text-xs text-gray-500">kcal</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Droplet className="w-6 h-6 text-blue-500 mb-2" />
                    <span className="text-sm text-gray-600">Protein</span>
                    <span className="text-xl font-bold">{analysis.nutritionalInfo.perServing.protein}</span>
                    <span className="text-xs text-gray-500">g</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Droplet className="w-6 h-6 text-yellow-500 mb-2" />
                    <span className="text-sm text-gray-600">Carbs</span>
                    <span className="text-xl font-bold">{analysis.nutritionalInfo.perServing.carbs}</span>
                    <span className="text-xs text-gray-500">g</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Droplet className="w-6 h-6 text-green-500 mb-2" />
                    <span className="text-sm text-gray-600">Fats</span>
                    <span className="text-xl font-bold">{analysis.nutritionalInfo.perServing.fats.total}</span>
                    <span className="text-xs text-gray-500">g</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Droplet className="w-6 h-6 text-pink-500 mb-2" />
                    <span className="text-sm text-gray-600">Sugar</span>
                    <span className="text-xl font-bold">{analysis.nutritionalInfo.perServing.sugar}</span>
                    <span className="text-xs text-gray-500">g</span>
                  </div>
                </div>
              </motion.section>

              {/* Alerts */}
              {analysis.allergens.declared.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-red-50 rounded-2xl p-6 shadow-lg mb-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-red-900">Alerts</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-red-800 mb-2">Declared Allergens</h3>
                      <ul className="list-disc list-inside text-red-700">
                        {analysis.allergens.declared.map((allergen, index) => (
                          <li key={index}>{allergen}</li>
                        ))}
                      </ul>
                    </div>
                    {analysis.allergens.mayContain.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-red-800 mb-2">May Contain</h3>
                        <ul className="list-disc list-inside text-red-700">
                          {analysis.allergens.mayContain.map((allergen, index) => (
                            <li key={index}>{allergen}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.section>
              )}

              {/* Storage & Manufacturer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h2 className="text-2xl font-bold mb-6">Storage & Handling</h2>
                  <div className="space-y-4">
                    {analysis.storage.instructions.map((instruction, index) => (
                      <p key={index} className="text-gray-700">{instruction}</p>
                    ))}
                    <p className="text-sm text-gray-600">
                      Best Before: {analysis.storage.bestBefore}
                    </p>
                  </div>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 shadow-lg"
                >
                  <h2 className="text-2xl font-bold mb-6">Manufacturer Information</h2>
                  <div className="space-y-2">
                    <p className="font-semibold">{analysis.manufacturer.name}</p>
                    <p className="text-gray-700">{analysis.manufacturer.address}</p>
                    {analysis.manufacturer.contact && (
                      <p className="text-gray-600">{analysis.manufacturer.contact}</p>
                    )}
                  </div>
                </motion.section>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Results;