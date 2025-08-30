import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  User,
  Star,
  Navigation,
  Zap,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatusProgress from './StatusProgress';
import toast from 'react-hot-toast';

const TrackRequest: React.FC = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(2);
  const [eta, setEta] = useState(15);
  
  const mechanic = {
    name: 'Rajesh Kumar',
    rating: 4.8,
    phone: '+91 98765 43210',
    vehicle: 'Blue Toyota Service Van',
    experience: '8 years',
    completedJobs: 1247
  };

  const statuses = [
    { label: 'Request Submitted', completed: true, time: '2:30 PM' },
    { label: 'Mechanic Assigned', completed: true, time: '2:32 PM' },
    { label: 'En Route', completed: true, time: '2:35 PM' },
    { label: 'Arrived at Location', completed: false, time: '' },
    { label: 'Service in Progress', completed: false, time: '' },
    { label: 'Completed', completed: false, time: '' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStatus(prev => {
        if (prev < statuses.length - 1) {
          return prev + 1;
        }
        return prev;
      });
      
      setEta(prev => Math.max(0, prev - 1));
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const handleCall = () => {
    toast.success('Calling mechanic...');
  };

  const handleChat = () => {
    toast.success('Opening chat...');
  };

  const handleShare = () => {
    toast.success('Location shared with family');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/user')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Track Request</h1>
              <p className="text-sm text-gray-600">#RG123456</p>
            </div>
          </div>
          <button 
            onClick={handleShare}
            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium"
          >
            Share
          </button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mechanic Details</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img 
                src="https://via.placeholder.com/80" 
                alt="Mechanic" 
                className="w-20 h-20 rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">{mechanic.name}</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">{mechanic.rating}</span>
                <span className="text-xs">({mechanic.completedJobs} jobs)</span>
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <button 
                  onClick={handleCall} 
                  className="flex items-center space-x-2 text-blue-600 hover:underline"
                >
                  <Phone className="w-5 h-5" />
                  <span className="text-sm">Call</span>
                </button>
                <button 
                  onClick={handleChat} 
                  className="flex items-center space-x-2 text-blue-600 hover:underline"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Status</h2>
          <StatusProgress 
            steps={statuses} 
            currentStep={currentStatus} 
            eta={eta} 
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Location</h2>
          <div className="flex items-center space-x-4">
            <MapPin className="w-6 h-6 text-gray-600" />
            <div className="flex-1">
              <p className="text-gray-800 font-medium">123 Main St, Springfield</p>
              <p className="text-sm text-gray-600">Estimated Arrival: {eta} minutes</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment</h2>
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4">
              <p className="text-gray-800 font-medium">Service Fee</p>
              <p className="text-xl font-bold text-gray-900">$49.99</p>
            </div>
            <div>
              <button className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
