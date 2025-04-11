import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAnalysisHistory } from '../services/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import { LogOut, User as UserIcon, Bell, Settings, Clock } from 'lucide-react';

interface FoodAnalysis {
  id: string;
  created_at: string;
  product_name: string;
  image_url: string;
  analysis_result: any;
  ingredients_list?: string[];
  preservatives?: string[];
  additives?: string[];
  antioxidants?: string[];
  stabilizers?: string[];
  declared_allergens?: string[];
  may_contain_allergens?: string[];
  nutritional_info?: any;
  health_score: number;
  health_claims?: string[];
  packaging_materials?: string[];
  recycling_info?: string;
  sustainability_claims?: string[];
  certifications?: string[];
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [recentActivity, setRecentActivity] = useState<FoodAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    try {
      const history = await getAnalysisHistory();
      setRecentActivity(history.slice(0, 3)); // Get only the 3 most recent items
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleStartScanning = () => {
    navigate('/scan');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  const handleUpdatePreferences = () => {
    navigate('/preferences');
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleViewDetails = (item: FoodAnalysis) => {
    navigate('/results', {
      state: {
        analysis: {
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
        },
        imageUrl: item.image_url
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <ScrollProgress />
      
      {/* Dashboard Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="text-2xl font-bold text-primary">
              NutriDecode+
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/dashboard" className={`text-gray-600 hover:text-primary ${location.pathname === '/dashboard' ? 'text-primary' : ''}`}>Overview</Link>
              <Link to="/scan" className={`text-gray-600 hover:text-primary ${location.pathname === '/scan' ? 'text-primary' : ''}`}>Analysis</Link>
              <Link to="/history" className={`text-gray-600 hover:text-primary ${location.pathname === '/history' ? 'text-primary' : ''}`}>History</Link>
              <Link to="/preferences" className={`text-gray-600 hover:text-primary ${location.pathname === '/preferences' ? 'text-primary' : ''}`}>Settings</Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-primary rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="hidden md:block text-sm font-medium">
                  {user?.email?.split('@')[0]}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/preferences"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16">
        {/* Welcome Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.email?.split('@')[0]}!
            </h1>
            <p className="mt-2 text-white/90">
              Continue your journey to healthier food choices
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Scan Food</h3>
              <p className="text-gray-600">
                Instantly analyze any food item with our AI scanner
              </p>
              <button onClick={handleStartScanning} className="mt-4 btn-primary">
                Start Scanning
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">View History</h3>
              <p className="text-gray-600">
                Access your past scans and analysis results
              </p>
              <button onClick={handleViewHistory} className="mt-4 btn-secondary">
                View History
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Update Preferences</h3>
              <p className="text-gray-600">
                Customize your dietary preferences and alerts
              </p>
              <button onClick={handleUpdatePreferences} className="mt-4 btn-secondary">
                Update Now
              </button>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatTimeAgo(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewDetails(item)}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity. Start by scanning a food item!
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;