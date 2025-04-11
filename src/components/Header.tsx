import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Settings } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onGetStarted?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle click outside mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Handle smooth scrolling for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isLandingPage = location.pathname === '/';

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = isLandingPage
    ? [
        { label: 'Features', href: '#features' },
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
      ]
    : [
        { label: 'Overview', href: '/dashboard' },
        { label: 'Analysis', href: '/scan' },
        { label: 'History', href: '/history' },
      ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
      style={{
        background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.96))',
        height: isScrolled ? '60px' : '70px',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-[5%] h-full">
        <nav className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link
            to="/"
            className="text-[#2A3342] text-2xl font-semibold"
            aria-label="NutriDecode+ Home"
          >
            NutriDecode+
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              // Authenticated navigation
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/preferences"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/preferences')
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  <Settings className="w-5 h-5 mr-1" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Sign Out
                </button>
              </>
            ) : isLandingPage ? (
              // Landing page navigation
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:underline decoration-2 underline-offset-4"
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleGetStarted}
                  className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5]"
                  aria-label="Get Started"
                >
                  Get Started
                </button>
              </>
            ) : (
              // Unauthenticated user button
              <Link
                to="/auth"
                className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5]"
                aria-label="Sign In"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className={`md:hidden fixed inset-x-0 top-[60px] bg-white transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
          role="menu"
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="px-4 py-6 space-y-4">
            {user ? (
              // Authenticated mobile navigation
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`block text-gray-700 hover:text-gray-900 font-medium py-2 ${
                      isActive(item.href) ? 'text-green-600' : ''
                    }`}
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/preferences"
                  className={`block text-gray-700 hover:text-gray-900 font-medium py-2 ${
                    isActive('/preferences') ? 'text-green-600' : ''
                  }`}
                  role="menuitem"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-red-600 font-medium py-2"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </>
            ) : isLandingPage ? (
              // Landing page mobile navigation
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="block text-gray-700 hover:text-gray-900 font-medium py-2"
                    role="menuitem"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleGetStarted();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors duration-200"
                  role="menuitem"
                >
                  Get Started
                </button>
              </>
            ) : (
              // Unauthenticated mobile navigation
              <Link
                to="/auth"
                className="block text-center bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#4338CA] transition-colors duration-200"
                role="menuitem"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;