import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Car, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SplashScreen: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen gradient-primary flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white rounded-full"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 border border-white rounded-full"></div>
        <div className="absolute top-1/2 right-8 w-16 h-16 border border-white rounded-full"></div>
      </div>
      
      <div className="relative z-10 text-center space-y-8">
        {/* Logo Animation */}
        <motion.div 
          className="flex items-center justify-center space-x-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Shield className="w-20 h-20 text-white" />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Car className="w-10 h-10 text-orange-300" />
            </motion.div>
          </div>
        </motion.div>
        
        {/* Title Animation */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold text-shadow">RoadGuard</h1>
          <p className="text-xl font-light text-blue-100">Help is on the way!</p>
          <div className="flex items-center justify-center space-x-2 text-blue-200">
            <Zap className="w-5 h-5" />
            <span className="text-lg font-medium">Smart Roadside Assistance</span>
          </div>
        </motion.div>
        
        {/* Loading Animation */}
        <motion.div 
          className="flex space-x-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div 
              key={i}
              className="w-3 h-3 bg-white rounded-full"
              animate={{ y: [-10, 0, -10] }}
              transition={{ duration: 1, repeat: Infinity, delay }}
            />
          ))}
        </motion.div>
      </div>
      
      {/* Bottom Text */}
      <motion.div 
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-blue-100 text-sm">Powered by AI • Available 24/7</p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
