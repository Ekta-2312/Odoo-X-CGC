import React from 'react';
import { MapPin, Bell, Globe } from 'lucide-react';

const LocationHeader: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-gray-800">Current Location</p>
            <p className="text-xs text-gray-600">Andheri East, Mumbai</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-gray-100 rounded-lg relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">3</span>
            </div>
          </button>
          
          <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
            <Globe className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">EN</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationHeader;
