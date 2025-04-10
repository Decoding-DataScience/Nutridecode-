import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalysisHistory } from '../services/supabase';
import { ArrowLeft, Clock, Download, Filter } from 'lucide-react';

interface FoodAnalysis {
  id: string;
  created_at: string;
  product_name: string;
  image_url: string;
  health_score: number;
  analysis_result: {
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
    nutritionalInfo: any;
    healthScore: number;
    healthClaims: string[];
    packaging: {
      materials: string[];
      recyclingInfo: string;
      sustainabilityClaims: string[];
      certifications: string[];
    };
  };
}

const History = () => {
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const history = await getAnalysisHistory();
      setAnalyses(history);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (analysis: FoodAnalysis) => {
    navigate('/results', { 
      state: { 
        analysis: analysis.analysis_result,
        imageUrl: analysis.image_url 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Filter className="w-5 h-5" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Analysis History</h1>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : analyses.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="grid grid-cols-1 divide-y">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                          {analysis.image_url && (
                            <img
                              src={analysis.image_url}
                              alt={analysis.product_name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{analysis.product_name}</h3>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatDate(analysis.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Health Score</div>
                          <div className="text-lg font-semibold">{analysis.health_score}/100</div>
                        </div>
                        <button
                          onClick={() => handleViewDetails(analysis)}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No analysis history found. Start by scanning some food items!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default History; 