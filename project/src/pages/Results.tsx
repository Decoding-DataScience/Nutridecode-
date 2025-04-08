import React, { useEffect } from 'react';
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
} from 'lucide-react';
import type { AnalysisResult } from '../services/openai';
import { saveAnalysis } from '../services/supabase';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis as AnalysisResult;
  const imageUrl = location.state?.imageUrl as string;

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

  if (!analysis) return null;

  const calculateHealthScore = () => {
    let score = 100; // Start with perfect score

    // Deduct points for additives and preservatives
    score -= (analysis.ingredients.additives.length * 3);
    score -= (analysis.ingredients.preservatives.length * 2);

    // Deduct points for allergens
    score -= (analysis.allergens.declared.length * 5);
    score -= (analysis.allergens.mayContain.length * 2);

    // Adjust based on nutritional balance
    const totalNutrients = analysis.nutritionalInfo.protein + 
                          analysis.nutritionalInfo.carbs + 
                          analysis.nutritionalInfo.fats;
    
    if (analysis.nutritionalInfo.sugar > totalNutrients * 0.2) {
      score -= 10; // High sugar penalty
    }

    if (analysis.nutritionalInfo.fats > totalNutrients * 0.4) {
      score -= 5; // High fat penalty
    }

    // Add points for health claims
    score += (analysis.healthClaims.length * 2);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full bg-white shadow-sm z-50"
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Product Name */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900">{analysis.productName}</h1>
          </motion.section>

          {/* Overview Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <div className={`text-3xl font-bold ${scoreColor}`}>
                {healthScore}/100
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="w-6 h-6 text-green-600" />
                  <h3 className="font-semibold text-lg">Health Score</h3>
                </div>
                <div className={`text-4xl font-bold ${scoreColor} mb-2`}>
                  {healthScore}
                </div>
                <p className="text-sm text-gray-600">
                  {healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Needs Improvement'}
                </p>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center space-x-3 mb-4">
                  <Scale className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-lg">Nutrition Balance</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(healthScore / 20)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on macro distribution
                </p>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 transform hover:scale-105 transition-transform">
                <div className="flex items-center space-x-3 mb-4">
                  <Leaf className="w-6 h-6 text-amber-600" />
                  <h3 className="font-semibold text-lg">Eco Impact</h3>
                </div>
                <p className="text-lg font-semibold text-amber-700 mb-2">
                  {analysis.packaging.sustainabilityClaims[0] || 'Not specified'}
                </p>
                <p className="text-sm text-gray-600">
                  {analysis.packaging.recyclingInfo || 'No recycling information available'}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Nutritional Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-6">Nutritional Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {[
                { icon: Apple, label: 'Calories', value: analysis.nutritionalInfo.calories, unit: 'kcal' },
                { icon: Droplet, label: 'Protein', value: analysis.nutritionalInfo.protein, unit: 'g' },
                { icon: Droplet, label: 'Carbs', value: analysis.nutritionalInfo.carbs, unit: 'g' },
                { icon: Droplet, label: 'Fats', value: analysis.nutritionalInfo.fats, unit: 'g' },
                { icon: Droplet, label: 'Sugar', value: analysis.nutritionalInfo.sugar, unit: 'g' },
              ].map(({ icon: Icon, label, value, unit }) => (
                <div
                  key={label}
                  className="bg-gray-50 rounded-xl p-4 transform hover:scale-105 transition-transform"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold">{label}</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {value}
                    <span className="text-sm text-gray-500 ml-1">{unit}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Serving Size */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Serving Size: {analysis.nutritionalInfo.servingSize}
            </div>
          </motion.section>

          {/* Alerts and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergens and Additives */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center space-x-2 mb-6">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold">Alerts</h2>
              </div>
              
              {/* Declared Allergens */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Declared Allergens</h3>
                <div className="space-y-2">
                  {analysis.allergens.declared.map((allergen, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-amber-50 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      <span>{allergen}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* May Contain Allergens */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">May Contain</h3>
                <div className="space-y-2">
                  {analysis.allergens.mayContain.map((allergen, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-amber-50/50 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-400" />
                      <span>{allergen}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additives */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Additives</h3>
                <div className="space-y-2">
                  {analysis.ingredients.additives.map((additive, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-purple-50 p-3 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-purple-500" />
                      <span>{additive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Health Claims and Recommendations */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex items-center space-x-2 mb-6">
                <Heart className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold">Health Insights</h2>
              </div>

              {/* Health Claims */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Health Claims</h3>
                <div className="space-y-2">
                  {analysis.healthClaims.map((claim, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-green-500" />
                      <span>{claim}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Healthier Alternatives */}
              <div>
                <h3 className="font-semibold text-lg mb-3">Healthier Alternatives</h3>
                <div className="space-y-2">
                  {analysis.alternatives.healthier.map((alternative, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-blue-500" />
                      <span>{alternative}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>
          </div>

          {/* Environmental Impact */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-6">
              <RecycleIcon className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold">Environmental Impact</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">Packaging</h3>
                <ul className="space-y-2">
                  {analysis.packaging.materials.map((material, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{material}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">Sustainability</h3>
                <ul className="space-y-2">
                  {analysis.packaging.sustainabilityClaims.map((claim, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{claim}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-lg mb-2">Sustainable Alternatives</h3>
                <ul className="space-y-2">
                  {analysis.alternatives.sustainable.map((alternative, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">{alternative}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Results;