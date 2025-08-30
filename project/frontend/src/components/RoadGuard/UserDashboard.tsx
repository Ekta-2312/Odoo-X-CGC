import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, Clock, Star, Search, Grid, List, Map as MapIcon, Shield, TrendingUp, Share, Phone, LogOut, User, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';

type MechanicItem = {
  id: string | number;
  name: string;
  mechanicName: string;
  distance: number;
  rating: number;
  reviews: number;
  services: string[];
  status: string;
  image: string;
  responseTime: string;
  phone: string;
  location: string;
  coordinates: [number, number];
  priceRange: string;
  experience: string;
  completedJobs: number;
  isOnline: boolean;
  workshopType: string;
  isVerified: boolean;
};

const UserDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [filterDistance, setFilterDistance] = useState('5km');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [mechanics, setMechanics] = useState<MechanicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Load mechanics from database
  useEffect(() => {
    loadMechanics();
  }, []);

  const loadMechanics = async () => {
    setLoading(true);
    try {
      const mechanicsData = await fetchMechanicsFromDatabase();
      setMechanics(mechanicsData);
    } catch (error) {
      toast.error('Failed to load mechanics');
    } finally {
      setLoading(false);
    }
  };

  const fetchMechanicsFromDatabase = async (): Promise<MechanicItem[]> => {
    try {
      const list = await api.get('/api/workshops');
      // Shape into UI-friendly items
      return list.map((m: any) => ({
        id: m.id,
        name: m.name || 'Workshop',
        mechanicName: m.name || 'Mechanic',
        distance: Math.random() * 5 + 0.5,
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)),
        reviews: Math.floor(Math.random() * 200) + 50,
        services: ['General Repair', 'Maintenance', 'Battery'],
        status: 'available',
        image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
        responseTime: `${Math.floor(Math.random() * 15) + 5} min`,
        phone: '+91 99999 99999',
        location: m.location?.address || 'Not specified',
        coordinates: [m.location?.latitude || 0, m.location?.longitude || 0],
        priceRange: '₹200-600',
        experience: '5 years',
        completedJobs: m.totalServices || Math.floor(Math.random() * 100) + 10,
        isOnline: Math.random() > 0.3,
        workshopType: 'Mobile Service',
        isVerified: !!m.isVerified,
      }));
    } catch (e) {
      // Fallback demo data if API fails
      return [
        {
          id: 1,
          name: 'Rajesh Kumar Auto Service',
          mechanicName: 'Rajesh Kumar',
          distance: 2.1,
          rating: 4.7,
          reviews: 186,
          services: ['Engine Repair', 'Towing', 'Battery'],
          status: 'available',
          image: 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg',
          responseTime: '12 min',
          phone: '+91 98765 43210',
          location: 'Sector 15, Noida',
          coordinates: [28.5706, 77.3272],
          priceRange: '₹200-800',
          experience: '8 years',
          completedJobs: 421,
          isOnline: true,
          workshopType: 'Mobile Service',
          isVerified: true,
        },
      ];
    }
  };

  // Filter and sort mechanics
  useEffect(() => {
    let filtered = mechanics.filter((mechanic) => {
      // Distance filter
      const maxDistance = filterDistance === '2km' ? 2 : 
                         filterDistance === '5km' ? 5 : 
                         filterDistance === '10km' ? 10 : 50;
      
      const withinDistance = mechanic.distance <= maxDistance;
      
      // Status filter
      const statusMatch = statusFilter === 'all' || mechanic.status.toLowerCase() === statusFilter;
      
      // Search filter
      const searchMatch = searchQuery === '' || 
        mechanic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mechanic.mechanicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mechanic.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase())) ||
        mechanic.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return withinDistance && statusMatch && searchMatch;
    });

    // Sort mechanics
  filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviews - a.reviews;
        case 'experience':
      return parseInt(b.experience) - parseInt(a.experience);
        default:
          return 0;
      }
    });

    setMechanics(filtered);
  }, [filterDistance, statusFilter, searchQuery, sortBy]);

  const quickStats = [
    { label: 'Avg Response', value: '12 min', icon: Clock, color: 'text-blue-600' },
    { label: 'Success Rate', value: '98.5%', icon: TrendingUp, color: 'text-green-600' },
    { label: 'Available Now', value: mechanics.filter(m => m.status === 'Available' && m.isOnline).length.toString(), icon: Shield, color: 'text-orange-600' }
  ];

  const renderMechanicCard = (mechanic: MechanicItem) => {
    if (viewMode === 'grid') {
      return (
        <motion.div
          className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-xl transition-all"
          onClick={() => navigate(`/workshop/${mechanic.id}`)}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <img src={mechanic.image} alt={mechanic.name} className="w-full h-32 object-cover rounded-lg mb-3" />
            {mechanic.isOnline && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
            {mechanic.isVerified && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                ✓ Verified
              </div>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{mechanic.name}</h3>
          <p className="text-sm text-gray-600 mb-2">{mechanic.mechanicName}</p>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{mechanic.rating}</span>
            <span className="text-xs text-gray-500">({mechanic.reviews})</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">{mechanic.distance.toFixed(1)}km • {mechanic.responseTime}</p>
          <div className="flex justify-between items-center">
            <span className={`text-xs rounded-full px-2 py-1 ${
              mechanic.status === 'available' ? 'bg-green-100 text-green-600' : 
              mechanic.status === 'busy' ? 'bg-orange-100 text-orange-600' : 
              'bg-red-100 text-red-600'
            }`}>
              {mechanic.status}
            </span>
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
              {mechanic.workshopType}
            </span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-xl transition-all"
        onClick={() => navigate(`/workshop/${mechanic.id}`)}
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img src={mechanic.image} alt={mechanic.name} className="w-16 h-16 rounded-full object-cover" />
            {mechanic.isOnline && (
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-800">{mechanic.name}</h3>
                  {mechanic.isVerified && (
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{mechanic.mechanicName}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{mechanic.rating}</span>
                  <span className="text-xs text-gray-500">({mechanic.reviews} reviews)</span>
                  <span className="text-xs text-gray-500">• {mechanic.completedJobs} jobs</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs rounded-full px-3 py-1 ${
                  mechanic.status === 'available' ? 'bg-green-100 text-green-600' : 
                  mechanic.status === 'busy' ? 'bg-orange-100 text-orange-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  {mechanic.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">{mechanic.experience} exp</p>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{mechanic.location} • {mechanic.distance.toFixed(1)}km away</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Response time: {mechanic.responseTime} • {mechanic.workshopType}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{mechanic.phone}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {mechanic.services.slice(0, 3).map((service: string, index: number) => (
                <span key={index} className="text-xs bg-blue-50 text-blue-600 rounded-full px-3 py-1">
                  {service}
                </span>
              ))}
              {mechanic.services.length > 3 && (
                <span className="text-xs text-gray-500">+{mechanic.services.length - 3} more</span>
              )}
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-medium text-gray-700">{mechanic.priceRange}</span>
              <div className="flex space-x-2">
        <button 
                  onClick={(e) => {
                    e.stopPropagation();
          navigate('/request', { state: { mechanicId: mechanic.id, mechanicName: mechanic.mechanicName || mechanic.name } });
                  }}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                  disabled={mechanic.status === 'closed' || !mechanic.isOnline}
                >
                  Request Service
                </button>
                <button 
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  <Share className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMapView = () => (
    <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
      <div className="text-center">
        <MapIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Interactive Map View</p>
        <p className="text-sm text-gray-500">Mechanic locations with real-time availability</p>
        <div className="mt-4 grid grid-cols-2 gap-2 max-w-xs">
          {mechanics.slice(0, 4).map(mechanic => (
            <div key={mechanic.id} className="bg-white p-2 rounded-lg text-xs">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${mechanic.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="font-medium">{mechanic.mechanicName}</p>
              </div>
              <p className="text-gray-500">{mechanic.distance}km</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('mechanicRequests');
    localStorage.removeItem('currentRequest');
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">RoadGuard</h1>
            <p className="text-sm text-gray-600">Roadside Assistance</p>
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-700">John Doe</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Welcome Section */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Nearby Mechanics</h2>
          <p className="text-gray-600">Get roadside assistance from verified mechanics</p>
          <p className="text-sm text-gray-500 mt-1">
            Showing {mechanics.length} registered mechanic{mechanics.length !== 1 ? 's' : ''} from our network
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-md text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search workshops, services, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </motion.div>

        {/* Filter Dropdowns and View Controls */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            {/* Filter Dropdowns */}
            <div className="flex space-x-3">
              {/* Radius Dropdown */}
              <select
                value={filterDistance}
                onChange={(e) => setFilterDistance(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="2km">Within 2km</option>
                <option value="5km">Within 5km</option>
                <option value="10km">Within 10km</option>
                <option value="20km">Within 20km</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Status Dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="closed">Closed</option>
              </select>

              {/* Sort By Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="experience">Sort by Experience</option>
              </select>
            </div>
            
            {/* View Mode Controls */}
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-md'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-md'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'map' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-md'
                }`}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Mechanic Listing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {mechanics.length} Registered Mechanic{mechanics.length !== 1 ? 's' : ''} Found
              {loading && <span className="ml-2 text-sm text-blue-600">Loading...</span>}
            </h3>
            <button
              onClick={loadMechanics}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && (
            <>
              {viewMode === 'map' ? renderMapView() : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                  {mechanics.map((mechanic, index) => (
                    <motion.div
                      key={mechanic.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      {renderMechanicCard(mechanic)}
                    </motion.div>
                  ))}
                </div>
              )}

              {mechanics.length === 0 && (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No mechanics found</h3>
                  <p className="text-gray-500">No mechanics are currently registered in your area</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search radius or check back later</p>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 grid grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/request')}
            className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Emergency Request</span>
          </button>
          <button
            onClick={() => navigate('/track')}
            className="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-xl shadow-md flex items-center justify-center space-x-2 hover:bg-blue-50 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span>Track Request</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
