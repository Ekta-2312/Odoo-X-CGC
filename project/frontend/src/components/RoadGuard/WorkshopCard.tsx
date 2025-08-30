import React from 'react';
import { Star, MapPin, Clock, Phone } from 'lucide-react';

interface WorkshopCardProps {
  workshop: {
    id: number;
    name: string;
    distance: string;
    rating: number;
    reviews: number;
    services: string[];
    status: string;
    image: string;
  };
  viewMode: 'list' | 'grid' | 'map';
  onClick: () => void;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, viewMode, onClick }) => {
  if (viewMode === 'map') {
    return (
      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6 text-center">
        <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <p className="text-blue-800 font-medium">Map View</p>
        <p className="text-sm text-blue-600">Interactive map with workshop locations</p>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl card-shadow cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
        viewMode === 'grid' ? 'p-3' : 'p-4'
      }`}
    >
      <div className={`flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row'} space-x-0 ${viewMode === 'list' ? 'space-x-4' : ''}`}>
        <div className={`${viewMode === 'grid' ? 'w-full h-24 mb-3' : 'w-16 h-16'} bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg flex items-center justify-center`}>
          <div className="text-blue-600 font-bold text-lg">{workshop.name.charAt(0)}</div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className={`font-semibold text-gray-800 ${viewMode === 'grid' ? 'text-sm' : 'text-base'}`}>
              {workshop.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              workshop.status === 'Available' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}>
              {workshop.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className={`font-medium text-gray-800 ${viewMode === 'grid' ? 'text-sm' : ''}`}>
              {workshop.rating}
            </span>
            <span className={`text-gray-600 ${viewMode === 'grid' ? 'text-xs' : 'text-sm'}`}>
              ({workshop.reviews})
            </span>
            <span className="text-gray-400">•</span>
            <span className={`text-gray-600 ${viewMode === 'grid' ? 'text-xs' : 'text-sm'}`}>
              {workshop.distance}
            </span>
          </div>
          
          {viewMode === 'list' && (
            <div className="flex flex-wrap gap-1 mb-3">
              {workshop.services.slice(0, 2).map((service) => (
                <span key={service} className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                  {service}
                </span>
              ))}
              {workshop.services.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                  +{workshop.services.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkshopCard;
