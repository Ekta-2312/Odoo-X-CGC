import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [requestId, setRequestId] = useState<string | null>(localStorage.getItem('currentRequestId'));
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mechanicMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<{ user?: {lat:number;lng:number}; mech?: {lat:number;lng:number} }>({});
  const [mechanicName, setMechanicName] = useState<string>('Awaiting assignment');
  const [address, setAddress] = useState<string>('');
  
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

  // utility to map statuses to our progress index
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

  const loadById = useCallback(async (id: string) => {
    try {
      const data = await api.get(`/api/requests/${id}`);
      setEta(data.etaMinutes || 0);
      setCurrentStatus(stepMap(data.status));
      // Coords
      const u = data.location;
      const m = data.mechanicId?.location || null;
      const userPos = u && (u.latitude || u.longitude) ? { lat: u.latitude, lng: u.longitude } : undefined;
      const mechPos = m && (m.latitude || m.longitude) ? { lat: m.latitude, lng: m.longitude } : undefined;
      setCoords({ user: userPos, mech: mechPos });
      setMechanicName(data.mechanicId?.name || 'Awaiting assignment');
      setAddress(data.location?.address || '');
    } catch (e) {
      // silently ignore
    }
  }, []);

  const pickActiveRequest = useCallback(async () => {
    try {
      const list = await api.get('/api/requests/me');
      const active = (list as any[]).find(r => !['completed','rejected','cancelled'].includes(r.status));
      const latest = active || (Array.isArray(list) && list.length ? list[0] : null);
      if (latest?._id) {
        setRequestId(latest._id);
        localStorage.setItem('currentRequestId', latest._id);
        await loadById(latest._id);
      } else {
        setRequestId(null);
        setMechanicName('Awaiting assignment');
        setAddress('');
        setEta(0);
        setCoords({});
        setCurrentStatus(0);
      }
    } catch {}
  }, [loadById]);

  useEffect(() => {
    if (requestId) {
      loadById(requestId);
    } else {
      pickActiveRequest();
    }
    // live updates
    const s = getSocket();
    const onNew = (doc: any) => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user?.id) return;
        if (String(doc?.userId) === String(user.id)) {
          // if no current tracked request or current finished, follow the new one
          if (!requestId || ['completed','rejected','cancelled'].includes(String(stepMap.name))) {
            setRequestId(String(doc._id));
            localStorage.setItem('currentRequestId', String(doc._id));
            loadById(String(doc._id));
          }
        }
      } catch {}
    };
    const onUpd = async (doc: any) => {
      const id = String(doc?._id || '');
      if (requestId && id === String(requestId)) {
        // refresh populated details (mechanic name, etc.)
        await loadById(id);
      } else {
        // If update is an assignment for this user and we have no active id, follow it
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          if (String(doc?.userId) === String(user.id) && ['assigned','accepted','in-progress'].includes(String(doc?.status))) {
            setRequestId(id);
            localStorage.setItem('currentRequestId', id);
            await loadById(id);
          }
        } catch {}
      }
    };
    const onDel = async (p: any) => {
      if (p && String(p.id) === String(requestId)) {
        setRequestId(null);
        await pickActiveRequest();
      }
    };
    const onDelMany = async (p: any) => {
      if (p?.ids && requestId && p.ids.map(String).includes(String(requestId))) {
        setRequestId(null);
        await pickActiveRequest();
      }
    };
    s.on('request:new', onNew);
    s.on('request:updated', onUpd);
    s.on('request:deleted', onDel);
    s.on('request:deleted_many', onDelMany);
    return () => {
      s.off('request:new', onNew);
      s.off('request:updated', onUpd);
      s.off('request:deleted', onDel);
      s.off('request:deleted_many', onDelMany);
    };
  }, [requestId, loadById, pickActiveRequest]);

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
              <p className="text-sm text-gray-600">#{requestId ? String(requestId).slice(-6).toUpperCase() : '—'}</p>
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
              <p className="text-gray-800 font-medium">{address || '—'}</p>
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
