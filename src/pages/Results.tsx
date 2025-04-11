import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  AlertTriangle,
  Download,
  Info,
  Save,
  Check,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Cookie,
  ShieldAlert,
  Leaf,
  Heart,
  ChevronRight,
  Image,
  X,
  Loader2
} from 'lucide-react';
import type { AnalysisResult } from '../services/openai';
import type { PreferenceBasedAnalysis } from '../services/analysis';
import { saveAnalysis } from '../services/supabase';
import { analyzeWithPreferences, getDetailedIngredientAnalysis } from '../services/analysis';
import { getUserPreferences } from '../services/preferences';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '../components/Header';
import VoiceoverButton from '../components/VoiceoverButton';
import AnalysisVoiceover from '../components/AnalysisVoiceover';

interface Alert {
  type: 'warning' | 'danger';
  message: string;
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<PreferenceBasedAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [ingredientDetails, setIngredientDetails] = useState<string | null>(null);
  const [isLoadingIngredient, setIsLoadingIngredient] = useState(false);
  const [ingredientError, setIngredientError] = useState<string | null>(null);

  useEffect(() => {
    if (!location.state?.analysis || !location.state?.imageUrl) {
      navigate('/scan');
      return;
    }

    setImageUrl(location.state.imageUrl);
    
    const enhanceAnalysis = async () => {
      try {
        setIsLoading(true);
        const preferences = await getUserPreferences();
        const enhancedAnalysis = await analyzeWithPreferences(location.state.analysis, preferences || undefined);
        setAnalysis(enhancedAnalysis);
      } catch (error) {
        console.error('Error enhancing analysis:', error);
        setAnalysis(location.state.analysis as PreferenceBasedAnalysis);
      } finally {
        setIsLoading(false);
      }
    };

    enhanceAnalysis();
  }, [location.state, navigate]);

