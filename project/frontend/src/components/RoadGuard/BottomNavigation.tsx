import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Map, 
  User, 
  HelpCircle 
} from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/user' },
    { id: 'requests', label: 'Requests', icon: ClipboardList, path: '/track' },
    { id: 'map', label: 'Map', icon: Map, path: '/user' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user' },
    { id: 'help', label: 'Help', icon: HelpCircle, path: '/user' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
