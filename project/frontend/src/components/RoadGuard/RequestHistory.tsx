import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Star,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import UserMenu from './UserMenu';

const RequestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const requests = [
    {
      id: 'RG123456',
      service: 'Engine Breakdown',
      workshop: 'AutoCare Plus',
      mechanic: 'Rajesh Kumar',
      date: '2024-01-15',
      time: '2:30 PM',
      status: 'completed',
      cost: '₹1,417',
      rating: 5,
      duration: '45 min'
    },
    {
      id: 'RG123457',
      service: 'Oil Change',
      workshop: 'Quick Lube',
      mechanic: 'Suresh Raina',
      date: '2024-02-10',
      time: '1:00 PM',
      status: 'pending',
      cost: '₹450',
      rating: 4,
      duration: '30 min'
    },
    {
      id: 'RG123458',
      service: 'Tire Rotation',
      workshop: 'Tread & Track',
      mechanic: 'John Doe',
      date: '2024-03-05',
      time: '10:00 AM',
      status: 'cancelled',
      cost: '₹300',
      rating: 3,
      duration: '25 min'
    },
    {
      id: 'RG123459',
      service: 'Brake Inspection',
      workshop: 'SafeStop',
      mechanic: 'Jane Smith',
      date: '2024-04-20',
      time: '11:30 AM',
      status: 'completed',
      cost: '₹1,200',
      rating: 5,
      duration: '50 min'
    },
    {
      id: 'RG123460',
      service: 'Battery Replacement',
      workshop: 'PowerPlus',
      mechanic: 'Mike Johnson',
      date: '2024-05-15',
      time: '9:00 AM',
      status: 'pending',
      cost: '₹800',
      rating: 4,
      duration: '35 min'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/user')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Request History</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Download className="w-6 h-6 text-gray-600" />
            </button>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Your Requests</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-2 
                ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <Star className="w-5 h-5" />
                <span>All</span>
              </button>
              <button 
                onClick={() => setFilter('completed')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-2 
                ${filter === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <CheckCircle className="w-5 h-5" />
                <span>Completed</span>
              </button>
              <button 
                onClick={() => setFilter('pending')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-2 
                ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <Clock className="w-5 h-5" />
                <span>Pending</span>
              </button>
              <button 
                onClick={() => setFilter('cancelled')}
                className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center space-x-2 
                ${filter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-800'}`}
              >
                <XCircle className="w-5 h-5" />
                <span>Cancelled</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRequests.map(request => (
              <motion.div 
                key={request.id} 
                className="bg-white p-4 rounded-lg shadow-md transition-all hover:shadow-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                    </div>
                    <div>
                      <h3 className="text-md font-semibold text-gray-800">{request.service}</h3>
                      <p className="text-sm text-gray-500">{request.workshop} - {request.mechanic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-md font-semibold text-gray-800">{request.cost}</p>
                    <p className="text-sm text-gray-500">{request.date} - {request.time}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>{request.duration}</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(request.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestHistory;
