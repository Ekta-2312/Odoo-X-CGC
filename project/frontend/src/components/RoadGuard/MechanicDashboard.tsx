import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Camera, 
  CheckCircle,
  AlertTriangle,
  User,
  Car
} from 'lucide-react';
import SideNavigation from './SideNavigation';

const MechanicDashboard: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const requests = [
    {
      id: 'RG123456',
      customer: 'Amit Sharma',
      phone: '+91 98765 43210',
      service: 'Engine Breakdown',
      vehicle: 'Honda City 2020',
      location: 'Andheri East, Mumbai',
      time: '2:30 PM',
      status: 'assigned',
      priority: 'high',
      distance: '1.2 km'
    },
    {
      id: 'RG123457',
      customer: 'John Doe',
      phone: '+91 91234 56789',
      service: 'Flat Tire Replacement',
      vehicle: 'Maruti Suzuki Swift 2019',
      location: 'Bandra West, Mumbai',
      time: '3:00 PM',
      status: 'in-progress',
      priority: 'medium',
      distance: '2.5 km'
    },
    {
      id: 'RG123458',
      customer: 'Jane Smith',
      phone: '+91 99876 54321',
      service: 'Battery Jump Start',
      vehicle: 'Toyota Innova 2021',
      location: 'Juhu, Mumbai',
      time: '4:00 PM',
      status: 'pending',
      priority: 'low',
      distance: '3.0 km'
    }
  ];

  const handleStatusUpdate = (requestId: string, newStatus: string) => {
    console.log(`Updating ${requestId} to ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideNavigation userType="mechanic" />
      
      <div className="flex-1 lg:ml-64">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
          <p className="text-gray-600">Manage your assigned tasks</p>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Request List */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Today's Assignments</h2>
              {requests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`bg-white rounded-xl p-4 card-shadow cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-gray-900 truncate">{request.customer}</p>
                      <p className="text-sm text-gray-500 truncate">{request.service}</p>
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {request.time} - {request.distance}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <p className="ml-2 text-sm text-gray-700 truncate">{request.location}</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <p className="ml-2 text-sm text-gray-700 truncate">{request.phone}</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <Car className="h-5 w-5 text-gray-400" />
                    <p className="ml-2 text-sm text-gray-700 truncate">{request.vehicle}</p>
                  </div>
                  <div className="mt-2 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <p className="ml-2 text-sm text-gray-700 truncate">{request.status}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Details */}
            {selectedRequest && (
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Details</h2>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">Customer:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.customer}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Phone:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.phone}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Service:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.service}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Vehicle:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.vehicle}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Location:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.location}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Time:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.time}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Status:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.status}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Priority:</span>
                    <span className="text-sm text-gray-700">{selectedRequest.priority}</span>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'in-progress')}
                    className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-blue-700"
                  >
                    Start Service
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                    className="flex-1 bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-green-700"
                  >
                    Complete Service
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
