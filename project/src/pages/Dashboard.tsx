import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import { LogOut, User as UserIcon, Bell, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-neutral-light">
      <ScrollProgress />
      
      {/* Dashboard Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <a href="/dashboard" className="text-2xl font-bold text-primary">
              NutriDecode+
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="#overview" className="text-gray-600 hover:text-primary">Overview</a>
              <a href="#analysis" className="text-gray-600 hover:text-primary">Analysis</a>
              <a href="#history" className="text-gray-600 hover:text-primary">History</a>
              <a href="#settings" className="text-gray-600 hover:text-primary">Settings</a>
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
                  <a
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profile Settings
                  </a>
                  <a
                    href="/preferences"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Preferences
                  </a>
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
              <button className="mt-4 btn-secondary">View History</button>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Update Preferences</h3>
              <p className="text-gray-600">
                Customize your dietary preferences and alerts
              </p>
              <button className="mt-4 btn-secondary">Update Now</button>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border-b last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100"></div>
                    <div>
                      <h4 className="font-medium">Food Item {index + 1}</h4>
                      <p className="text-sm text-gray-600">Scanned 2 hours ago</p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary/80">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;