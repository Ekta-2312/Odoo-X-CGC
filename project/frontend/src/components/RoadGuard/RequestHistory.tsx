import React, { useEffect, useMemo, useState } from 'react';
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
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import toast from 'react-hot-toast';
import UserMenu from './UserMenu';

const RequestHistory: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('completed');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<any[]>([]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get('/api/requests/me');
      setRequests(Array.isArray(data) ? data : []);
    } catch (e: any) {
      const msg = e?.message || 'Failed to load history';
      setError(msg);
      toast.error('Could not load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const s = getSocket();
    const refresh = () => fetchHistory();
    s.on('request:new', refresh);
    s.on('request:updated', refresh);
    s.on('request:deleted', refresh);
    s.on('request:deleted_many', refresh);
    return () => {
      s.off('request:new', refresh);
      s.off('request:updated', refresh);
      s.off('request:deleted', refresh);
      s.off('request:deleted_many', refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filteredRequests = useMemo(() => {
    return (requests || []).filter((r) =>
      filter === 'all' ? true : r.status === filter
    );
  }, [requests, filter]);

  const formatRupees = (amount?: string | number) => {
    if (amount === undefined || amount === null) return '';
    if (typeof amount === 'string') return amount; // already formatted string
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount as number);
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + ' - ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  const escapeCsv = (v: any) => {
    const s = (v ?? '').toString();
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };

  const handleDownload = () => {
    const rows = filteredRequests.length ? filteredRequests : requests;
    if (!rows || rows.length === 0) {
      toast.error('No requests to download');
      return;
    }
    const headers = [
      'ID','Service','Status','Mechanic','Estimated Cost','ETA (min)','Created At','Address'
    ];
    const lines = [headers.join(',')];
    rows.forEach((r: any) => {
      const line = [
        escapeCsv(r._id),
        escapeCsv(r.serviceType || (Array.isArray(r.serviceTypes) ? r.serviceTypes.join(' | ') : '')),
        escapeCsv(r.status),
        escapeCsv(r.mechanicId?.name || 'Unassigned'),
        escapeCsv(typeof r.estimatedCost === 'number' ? formatRupees(r.estimatedCost) : (r.estimatedCost || '')),
        escapeCsv(r.etaMinutes ?? ''),
        escapeCsv(formatDateTime(r.createdAt)),
        escapeCsv(r.location?.address || '')
      ].join(',');
      lines.push(line);
    });
    // Prepend BOM for Excel
    const csv = '\ufeff' + lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
    a.download = `roadguard-requests-${filter}-${ts}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

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
            <button onClick={handleDownload} className="p-2 hover:bg-gray-100 rounded-lg">
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
            {loading && (
              <div className="col-span-1 sm:col-span-2 flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  <span>Loading...</span>
                </div>
              </div>
            )}
            {!loading && filteredRequests.length === 0 && (
              <div className="col-span-1 sm:col-span-2 text-center text-gray-500 py-12">
                {error ? 'Failed to load. Please try again.' : 'No requests yet.'}
              </div>
            )}
            {!loading && filteredRequests.map(request => (
              <motion.div 
                key={request._id} 
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
                      <h3 className="text-md font-semibold text-gray-800">{request.serviceType}</h3>
                      <p className="text-sm text-gray-500">{request.mechanicId?.name ? request.mechanicId.name : 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-md font-semibold text-gray-800">{formatRupees(request.estimatedCost)}</p>
                    <p className="text-sm text-gray-500">{formatDateTime(request.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-gray-500 text-sm">
                  <span>{request.etaMinutes ? `${request.etaMinutes} min` : ''}</span>
                  {/* Rating UI placeholder for future */}
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
