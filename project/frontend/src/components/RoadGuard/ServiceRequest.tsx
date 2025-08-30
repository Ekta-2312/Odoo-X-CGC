import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Car, 
  Truck, 
  Battery, 
  CircuitBoard,
  Zap,
  Fuel,
  Key,
  Clock,
  Shield,
  LogOut,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const ServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    plate: '',
    color: '',
    fuelType: 'petrol'
  });
  const [description, setDescription] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [multiRequest, setMultiRequest] = useState(false);
  const [showQuotation, setShowQuotation] = useState(false);
  type Quotation = { estimatedCost: string; estimatedTime: string; nearbyMechanics: number; confidence: number };
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [step, setStep] = useState(1);

  // Preselected mechanic (from user dashboard card)
  const [selectedMechanic, setSelectedMechanic] = useState<{ id: string; name: string } | null>(null);

  // Get mechanic ID/name if coming from mechanic card
  const navState: any = location.state || {};
  const preselectedMechanicId: string | undefined = navState?.mechanicId || navState?.workshopId;
  const preselectedMechanicName: string | undefined = navState?.mechanicName || navState?.mechanicDisplayName;

  useEffect(() => {
    let ignore = false;
    const init = async () => {
      if (!preselectedMechanicId && !preselectedMechanicName) return;
      if (preselectedMechanicName && preselectedMechanicId) {
        if (!ignore) setSelectedMechanic({ id: preselectedMechanicId, name: preselectedMechanicName });
        return;
      }
      if (preselectedMechanicId) {
        try {
          const mech = await api.get(`/api/workshops/${preselectedMechanicId}`);
          if (!ignore && mech?.name) setSelectedMechanic({ id: preselectedMechanicId, name: mech.name });
        } catch {}
      }
    };
    init();
    return () => { ignore = true; };
  }, [preselectedMechanicId, preselectedMechanicName]);

  const services = [
    { id: 'breakdown', label: 'Engine Breakdown', icon: CircuitBoard, color: 'bg-red-100 text-red-600', price: '₹800-1500' },
    { id: 'towing', label: 'Towing Service', icon: Truck, color: 'bg-blue-100 text-blue-600', price: '₹500-1200' },
    { id: 'flat-tire', label: 'Flat Tire', icon: Car, color: 'bg-green-100 text-green-600', price: '₹300-600' },
    { id: 'battery', label: 'Battery Jump', icon: Battery, color: 'bg-yellow-100 text-yellow-600', price: '₹200-400' },
    { id: 'lockout', label: 'Car Lockout', icon: Key, color: 'bg-purple-100 text-purple-600', price: '₹300-500' },
    { id: 'fuel', label: 'Fuel Delivery', icon: Fuel, color: 'bg-orange-100 text-orange-600', price: '₹150-300' }
  ];

  const toggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        toast.success('Location detected');
      },
      () => {
        toast.error('Location access denied');
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 10000 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Initialize/update map when currentLocation changes
  useEffect(() => {
    if (!mapRef.current) return;
    const parts = currentLocation.split(',');
    const lat = Number(parts[0]);
    const lng = Number(parts[1]);
    const hasCoords = !isNaN(lat) && !isNaN(lng);
    if (!hasCoords) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }
    const map = mapInstanceRef.current;
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([lat, lng], { title: 'You' }).addTo(map!);
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
    }
    map!.setView([lat, lng], 15);
  }, [currentLocation]);

  const generateAIQuotation = () => {
    const primary = selectedServices[0];
    const basePrice = services.find(s => s.id === primary)?.price || '₹200-500';
    
    // Simulate AI quotation
    setTimeout(() => {
      setQuotation({
        estimatedCost: basePrice,
        estimatedTime: '15-25 min',
        nearbyMechanics: Math.floor(Math.random() * 5) + 3,
        confidence: Math.floor(Math.random() * 20) + 80,
      });
      setShowQuotation(true);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (selectedServices.length === 0 || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (step === 1) {
      generateAIQuotation();
      setStep(2);
    } else {
      // Submit final request to database
      const requestData = {
        serviceType: selectedServices[0],
        serviceTypes: selectedServices,
        vehicleInfo,
        description,
        location: currentLocation.includes(',')
          ? {
              latitude: Number(currentLocation.split(',')[0].trim()),
              longitude: Number(currentLocation.split(',')[1].trim()),
            }
          : { address: currentLocation },
        priority: 'medium',
        estimatedCost: quotation?.estimatedCost,
        estimatedTime: quotation?.estimatedTime,
        mechanicId: selectedMechanic?.id,
      } as any;
      
      try {
  // Create via API
  const created = await api.post('/api/requests', requestData);
  localStorage.setItem('currentRequestId', created._id);
        
        toast.success(multiRequest ? 'Request sent to multiple workshops!' : 'Service request submitted!');
        navigate('/track');
      } catch (error) {
        toast.error('Failed to submit request. Please try again.');
      }
    }
  };

  // no-op

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('mechanicRequests');
    localStorage.removeItem('currentRequest');
    toast.success('Logged out successfully');
    navigate('/auth');
  };

  if (step === 2 && showQuotation) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <motion.div
          className="max-w-md mx-auto bg-white rounded-2xl p-6 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">AI Quotation Ready</h2>
            <p className="text-gray-600">Based on your vehicle and location</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl">
              <h3 className="font-semibold text-blue-800 mb-2">Estimated Cost</h3>
              <p className="text-2xl font-bold text-blue-600">{quotation?.estimatedCost}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Clock className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">ETA</p>
                <p className="font-medium">{quotation?.estimatedTime}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <Shield className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-medium">{quotation?.confidence}%</p>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-xl">
              <p className="text-sm text-green-700">
                <strong>{quotation?.nearbyMechanics}</strong> qualified mechanics nearby
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Confirm & Send Request
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Modify Request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Request Service</h1>
            {selectedMechanic && (
              <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                Mechanic: {selectedMechanic.name}
              </span>
            )}
          </div>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
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

      <div className="px-4 py-6 space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="flex-1 bg-blue-600 h-2 rounded-full"></div>
          <div className="flex-1 bg-gray-200 h-2 rounded-full"></div>
        </div>

        {/* Service Selection */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-gray-800">What service do you need?</h2>
          <div className="grid grid-cols-2 gap-3">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedServices.includes(service.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                } hover:scale-105`}
              >
                <service.icon className={`w-8 h-8 mb-2 ${selectedServices.includes(service.id) ? 'text-blue-600' : 'text-gray-600'}`} />
                <h3 className="text-sm font-medium text-gray-800 text-center">{service.label}</h3>
                <p className="text-xs text-gray-500">{service.price}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Vehicle Information */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg font-semibold text-gray-800">Vehicle Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Make (e.g., Honda)"
              value={vehicleInfo.make}
              onChange={e => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Model (e.g., City)"
              value={vehicleInfo.model}
              onChange={e => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Year (e.g., 2020)"
              value={vehicleInfo.year}
              onChange={e => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Plate Number"
              value={vehicleInfo.plate}
              onChange={e => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Color"
              value={vehicleInfo.color}
              onChange={e => setVehicleInfo({ ...vehicleInfo, color: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <select
              value={vehicleInfo.fuelType}
              onChange={e => setVehicleInfo({ ...vehicleInfo, fuelType: e.target.value })}
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </motion.div>

        {/* Problem Description */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-gray-800">Describe the problem</h2>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Please describe what's wrong with your vehicle in detail..."
            className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            rows={4}
          />
        </motion.div>

        {/* Location */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-800">Location</h2>
          <div className="flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">
                {currentLocation.includes(',') ? 'GPS Location Detected' : currentLocation}
              </span>
            </div>
            <button onClick={detectLocation} className="text-blue-600 font-medium hover:text-blue-800">
              Use Current Location
            </button>
          </div>
          <div ref={mapRef} className="w-full h-56 rounded-lg mt-3 overflow-hidden" />
        </motion.div>

        {/* Additional Options */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={multiRequest}
              onChange={() => setMultiRequest(!multiRequest)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Send to multiple workshops for faster response</span>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleSubmit}
            disabled={selectedServices.length === 0 || !description.trim()}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Get AI Quotation' : 'Confirm Request'}
          </button>
          <p className="text-xs text-gray-600 text-center mt-3">
            AI will analyze your request and provide instant cost estimation
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceRequest;