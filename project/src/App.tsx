import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Scan,
  AlertTriangle,
  Leaf,
  AlertOctagon,
  Apple,
  Timer,
  ChevronDown,
  Play,
  Check,
  ArrowRight,
  Star,
  Users,
  Award,
  Sparkles,
  Brain,
  Utensils,
  CreditCard,
  Shield,
  Zap,
  Plus,
  Minus,
} from 'lucide-react';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/Scan';
import Results from './pages/Results';
import ProtectedRoute from './components/ProtectedRoute';
import { supabase } from './lib/supabase';

function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqs, setOpenFaqs] = useState<number[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const features = [
    {
      icon: <Scan className="w-8 h-8 text-primary" />,
      title: "Instant Food Recognition",
      description: "Advanced AI scanning identifies ingredients in seconds with 99.9% accuracy",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=100",
      stats: { scans: "10M+", accuracy: "99.9%" }
    },
    {
      icon: <AlertTriangle className="w-8 h-8 text-secondary" />,
      title: "Allergen Safety Guard",
      description: "Real-time allergen detection keeps you and your family safe",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920&q=100",
      stats: { allergens: "200+", alerts: "24/7" }
    },
    {
      icon: <Leaf className="w-8 h-8 text-primary" />,
      title: "Sustainability Tracker",
      description: "Make eco-conscious choices with our environmental impact scoring",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1920&q=100",
      stats: { impact: "45%↓", saved: "12T CO2" }
    },
    {
      icon: <AlertOctagon className="w-8 h-8 text-secondary" />,
      title: "Additive Detective",
      description: "Identify harmful additives and artificial ingredients instantly",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1920&q=100",
      stats: { database: "5000+", updates: "Daily" }
    },
    {
      icon: <Apple className="w-8 h-8 text-primary" />,
      title: "Nutrition Insights",
      description: "Detailed nutritional breakdown with personalized recommendations",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1920&q=100",
      stats: { metrics: "50+", accuracy: "98%" }
    },
    {
      icon: <Timer className="w-8 h-8 text-secondary" />,
      title: "Freshness Monitor",
      description: "Smart expiration tracking and food storage recommendations",
      image: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?w=1920&q=100",
      stats: { saved: "$400/yr", waste: "60%↓" }
    },
  ];

  const steps = [
    {
      number: '01',
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Unlock Food Intelligence",
      description: "Transform your smartphone into a powerful food analysis tool. Simply open the app and point your camera at any food item to begin your journey to healthier choices.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1024&q=100",
      achievement: "Join 1M+ users making informed decisions daily",
      stats: { speed: "2 sec", accuracy: "99.9%" }
    },
    {
      number: '02',
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: "Instant AI Analysis",
      description: "Watch as our advanced AI instantly decodes ingredients, nutrition facts, and potential concerns. Get real-time insights backed by our database of over 1 million products.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1024&q=100",
      achievement: "Access insights from 1M+ product database",
      stats: { database: "1M+", updates: "Real-time" }
    },
    {
      number: '03',
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Personalized Guidance",
      description: "Receive tailored recommendations based on your dietary preferences and health goals. Make confident decisions with clear, actionable insights at your fingertips.",
      image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1024&q=100",
      achievement: "95% of users report healthier choices",
      stats: { satisfaction: "95%", goals: "Achieved" }
    }
  ];

  const benefits = [
    'Make healthier food choices with confidence',
    'Save time reading complex labels',
    'Avoid allergens and harmful additives',
    'Track your nutrition goals effortlessly',
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Nutrition Expert',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      quote: 'NutriDecode+ has revolutionized how my clients approach food choices.',
    },
    {
      name: 'Michael Chen',
      role: 'Health Enthusiast',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      quote: 'This app has made healthy eating so much easier for my family.',
    },
  ];

  const stats = [
    { icon: <Users className="w-6 h-6" />, value: '1M+', label: 'Active Users' },
    { icon: <Star className="w-6 h-6" />, value: '4.9', label: 'App Store Rating' },
    { icon: <Award className="w-6 h-6" />, value: '50+', label: 'Industry Awards' },
  ];

  const pricingTiers = [
    {
      name: "Healthy Start",
      description: "Perfect for health-conscious individuals",
      monthlyPrice: 4.99,
      yearlyPrice: 49.99,
      features: [
        "Unlimited food scans",
        "Basic nutritional analysis",
        "Allergen alerts",
        "7-day meal history",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Wellness Pro",
      description: "Advanced features for nutrition enthusiasts",
      monthlyPrice: 9.99,
      yearlyPrice: 99.99,
      features: [
        "Everything in Healthy Start",
        "Detailed ingredient breakdown",
        "Personalized recommendations",
        "30-day meal history",
        "Premium support",
        "Family account sharing",
      ],
      cta: "Get Started",
      popular: true,
    }
  ];

  const paymentMethods = [
    { name: "Visa", icon: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100" },
    { name: "Mastercard", icon: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100" },
    { name: "Apple Pay", icon: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100" },
    { name: "Google Pay", icon: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100" },
  ];

  const faqs = [
    {
      question: 'How accurate is the food scanning technology?',
      answer: 'Our AI-powered scanning technology achieves 99.9% accuracy through advanced machine learning algorithms and continuous training on millions of food items. The system is regularly updated with new data to maintain and improve accuracy.',
    },
    {
      question: 'Does the app work without an internet connection?',
      answer: 'Yes, basic scanning features work offline. However, for real-time nutritional analysis, allergen alerts, and detailed ingredient information, an internet connection is required to access our comprehensive database.',
    },
    {
      question: 'How do you handle food allergies and dietary restrictions?',
      answer: 'NutriDecode+ maintains an extensive database of allergens and dietary restrictions. Users can set up personalized alerts for specific ingredients or nutritional concerns. Our system provides immediate warnings when scanning products containing flagged ingredients.',
    },
    {
      question: 'What makes NutriDecode+ different from other food scanning apps?',
      answer: 'NutriDecode+ combines advanced AI technology, real-time analysis, and personalized recommendations in one seamless experience. Our unique features include allergen detection, sustainability scoring, and detailed nutritional insights backed by scientific research.',
    },
    {
      question: 'Is my personal health data secure?',
      answer: 'Absolutely. We employ industry-leading encryption standards and strict privacy protocols to protect your data. Your personal information is never shared with third parties without explicit consent, and you maintain full control over your data preferences.',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-light">
      <ScrollProgress />
      <Header onGetStarted={handleGetStarted} />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center geometric-pattern pt-[70px]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent" />
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative">
          <div className="md:w-1/2 space-y-6 animate-slide-up">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              Decode Your Food.
              <br />
              Empower Your Choices.
            </h1>
            <p className="text-xl text-gray-600">
              Instant food analysis powered by AI - scan, learn, and make healthier choices in seconds
            </p>
            <div className="space-x-4">
              <button onClick={handleGetStarted} className="btn-primary">Get Started</button>
              <button className="btn-secondary">Learn More</button>
            </div>
            <div className="flex space-x-4 mt-8">
              <img
                src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=120"
                alt="App Store"
                className="h-12 w-auto hover:scale-105 transition-transform duration-300"
              />
              <img
                src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=120"
                alt="Google Play"
                className="h-12 w-auto hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="floating">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500"
                alt="NutriDecode+ App"
                className="w-full max-w-md mx-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center justify-center space-x-4 p-6 rounded-xl bg-neutral-light">
                <div className="p-3 rounded-full bg-primary/10">{stat.icon}</div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Powerful Features for Healthy Living</h2>
          <p className="section-subtitle">
            Discover how NutriDecode+ transforms your food choices with cutting-edge technology
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="hero-image">
                  <img src={feature.image} alt={feature.title} />
                </div>
                <div className="icon-container">
                  {feature.icon}
                </div>
                <div className="content">
                  <h3 className="title">{feature.title}</h3>
                  <p className="description">{feature.description}</p>
                  <div className="stats">
                    {Object.entries(feature.stats).map(([key, value], i) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 capitalize">{key}:</span>
                        <span className="text-sm font-semibold text-primary">{value}</span>
                        {i < Object.entries(feature.stats).length - 1 && (
                          <span className="text-gray-300">|</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section id="how-it-works" className="section-padding bg-neutral-light relative overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Your Journey to Better Health</h2>
          <p className="section-subtitle">
            Experience the future of food intelligence in three simple steps
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="step-card group">
                <div className="step-number">
                  <span>{step.number}</span>
                </div>
                <div className="step-image">
                  <img src={step.image} alt={step.title} />
                  <div className="step-icon">
                    {step.icon}
                  </div>
                </div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                  <div className="step-achievement">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{step.achievement}</span>
                  </div>
                  <div className="step-stats">
                    {Object.entries(step.stats).map(([key, value], i) => (
                      <div key={key} className="stat-item">
                        <span className="stat-label">{key}</span>
                        <span className="stat-value">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="step-connector">
                    <ArrowRight className="w-6 h-6 text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                Why Choose NutriDecode+?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <img
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500"
                alt="App Demo"
                className="w-full rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-neutral-light">
        <div className="container mx-auto px-4">
          <h2 className="section-title">What Our Users Say</h2>
          <p className="section-subtitle">
            Join thousands of satisfied users making healthier choices every day
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full ring-2 ring-primary/20"
                  />
                  <div>
                    <h3 className="font-bold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 italic">{testimonial.quote}</p>
                <div className="flex mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section className="section-padding bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title">See It In Action</h2>
          <p className="section-subtitle">
            Watch how NutriDecode+ transforms your shopping experience
          </p>
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-w-16 aspect-h-9 bg-neutral-light rounded-2xl overflow-hidden group">
              <button className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white/90 group-hover:bg-white transition-colors duration-300">
                  <Play className="w-8 h-8 text-primary ml-1" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="section-padding bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-light/50 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">
            Choose the perfect plan for your healthy lifestyle
          </p>

          {/* Pricing Toggle */}
          <div className="flex justify-center items-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isYearly ? 'text-primary' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-14 h-7 bg-primary/20 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div
                className={`w-5 h-5 bg-primary rounded-full transition-transform duration-300 transform ${
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isYearly ? 'text-primary' : 'text-gray-500'}`}>
              Yearly <span className="text-xs text-secondary">(Save 20%)</span>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <div
                key={index}
                className={`pricing-card group ${tier.popular ? 'popular' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-secondary text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-gray-600">{tier.description}</p>
                </div>
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center">
                    <span className="text-4xl font-bold">$</span>
                    <span className="text-6xl font-bold">
                      {isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">
                    {isYearly ? 'per year' : 'per month'}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className={`w-full btn-${tier.popular ? 'primary' : 'secondary'}`}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 text-center">
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">30-day money back</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">Secure payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm text-gray-600">Instant access</span>
              </div>
            </div>
            <div className="flex justify-center items-center space-x-6">
              {paymentMethods.map((method, index) => (
                <img
                  key={index}
                  src={method.icon}
                  alt={method.name}
                  className="h-8 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Your food, decoded in seconds
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Join millions of users making healthier food choices with NutriDecode+
          </p>
          <button onClick={handleGetStarted} className="btn-primary bg-white text-primary hover:bg-white/90 transform hover:scale-105 transition-all duration-300">
            Get Started Now
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="section-padding bg-neutral-light">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Find answers to common questions about NutriDecode+
          </p>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="faq-item bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <span className="text-xl font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0 ml-4">
                    {openFaqs.includes(index) ? (
                      <Minus className="w-6 h-6 text-primary transition-transform duration-300" />
                    ) : (
                      <Plus className="w-6 h-6 text-primary transition-transform duration-300" />
                    )}
                  </div>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openFaqs.includes(index)
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      {isScrolled && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <button onClick={handleGetStarted} className="btn-primary flex items-center space-x-2 shadow-lg">
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <ScanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/results"
        element={
          <ProtectedRoute>
            <Results />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;