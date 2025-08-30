import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, AlertCircle, Star, Search, Grid, List, Map as MapIcon, Shield, TrendingUp, Share, Phone, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import UserMenu from './UserMenu';

type MechanicItem = {
  id: string | number;
  name: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
  rating: number;
  totalServices: number;
  location: { latitude?: number; longitude?: number; address?: string };
  isVerified: boolean;
  distanceKm?: number;
  etaMin?: number;
};

const toRad = (v: number) => (v * Math.PI) / 180;
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const UserDashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
  const [filterDistance, setFilterDistance] = useState('5km');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [mechanics, setMechanics] = useState<MechanicItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  // no-op
  const navigate = useNavigate();

  useEffect(() => {
    // Prefer current request location if available; else fall back to browser geolocation
    const loadFromRequest = async () => {
      try {
        const rid = localStorage.getItem('currentRequestId');
        if (rid) {
          const req = await api.get(`/api/requests/${rid}`);
          const rLat = Number(req?.location?.latitude);
          const rLng = Number(req?.location?.longitude);
          if (!isNaN(rLat) && !isNaN(rLng)) {
            setCoords({ lat: rLat, lng: rLng });
          }
        }
      } catch {
        // ignore; likely stale id
      } finally {
        // no-op
      }
    };
    loadFromRequest();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords((c) => ({ lat: c.lat ?? pos.coords.latitude, lng: c.lng ?? pos.coords.longitude })),
        () => {},
        { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
      );
    }
    loadMechanics();
  }, []);

  // Recompute distances when coords change
  useEffect(() => {
    if (coords.lat == null || coords.lng == null) return;
    setMechanics((prev) =>
      prev.map((m) => {
        const lat = Number(m.location?.latitude);
        const lng = Number(m.location?.longitude);
        const can = !isNaN(lat) && !isNaN(lng);
        const distanceKm = can ? Number(haversineKm(coords.lat!, coords.lng!, lat, lng).toFixed(1)) : undefined;
  return { ...m, distanceKm };
      })
    );
  }, [coords.lat, coords.lng]);

  const loadMechanics = async () => {
    setLoading(true);
    try {
      const list = await api.get('/api/workshops');
  const userLat = coords.lat;
  const userLng = coords.lng;
      const mapped: MechanicItem[] = (list as any[]).map((m) => {
        const lat = Number(m.location?.latitude);
        const lng = Number(m.location?.longitude);
        const canDistance = userLat != null && userLng != null && !isNaN(lat) && !isNaN(lng);
        const distanceKm = canDistance ? Number(haversineKm(userLat!, userLng!, lat, lng).toFixed(1)) : undefined;
        return {
          id: m.id,
          name: m.name,
          email: m.email,
          mobile: m.mobile,
          profileImage: m.profileImage,
          rating: Number(m.rating || 0),
          totalServices: Number(m.totalServices || 0),
          location: m.location || {},
          isVerified: !!m.isVerified,
          distanceKm,
        } as MechanicItem;
      });
      setMechanics(mapped);
    } catch (error) {
      toast.error('Failed to load mechanics');
      setMechanics([]);
    } finally {
      setLoading(false);
    }
  };

  // Derived stats and filtered/sorted list
  const quickStats = useMemo(() => {
    const avgDist = mechanics.length ? (mechanics.reduce((a, m) => a + (m.distanceKm || 0), 0) / mechanics.length) : 0;
    return [
      { label: 'Avg Distance', value: `${avgDist.toFixed(1)} km`, icon: MapPin, color: 'text-blue-600' },
      { label: 'Mechanics', value: String(mechanics.length), icon: TrendingUp, color: 'text-green-600' },
      { label: 'Verified', value: String(mechanics.filter((m) => m.isVerified).length), icon: Shield, color: 'text-orange-600' },
    ];
  }, [mechanics]);

  const filteredSorted = useMemo(() => {
    const maxDistance = filterDistance === '2km' ? 2 : filterDistance === '5km' ? 5 : filterDistance === '10km' ? 10 : 50;
    const list = mechanics.filter((m) => {
      const within = m.distanceKm == null ? true : m.distanceKm <= maxDistance;
      const match =
        searchQuery.trim() === '' ||
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
      const statusOk = statusFilter === 'all';
      return within && match && statusOk;
    });
    list.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY);
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.totalServices - a.totalServices;
        case 'experience':
          return 0;
        default:
          return 0;
      }
    });
    return list;
  }, [mechanics, filterDistance, searchQuery, statusFilter, sortBy]);

  const renderMechanicCard = (mechanic: MechanicItem) => {
    if (viewMode === 'grid') {
      return (
        <motion.div className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate(`/workshop/${mechanic.id}`)} whileHover={{ scale: 1.02 }}>
          <div className="relative">
            <img src={mechanic.profileImage || 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg'} alt={mechanic.name} className="w-full h-32 object-cover rounded-lg mb-3" />
            {mechanic.isVerified && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">✓ Verified</div>
            )}
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">{mechanic.name}</h3>
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{mechanic.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">({mechanic.totalServices} jobs)</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            {(mechanic.location.address || 'Not specified')} {mechanic.distanceKm != null && `• ${mechanic.distanceKm.toFixed(1)}km away`}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{mechanic.mobile || '+91 ———— ————'}</span>
          </div>
          {/* No response time/ETA shown as per requirement */}
        </motion.div>
      );
    }

    return (
      <motion.div className="bg-white rounded-xl p-4 shadow-md cursor-pointer hover:shadow-xl transition-all" onClick={() => navigate(`/workshop/${mechanic.id}`)} whileHover={{ scale: 1.01 }}>
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img src={mechanic.profileImage || 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg'} alt={mechanic.name} className="w-16 h-16 rounded-full object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-800">{mechanic.name}</h3>
                  {mechanic.isVerified && <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">✓ Verified</span>}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{mechanic.rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500">({mechanic.totalServices} jobs)</span>
                </div>
              </div>
              <div className="text-right" />
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{mechanic.location.address || 'Not specified'}{mechanic.distanceKm != null ? ` • ${mechanic.distanceKm.toFixed(1)}km away` : ''}</span>
              </div>
              {/* Response time removed as per requirement */}
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{mechanic.mobile || '+91 ———— ————'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div />
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/request', { state: { mechanicId: mechanic.id, mechanicName: mechanic.name } });
                  }}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                >
                  Request Service
                </button>
                <button onClick={(e) => e.stopPropagation()} className="text-xs border border-gray-300 px-2 py-1 rounded-lg hover:bg-gray-50">
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
          {mechanics.slice(0, 4).map((mechanic) => (
            <div key={mechanic.id} className="bg-white p-2 rounded-lg text-xs">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${mechanic.isVerified ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <p className="font-medium">{mechanic.name}</p>
              </div>
              <p className="text-gray-500">{mechanic.distanceKm != null ? `${mechanic.distanceKm}km` : '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">RoadGuard</h1>
            <p className="text-sm text-gray-600">Roadside Assistance</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Find Nearby Mechanics</h2>
          <p className="text-gray-600">Get roadside assistance from verified mechanics</p>
          <p className="text-sm text-gray-500 mt-1">Showing {mechanics.length} registered mechanic{mechanics.length !== 1 ? 's' : ''} from our network</p>
        </motion.div>

        <motion.div className="grid grid-cols-3 gap-3 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {quickStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-md text-center">
              <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div className="mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
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

        <motion.div className="mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-3">
              <select value={filterDistance} onChange={(e) => setFilterDistance(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="2km">Within 2km</option>
                <option value="5km">Within 5km</option>
                <option value="10km">Within 10km</option>
                <option value="20km">Within 20km</option>
                <option value="custom">Custom Range</option>
              </select>

              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="closed">Closed</option>
              </select>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="reviews">Sort by Reviews</option>
                <option value="experience">Sort by Experience</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-md'}`}>
                <List className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-md'}`}>
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-md'}`}>
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {filteredSorted.length} Registered Mechanic{filteredSorted.length !== 1 ? 's' : ''} Found
              {loading && <span className="ml-2 text-sm text-blue-600">Loading...</span>}
            </h3>
            <button onClick={loadMechanics} disabled={loading} className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">
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
              {viewMode === 'map' ? (
                renderMapView()
              ) : (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
                  {filteredSorted.map((mechanic, index) => (
                    <motion.div key={mechanic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * index }}>
                      {renderMechanicCard(mechanic)}
                    </motion.div>
                  ))}
                </div>
              )}

              {filteredSorted.length === 0 && (
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

        <motion.div className="mt-8 grid grid-cols-2 gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <button onClick={() => navigate('/request')} className="bg-blue-600 text-white p-4 rounded-xl shadow-md flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors">
            <AlertCircle className="w-5 h-5" />
            <span>Emergency Request</span>
          </button>
          <button onClick={() => navigate('/track')} className="bg-white border-2 border-blue-600 text-blue-600 p-4 rounded-xl shadow-md flex items-center justify-center space-x-2 hover:bg-blue-50 transition-colors">
            <MapPin className="w-5 h-5" />
            <span>Track Request</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
