import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Car, Globe, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AuthScreen: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const navigate = useNavigate();

  const content = {
    en: {
      title: 'Welcome to RoadGuard',
      subtitle: 'Smart Roadside Assistance Platform',
      description: 'Get instant help from verified mechanics near you',
      signInButton: 'Sign in with Google',
      features: [
        '24/7 Emergency Support',
        'Verified Mechanics',
        'Real-time Tracking',
        'Secure Payments'
      ]
    },
    hi: {
      title: 'RoadGuard में आपका स्वागत है',
      subtitle: 'स्मार्ट रोडसाइड असिस्टेंस प्लेटफॉर्म',
      description: 'अपने आस-पास के सत्यापित मैकेनिक से तुरंत सहायता प्राप्त करें',
      signInButton: 'Google के साथ साइन इन करें',
      features: [
        '24/7 आपातकालीन सहायता',
        'सत्यापित मैकेनिक',
        'रियल-टाइम ट्रैकिंग',
        'सुरक्षित भुगतान'
      ]
    }
  };

  const handleGoogleSignIn = () => {
    toast.success('Redirecting to Google authentication...');
    // Redirect to your backend Google auth endpoint
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex flex-col">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center space-x-2 bg-white rounded-full p-1 shadow-md">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              language === 'hi' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
          >
            हिं
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-12 h-12 text-blue-600" />
              </motion.div>
              <Car className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {content[language].title}
            </h1>
            <p className="text-gray-600 mb-1">{content[language].subtitle}</p>
            <p className="text-sm text-gray-500">{content[language].description}</p>
          </motion.div>

          {/* Auth Card */}
          <motion.div 
            className="bg-white rounded-2xl card-shadow-lg p-8 space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Features */}
            <div className="space-y-3">
              {content[language].features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Google Sign In */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold shadow hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:scale-[1.02]"
              >
                <img 
                  src="https://www.svgrepo.com/show/475656/google-color.svg" 
                  alt="Google" 
                  className="w-5 h-5" 
                />
                {content[language].signInButton}
              </button>
            </motion.div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>

          {/* Bottom Features */}
          <motion.div 
            className="mt-8 grid grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {[
              { icon: Shield, label: 'Secure', color: 'text-blue-600' },
              { icon: Zap, label: 'Fast', color: 'text-orange-500' },
              { icon: Globe, label: 'Reliable', color: 'text-green-600' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                <p className="text-sm font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
