import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Car, 
  Wrench, 
  Truck, 
  Battery, 
  CircuitBoard,
  Zap,
  Fuel,
  Key,
  Upload,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ServiceRequest: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState({
    make: 'Honda',
    model: 'City',
    year: '2020',
    plate: 'MH01AB1234'
  });
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [urgencyLevel, setUrgencyLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [multiRequest, setMultiRequest] = useState(false);

  const services = [
    { id: 'breakdown', label: 'Engine Breakdown', icon: CircuitBoard, color: 'bg-red-100 text-red-600', price: '₹800-1500' },
    { id: 'towing', label: 'Towing Service', icon: Truck, color: 'bg-blue-100 text-blue-600', price: '₹500-1200' },
    { id: 'flat-tire', label: 'Flat Tire', icon: Car, color: 'bg-green-100 text-green-600', price: '₹300-600' },
    { id: 'battery', label: 'Battery Jump', icon: Battery, color: 'bg-yellow-100 text-yellow-600', price: '₹200-400' },
    { id: 'lockout', label: 'Car Lockout', icon: Key, color: 'bg-purple-100 text-purple-600', price: '₹300-500' },
    { id: 'fuel', label: 'Fuel Delivery', icon: Fuel, color: 'bg-orange-100 text-orange-600', price: '₹150-300' }
  ];

  const urgencyLevels = [
    { id: 'low', label: 'Standard', desc: 'Within 30-45 mins', color: 'border-green-500 bg-green-50 text-green-700' },
    { id: 'medium', label: 'Urgent', desc: 'Within 15-20 mins', color: 'border-orange-500 bg-orange-50 text-orange-700' },
    { id: 'high', label: 'Emergency', desc: 'Within 5-10 mins', color: 'border-red-500 bg-red-50 text-red-700' }
  ];

  const handlePhotoUpload = () => {
    const newPhoto = `https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=400`;
    setPhotos([...photos, newPhoto]);
    toast.success('Photo uploaded successfully');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedService || !vehicleInfo.make) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(multiRequest ? 'Request sent to multiple workshops!' : 'Service request submitted!');
    navigate('/track');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/user')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Request Service</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Service Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Select Service</h2>
          <div className="grid grid-cols-2 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`flex items-center p-4 rounded-lg shadow-md transition-all duration-200 ease-in-out 
                  ${selectedService === service.id ? 'bg-blue-100' : 'bg-white'} 
                  hover:bg-blue-50 focus:outline-none`}
              >
                <service.icon className={`w-6 h-6 mr-3 ${service.color}`} />
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-800">{service.label}</h3>
                  <p className="text-sm text-gray-500">{service.price}</p>
                </div>
                {selectedService === service.id && (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Vehicle Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Make</label>
              <input
                type="text"
                value={vehicleInfo.make}
                onChange={e => setVehicleInfo({ ...vehicleInfo, make: e.target.value })}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Honda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                value={vehicleInfo.model}
                onChange={e => setVehicleInfo({ ...vehicleInfo, model: e.target.value })}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="text"
                value={vehicleInfo.year}
                onChange={e => setVehicleInfo({ ...vehicleInfo, year: e.target.value })}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. 2020"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Plate Number</label>
              <input
                type="text"
                value={vehicleInfo.plate}
                onChange={e => setVehicleInfo({ ...vehicleInfo, plate: e.target.value })}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. MH01AB1234"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-500 focus:outline-none"
            rows={4}
            placeholder="Describe the issue..."
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Photos</label>
          <div className="flex items-center space-x-3 mt-2">
            <button
              onClick={handlePhotoUpload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md transition-all duration-200 ease-in-out hover:bg-blue-700 focus:outline-none"
            >
              <Camera className="w-5 h-5 mr-2" />
              Add Photo
            </button>
            {photos.length > 0 && (
              <div className="flex-1 grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img src={photo} alt={`Uploaded ${index}`} className="w-full h-auto rounded-lg shadow-md" />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md transition-all duration-200 ease-in-out hover:bg-red-600 focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Urgency Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
          <div className="grid grid-cols-3 gap-4 mt-2">
            {urgencyLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setUrgencyLevel(level.id as 'low' | 'medium' | 'high')}
                className={`flex flex-col items-center p-4 rounded-lg shadow-md transition-all duration-200 ease-in-out 
                  ${urgencyLevel === level.id ? level.color : 'bg-white'} 
                  hover:bg-blue-50 focus:outline-none`}
              >
                <span className="text-lg font-semibold">{level.label}</span>
                <span className="text-xs text-gray-500">{level.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Request Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={multiRequest}
            onChange={() => setMultiRequest(!multiRequest)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500 focus:outline-none"
          />
          <span className="ml-2 text-sm text-gray-700">Request to multiple workshops</span>
        </div>

        {/* Submit Button */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={handleSubmit}
            disabled={!selectedService || !vehicleInfo.make}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {multiRequest ? 'Send to Multiple Workshops' : 'Get Instant Quote'}
          </button>
          <p className="text-xs text-gray-600 text-center">
            By submitting, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceRequest;
