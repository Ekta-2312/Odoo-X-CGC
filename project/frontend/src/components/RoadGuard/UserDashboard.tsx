import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  AlertCircle, 
  Clock, 
  Star, 
  Filter, 
  Search, 
  Grid, 
  List, 
  Map as MapIcon,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import BottomNavigation from './BottomNavigation';
import LocationHeader from './LocationHeader';
import WorkshopCard from './WorkshopCard';
import EmergencyButton from './EmergencyButton';

const UserDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [filterDistance, setFilterDistance] = useState('5km');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const workshops = [
    {
      id: 1,
      name: 'AutoCare Plus',
      distance: '1.2 km',
      rating: 4.8,
      reviews: 120,
      services: ['Engine Repair', 'Towing', 'Battery'],
      status: 'Available',
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
      responseTime: '8 min'
    },
    {
      id: 2,
      name: 'QuickFix Motors',
      distance: '2.8 km',
      rating: 4.6,
      reviews: 85,
      services: ['Tire Service', 'Jump Start', 'Lockout'],
      status: 'Busy',
      image: 'https://images.pexels.com/photos/5835359/pexels-photo-5835359.jpeg',
      responseTime: '15 min'
    },
    {
      id: 3,
      name: 'RoadSide Heroes',
      distance: '4.1 km',
      rating: 4.9,
      reviews: 200,
      services: ['Emergency Repair', 'Towing', 'Fuel Delivery'],
      status: 'Available',
      image: 'https://images.pexels.com/photos/4489734/pexels-photo-4489734.jpeg',
      responseTime: '12 min'
    },
    {
      id: 4,
      name: 'Express Auto Service',
      distance: '3.5 km',
      rating: 4.7,
      reviews: 95,
      services: ['Quick Fix', 'Battery', 'Tire Change'],
      status: 'Available',
      image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
      responseTime: '10 min'
    }
  ];

  const quickStats = [
    { label: 'Avg Response', value: '12 min', icon: Clock, color: 'text-blue-600' },
    { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Available Now', value: '47', icon: Shield, color: 'text-orange-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <LocationHeader />
      
      <div className="px-4 py-6 pb-24">
        {/* Welcome Section */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, Amit!</h2>
          <p className="text-gray-600">How can we help you today?</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 card-shadow text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <motion.button
              onClick={() => navigate('/request')}
              className="gradient-primary text-white p-6 rounded-2xl card-shadow flex items-center justify-between group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-left">
                <h4 className="text-xl font-bold mb-1">Request Assistance</h4>
                <p className="text-blue-100">Get help from nearby mechanics</p>
                <div className="flex items-center space-x-2 mt-2">
                  <Zap className="w-4 h-4 text-orange-300" />
                  <span className="text-sm text-blue-200">AI-powered matching</span>
                </div>
              </div>
              <AlertCircle className="w-10 h-10 group-hover:animate-bounce" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/track')}
              className="bg-white border-2 border-orange-200 text-orange-600 p-4 rounded-xl card-shadow flex items-center justify-between hover:bg-orange-50 group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-left">
                <h4 className="font-semibold text-gray-800">Track Current Request</h4>
                <p className="text-sm text-gray-600">Monitor your service progress</p>
              </div>
              <Clock className="w-6 h-6 group-hover:animate-spin" />
            </motion.button>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </motion.div>

        {/* Workshop Listing */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Nearby Workshops</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Distance Filters */}
          <div className="flex space-x-3 mb-4 overflow-x-auto pb-2">
            {['2km', '5km', '10km', 'Custom'].map((distance) => (
              <button
                key={distance}
                onClick={() => setFilterDistance(distance)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                  filterDistance === distance
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
                }`}
              >
                {distance}
              </button>
            ))}
            <button className="px-4 py-2 rounded-full bg-white text-gray-600 border border-gray-200 flex items-center space-x-1 hover:border-blue-300 transition-colors">
              <Filter className="w-4 h-4" />
              <span>More</span>
            </button>
          </div>

          {/* Workshop List */}
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
            {workshops
              .filter(workshop => 
                searchQuery === '' || 
                workshop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                workshop.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
              )
              .map((workshop, index) => (
                <motion.div
                  key={workshop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <WorkshopCard
                    workshop={workshop}
                    viewMode={viewMode}
                    onClick={() => navigate(`/workshop/${workshop.id}`)}
                  />
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <button 
              onClick={() => navigate('/history')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="bg-white rounded-xl p-4 card-shadow">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Battery Jump Service</p>
                <p className="text-sm text-gray-600">Completed • AutoCare Plus • ₹500</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">2 days ago</p>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <EmergencyButton />
      <BottomNavigation activeTab="home" />
    </div>
  );
};

export default UserDashboard;
