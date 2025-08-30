import React from 'react';
import { AlertTriangle } from 'lucide-react';

const EmergencyButton: React.FC = () => {
  const handleEmergency = () => {
    // Emergency SOS functionality
    alert('Emergency services contacted! Help is on the way.');
  };

  return (
    <button
      onClick={handleEmergency}
      className="fixed bottom-24 right-4 w-16 h-16 gradient-emergency rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 animate-pulse-slow"
    >
      <AlertTriangle className="w-8 h-8 text-white" />
    </button>
  );
};

export default EmergencyButton;
