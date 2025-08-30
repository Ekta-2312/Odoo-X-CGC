import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, MessageCircle, MapPin, Star } from 'lucide-react';
import UserMenu from './UserMenu';
import StatusProgress from './StatusProgress';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import L from 'leaflet';
import { getSocket } from '../../lib/socket';
import 'leaflet/dist/leaflet.css';

const TrackRequest: React.FC = () => {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState(0);
  const [eta, setEta] = useState(0);
  const [requestId] = useState<string | null>(localStorage.getItem('currentRequestId'));
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mechanicMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<{ user?: {lat:number;lng:number}; mech?: {lat:number;lng:number} }>({});
  const [mechanicName, setMechanicName] = useState<string>('Awaiting assignment');
  
  // Optional UI-only placeholders
  const mechanicUi = {
    rating: 4.8,
    phone: 'Hidden',
    vehicle: 'Service Vehicle',
    experience: '—',
    completedJobs: 0,
  };

  const statuses = [
    { label: 'Request Submitted', completed: false, time: '' },
    { label: 'Mechanic Assigned', completed: false, time: '' },
    { label: 'En Route', completed: false, time: '' },
    { label: 'Arrived at Location', completed: false, time: '' },
    { label: 'Service in Progress', completed: false, time: '' },
    { label: 'Completed', completed: false, time: '' }
  ];

  // no change to fetching, but UI can read multiple service types from API response if needed later

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!requestId) return;
        const data = await api.get(`/api/requests/${requestId}`);
  setEta(data.etaMinutes || 0);
        // Map server statuses to our progress steps: submitted->0, assigned/accepted->1/2, in-progress->4, completed->5
        const stepMap = (s: string) => {
          switch (s) {
            case 'submitted': return 0;
            case 'assigned': return 1;
            case 'accepted': return 2;
            case 'in-progress': return 4;
            case 'completed': return 5;
            default: return 0;
          }
        };
        setCurrentStatus(stepMap(data.status));

        // Extract coords for map
        const u = data.location;
        const m = data.mechanicId?.location || null;
        const userPos = u && (u.latitude || u.longitude) ? { lat: u.latitude, lng: u.longitude } : undefined;
        const mechPos = m && (m.latitude || m.longitude) ? { lat: m.latitude, lng: m.longitude } : undefined;
        setCoords({ user: userPos, mech: mechPos });

  // Mechanic name from API (populated in backend)
  setMechanicName(data.mechanicId?.name || 'Awaiting assignment');
      } catch (e) {}
    };
    fetchStatus();
    const t = setInterval(fetchStatus, 5000);
    // Realtime updates
    const s = getSocket();
    const onUpd = (doc: any) => {
      if (!requestId || !doc || String(doc._id) !== String(requestId)) return;
      setEta(doc.etaMinutes || 0);
      const stepMap = (s: string) => {
        switch (s) {
          case 'submitted': return 0;
          case 'assigned': return 1;
          case 'accepted': return 2;
          case 'in-progress': return 4;
          case 'completed': return 5;
          default: return 0;
        }
      };
      setCurrentStatus(stepMap(doc.status));
      const u = doc.location;
      const m = doc.mechanicId?.location || null;
      const userPos = u && (u.latitude || u.longitude) ? { lat: u.latitude, lng: u.longitude } : undefined;
      const mechPos = m && (m.latitude || m.longitude) ? { lat: m.latitude, lng: m.longitude } : undefined;
      setCoords({ user: userPos, mech: mechPos });
      setMechanicName(doc.mechanicId?.name || 'Awaiting assignment');
    };
    s.on('request:updated', onUpd);
    return () => {
      clearInterval(t);
      s.off('request:updated', onUpd);
    };
  }, [requestId]);

  const handleCall = () => {
    toast.success('Calling mechanic...');
  };

  const handleChat = () => {
    toast.success('Opening chat...');
  };

  const handleShare = () => {
    toast.success('Location shared with family');
  };

  // Initialize and update Leaflet map
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }
    const map = mapInstanceRef.current;
    if (!map) return;

    if (coords.user) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([coords.user.lat, coords.user.lng], { title: 'You' }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([coords.user.lat, coords.user.lng]);
      }
    }

    if (coords.mech) {
      if (!mechanicMarkerRef.current) {
        mechanicMarkerRef.current = L.marker([coords.mech.lat, coords.mech.lng], { title: 'Mechanic' }).addTo(map);
      } else {
        mechanicMarkerRef.current.setLatLng([coords.mech.lat, coords.mech.lng]);
      }
    }

    if (coords.user && coords.mech) {
      const group = L.featureGroup([userMarkerRef.current!, mechanicMarkerRef.current!]);
      map.fitBounds(group.getBounds(), { padding: [40, 40] });
    } else if (coords.user) {
      map.setView([coords.user.lat, coords.user.lng], 14);
    }
  }, [coords]);

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
          <div className="flex items-center gap-3">
            <button 
              onClick={handleShare}
              className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium"
            >
              Share
            </button>
            <UserMenu />
          </div>
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
              <h3 className="text-xl font-semibold text-gray-800">{mechanicName}</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">{mechanicUi.rating}</span>
                <span className="text-xs">({mechanicUi.completedJobs} jobs)</span>
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
          <StatusProgress statuses={statuses} currentStatus={currentStatus} />
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
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Map</h2>
          <div ref={mapRef} className="w-full h-64 rounded-lg overflow-hidden" />
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;