  const handleSave = async () => {
    if (!analysis || !imageUrl) {
      setSaveError('Missing analysis data');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveAnalysis(analysis, imageUrl);
      setIsSaved(true);
      setShowSaveDialog(false);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving analysis:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadAsPDF = async () => {
    const element = document.getElementById('results-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
    pdf.save(`${analysis?.productName}-analysis.pdf`);
  };

  const downloadAsImage = async () => {
    const element = document.getElementById('results-content');
    if (!element) return;
    
    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `${analysis?.productName}-analysis.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleIngredientClick = async (ingredient: string) => {
    setSelectedIngredient(ingredient);
    setIngredientDetails(null);
    setIngredientError(null);
    setIsLoadingIngredient(true);

    try {
      const preferences = await getUserPreferences();
      const details = await getDetailedIngredientAnalysis(ingredient, preferences);
      setIngredientDetails(details);
    } catch (error) {
      console.error('Error getting ingredient details:', error);
      setIngredientError(
        error instanceof Error 
          ? error.message 
          : 'Failed to fetch ingredient details. Please try again.'
      );
    } finally {
      setIsLoadingIngredient(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16">
        {/* Breadcrumbs */}
        <div className="max-w-7xl mx-auto px-4 mb-6">
          <nav className="flex items-center text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-gray-900">
              Home
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <button onClick={() => navigate('/scan')} className="hover:text-gray-900">
              Scan
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900">Analysis Results</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Image */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <img 
                    src={imageUrl} 
                    alt="Food Label" 
                    className="w-full rounded-lg shadow-sm mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={downloadAsPDF}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      PDF
                    </button>
                    <button
                      onClick={downloadAsImage}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      <Image className="w-5 h-5 mr-2" />
                      Image
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Analysis Results */}
            <div className="lg:w-2/3" id="results-content">
              {/* Save Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={isSaving || isSaved}
                  className={`flex items-center px-6 py-2 rounded-lg ${
                    isSaved
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : isSaved ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Analysis
                    </>
                  )}
                </button>
              </div>

              {/* Product Name and Health Score */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{analysis.productName}</h1>
                  <AnalysisVoiceover analysis={analysis} />
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <h2 className="text-lg font-medium text-gray-700 mb-1">Health Score</h2>
                    <div className="text-4xl font-bold text-primary">
                      {healthScore}/100
                    </div>
                  </div>
                  {analysis.metadata?.processingTimeMs && (
                    <div className="text-sm text-gray-500">
                      Analyzed in {Math.round(analysis.metadata.processingTimeMs / 1000)}s
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients Analysis */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Ingredients Analysis</h2>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-sm">Healthy</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-sm">Moderate</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-sm">Concerning</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {analysis.ingredients.list.map((ingredient, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getIngredientColor(ingredient)} flex items-center justify-between`}
                    >
                      <span>{ingredient}</span>
                      <button
                        onClick={() => handleIngredientClick(ingredient)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nutritional Information */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Nutritional Information</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">Calories</div>
                    <div className="text-xl font-semibold">{analysis.nutritionalInfo.perServing.calories}</div>
                    <div className="text-xs text-gray-500">kcal</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">Protein</div>
                    <div className="text-xl font-semibold">{analysis.nutritionalInfo.perServing.protein}</div>
                    <div className="text-xs text-gray-500">g</div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-sm text-gray-600">Carbs</div>
                    <div className="text-xl font-semibold">{analysis.nutritionalInfo.perServing.carbs}</div>
                    <div className="text-xs text-gray-500">g</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">Fat</div>
                    <div className="text-xl font-semibold">{analysis.nutritionalInfo.perServing.fats.total}</div>
                    <div className="text-xs text-gray-500">g</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <div className="text-sm text-gray-600">Sugar</div>
                    <div className="text-xl font-semibold">{analysis.nutritionalInfo.perServing.sugar}</div>
                    <div className="text-xs text-gray-500">g</div>
                  </div>
                </div>
              </div>

              {/* Allergens */}
              {(analysis.allergens.declared.length > 0 || analysis.allergens.mayContain.length > 0) && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                    Allergen Information
                  </h2>
                  <div className="space-y-4">
                    {analysis.allergens.declared.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">Declared Allergens:</h3>
                        <div className="space-y-2">
                          {analysis.allergens.declared.map((allergen, index) => (
                            <div key={index} className="p-3 bg-red-50 text-red-700 rounded-lg">
                              {allergen}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {analysis.allergens.mayContain.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-2">May Contain:</h3>
                        <div className="space-y-2">
                          {analysis.allergens.mayContain.map((allergen, index) => (
                            <div key={index} className="p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                              {allergen}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Storage & Handling */}
              {analysis.storage && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Storage & Handling</h2>
                  <div className="text-gray-600">
                    {analysis.storage.instructions.map((instruction, index) => (
                      <p key={index}>{instruction}</p>
                    ))}
                    {analysis.storage.bestBefore && (
                      <p className="mt-2">Best Before: {analysis.storage.bestBefore}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Manufacturer Information */}
              {analysis.manufacturer && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Manufacturer Information</h2>
                  <div className="text-gray-600">
                    <p>{analysis.manufacturer.name}</p>
                    <p>{analysis.manufacturer.address}</p>
                    {analysis.manufacturer.contact && (
                      <p className="mt-2">{analysis.manufacturer.contact}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Ingredient Details Modal */}
      {selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden flex flex-col">
            {/* Header with logo, title and controls */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="NutriDecode Logo" 
                  className="h-8 w-auto mr-3"
                />
                <h3 className="text-xl font-bold text-white">
                  Ingredient Analysis
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const modal = document.getElementById('ingredient-modal');
                    if (modal) {
                      modal.classList.toggle('h-screen');
                      modal.classList.toggle('max-h-[80vh]');
                    }
                  }}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                  title="Toggle window size"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    setSelectedIngredient(null);
                    setIngredientDetails(null);
                    setIngredientError(null);
                  }}
                  className="p-2 text-white hover:text-gray-200 transition-colors"
                  title="Close window"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div 
              id="ingredient-modal"
              className="flex flex-col max-h-[80vh] transition-all duration-300 ease-in-out"
            >
              <div className="p-6 overflow-y-auto flex-grow">
                <div className="mb-6">
                  <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                    {selectedIngredient}
                  </h4>
                  {ingredientDetails && !isLoadingIngredient && !ingredientError && (
                    <div className="mb-4">
                      <VoiceoverButton text={ingredientDetails} />
                    </div>
                  )}
                </div>

                <div className="prose max-w-none">
                  {isLoadingIngredient ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : ingredientError ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{ingredientError}</span>
                    </div>
                  ) : ingredientDetails ? (
                    <div className="space-y-6">
                      {ingredientDetails.split('\n\n').map((section, index) => {
                        const [title, ...content] = section.split('\n');
                        if (title.startsWith('1.')) {
                          return (
                            <div key={index} className="p-4 bg-blue-50 rounded-lg">
                              <h5 className="font-semibold text-blue-900 mb-2">{title.substring(3)}</h5>
                              <p className="text-blue-800">{content.join('\n')}</p>
                            </div>
                          );
                        } else if (title.startsWith('2.')) {
                          return (
                            <div key={index} className="p-4 bg-green-50 rounded-lg">
                              <h5 className="font-semibold text-green-900 mb-2">{title.substring(3)}</h5>
                              <p className="text-green-800">{content.join('\n')}</p>
                            </div>
                          );
                        } else if (title.startsWith('3.')) {
                          return (
                            <div key={index} className="p-4 bg-yellow-50 rounded-lg">
                              <h5 className="font-semibold text-yellow-900 mb-2">{title.substring(3)}</h5>
                              <p className="text-yellow-800">{content.join('\n')}</p>
                            </div>
                          );
                        } else if (title.startsWith('4.')) {
                          return (
                            <div key={index} className="p-4 bg-purple-50 rounded-lg">
                              <h5 className="font-semibold text-purple-900 mb-2">{title.substring(3)}</h5>
                              <p className="text-purple-800">{content.join('\n')}</p>
                            </div>
                          );
                        } else if (title.startsWith('5.')) {
                          return (
                            <div key={index} className="p-4 bg-teal-50 rounded-lg">
                              <h5 className="font-semibold text-teal-900 mb-2">{title.substring(3)}</h5>
                              <p className="text-teal-800">{content.join('\n')}</p>
                            </div>
                          );
                        } else if (title.startsWith('6.')) {
                          return (
                            <div key={index} className="p-4 bg-rose-50 rounded-lg">
                              <h5 className="font-semibold text-rose-900 mb-2">{title.substring(3)}</h5>
                              <p className="text-rose-800">{content.join('\n')}</p>
                            </div>
                          );
                        }
                        return (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-800">{section}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Analysis</h3>
            <p className="text-gray-600 mb-6">
              This will save the analysis to your history for future reference.
            </p>
            {saveError && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <span>{saveError}</span>
              </div>
            )}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;