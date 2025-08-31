import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  BarChart3, 
  Settings, 
  Users, 
  Shield,
  Car,
  LogOut,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface SideNavigationProps {
  userType: 'mechanic' | 'admin' | 'user';
}

const SideNavigation: React.FC<SideNavigationProps> = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  // Mechanic: keep My Requests, include History; remove Settings
  const mechanicNavItems = [
    { id: 'requests', label: 'My Requests', icon: ClipboardList, path: '/mechanic?tab=requests' },
    { id: 'history', label: 'Service History', icon: BarChart3, path: '/mechanic?tab=history' }
  ];

  const adminNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin?tab=dashboard' },
  { id: 'requests', label: 'All Requests', icon: ClipboardList, path: '/admin?tab=requests' },
  { id: 'workers', label: 'Workers', icon: Users, path: '/admin?tab=workers' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin?tab=analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/admin?tab=settings' }
  ];

  const userNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/user' },
    { id: 'vehicles', label: 'My Vehicles', icon: Car, path: '/vehicles' },
    { id: 'requests', label: 'My Requests', icon: ClipboardList, path: '/history' },
  { id: 'track', label: 'Track Request', icon: MapPin, path: '/track' },
  ];

  const navItems = userType === 'mechanic' ? mechanicNavItems : (userType === 'admin' ? adminNavItems : userNavItems);

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-30 hidden lg:block">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Shield className="w-8 h-8 text-blue-600" />
            <Car className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">RoadGuard</h2>
            <p className="text-sm text-gray-600 capitalize">{userType} Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          let isActive = location.pathname === item.path;
          if (userType === 'mechanic') {
            const params = new URLSearchParams(location.search);
            const activeTab = params.get('tab') || 'requests';
            isActive = item.id === activeTab;
          } else if (userType === 'admin') {
            const params = new URLSearchParams(location.search);
            const activeTab = params.get('tab') || 'dashboard';
            isActive = item.id === activeTab;
          }
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-blue-600 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {userType === 'admin' && (
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SideNavigation;
