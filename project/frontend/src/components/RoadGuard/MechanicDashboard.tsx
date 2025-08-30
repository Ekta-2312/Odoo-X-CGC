import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Phone, 
  Car,
  Wrench,
  RefreshCw,
  
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import SideNavigation from './SideNavigation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MechanicDashboard: React.FC = () => {
  type Req = {
    _id: string;
    serviceType: string;
    serviceTypes?: string[];
    status: string;
    priority: 'low' | 'medium' | 'high';
    createdAt: string;
    vehicleInfo?: { make?: string; model?: string; year?: string; plate?: string; color?: string; fuelType?: string };
    location?: { address?: string; latitude?: number; longitude?: number };
  };
  const [selectedRequest, setSelectedRequest] = useState<Req | null>(null);
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Load requests from database/localStorage
  useEffect(() => {
    loadRequests();
    // Set up real-time updates (every 30 seconds)
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/requests/assigned');
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await api.post(`/api/requests/${requestId}/status`, { status: newStatus });
      await loadRequests();
      if (selectedRequest?._id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
      toast.success(`Request ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    handleStatusUpdate(requestId, 'accepted');
  };

  const handleRejectRequest = (requestId: string) => {
    handleStatusUpdate(requestId, 'rejected');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-600';
  case 'assigned': return 'bg-indigo-100 text-indigo-600';
      case 'accepted': return 'bg-green-100 text-green-600';
      case 'in-progress': return 'bg-yellow-100 text-yellow-600';
      case 'completed': return 'bg-green-100 text-green-600';
      case 'rejected': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;
    if (!selectedRequest) return;
    const { location } = selectedRequest;
    if (!location || (!location.latitude && !location.longitude)) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([location.latitude!, location.longitude!], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }
    const map = mapInstanceRef.current;
    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([location.latitude!, location.longitude!], { title: 'User' }).addTo(map!);
    } else {
      userMarkerRef.current.setLatLng([location.latitude!, location.longitude!]);
    }
    map!.setView([location.latitude!, location.longitude!], 14);
  }, [selectedRequest]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideNavigation userType="mechanic" />
      
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Service Requests</h1>
              <p className="text-gray-600">Manage your assigned tasks and new requests</p>
            </div>
            <button
              onClick={loadRequests}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Request List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Incoming Requests ({requests.length})
                </h2>
                {requests.filter(r => r.status === 'submitted').length > 0 && (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                    {requests.filter(r => r.status === 'submitted').length} New
                  </span>
                )}
              </div>

              {loading && (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {!loading && requests.length === 0 && (
                <div className="text-center py-12">
                  <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No requests yet</h3>
                  <p className="text-gray-500">New service requests will appear here</p>
                </div>
              )}

              {!loading && requests.map((request: any) => (
                <motion.div
                  key={request._id}
                  onClick={() => setSelectedRequest(request)}
                  className={`bg-white rounded-xl p-4 shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedRequest?._id === request._id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-800">Request</h3>
                        <span className={`text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {request.serviceTypes && request.serviceTypes.length > 0
                          ? request.serviceTypes.join(', ')
                          : request.serviceType}
                      </p>
                      <p className="text-xs text-gray-500">Request ID: {request._id}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs rounded-full px-2 py-1 ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{new Date(request.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4" />
                      <span>{request.vehicleInfo?.make} {request.vehicleInfo?.model} {request.vehicleInfo?.year}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{request.location?.address ? request.location.address : 'GPS Location'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>Hidden</span>
                    </div>
                  </div>

                  {(request.status === 'submitted' || request.status === 'assigned') && (
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptRequest(request._id);
                        }}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectRequest(request._id);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Request Details */}
            {selectedRequest && (
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-md"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Request Details</h2>
                  <span className={`text-xs rounded-full px-3 py-1 ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Request ID:</span>
                        <span className="font-medium">{selectedRequest._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`font-medium ${getPriorityColor(selectedRequest.priority)}`}>{selectedRequest.priority?.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Vehicle Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Make & Model:</span>
                        <span className="font-medium">{selectedRequest.vehicleInfo?.make} {selectedRequest.vehicleInfo?.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{selectedRequest.vehicleInfo?.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plate Number:</span>
                        <span className="font-medium">{selectedRequest.vehicleInfo?.plate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Color:</span>
                        <span className="font-medium">{selectedRequest.vehicleInfo?.color}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fuel Type:</span>
                        <span className="font-medium">{selectedRequest.vehicleInfo?.fuelType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Service Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service Type:</span>
                        <span className="font-medium">
                          {selectedRequest.serviceTypes && selectedRequest.serviceTypes.length > 0
                            ? selectedRequest.serviceTypes.join(', ')
                            : selectedRequest.serviceType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className={`font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                          {selectedRequest.priority?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Cost:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="font-medium">-</span>
                      </div>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Problem Description</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">-</p>
                  </div>

                  {/* Location */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-2">Location</h4>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{selectedRequest.location?.address || 'GPS Coordinates Available'}</span>
                    </div>
                    <div ref={mapRef} className="w-full h-56 rounded-lg mt-3 overflow-hidden" />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-4">
          {(selectedRequest.status === 'submitted' || selectedRequest.status === 'assigned') && (
                      <div className="grid grid-cols-2 gap-3">
                        <button
              onClick={() => handleAcceptRequest(selectedRequest._id)}
                          className="bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          Accept Request
                        </button>
                        <button
              onClick={() => handleRejectRequest(selectedRequest._id)}
                          className="bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Decline Request
                        </button>
                      </div>
                    )}
                    
          {selectedRequest.status === 'accepted' && (
                      <button
            onClick={() => handleStatusUpdate(selectedRequest._id, 'in-progress')}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Start Service
                      </button>
                    )}
                    
          {selectedRequest.status === 'in-progress' && (
                      <button
            onClick={() => handleStatusUpdate(selectedRequest._id, 'completed')}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                      >
                        Complete Service
                      </button>
                    )}

                    <div className="flex space-x-3">
                      <button className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>Call Customer</span>
                      </button>
                      <button className="flex-1 bg-green-100 text-green-600 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center justify-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>View Location</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;
