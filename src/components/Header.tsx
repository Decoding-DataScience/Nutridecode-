import { useState, useEffect } from 'react';
import { Menu, X, Settings, History, Home, Scan } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

interface HeaderProps {
  onGetStarted?: () => void;
  isLanding?: boolean;
}

const Header = ({ onGetStarted, isLanding = false }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navigationItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const appNavigationItems = [
    { name: 'Overview', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
    { name: 'Analyze', href: '/scan', icon: <Scan className="w-5 h-5" /> },
    { name: 'History', href: '/history', icon: <History className="w-5 h-5" /> },
    { name: 'Settings', href: '/preferences', icon: <Settings className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (!sectionId.startsWith('#')) {
      navigate(sectionId);
      return;
    }
    
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-lg' : 'bg-white/95'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <img 
              src={logo} 
              alt="NutriDecode+" 
              className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLanding ? (
              // Landing page navigation
              navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  {item.name}
                </button>
              ))
            ) : (
              // App navigation
              user && appNavigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white font-medium">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-medium hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-20 bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-2">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-4 py-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white font-medium">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="py-2 space-y-1">
                    {isLanding ? navigationItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => scrollToSection(item.href)}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        <span>{item.name}</span>
                      </button>
                    )) : appNavigationItems.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => scrollToSection(item.href)}
                        className={`w-full flex items-center space-x-2 px-4 py-2 rounded-lg ${
                          location.pathname === item.href
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-gray-50 rounded-lg"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 p-4">
                  {isLanding && navigationItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <span>{item.name}</span>
                    </button>
                  ))}
                  <Link
                    to="/auth"
                    className="block w-full text-center bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;