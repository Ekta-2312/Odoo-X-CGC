import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import SideNavigation from './SideNavigation';
import StatsCard from './StatsCard';
import RequestsTable from './RequestsTable';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats: Array<{label:string;value:string;change:string;icon:any;color:'blue'|'green'|'yellow'|'purple'}> = [
    { label: 'Total Requests', value: '1,247', change: '+12%', icon: ClipboardList, color: 'blue' },
    { label: 'Active Workers', value: '89', change: '+5%', icon: Users, color: 'green' },
    { label: 'Pending Requests', value: '23', change: '-8%', icon: Clock, color: 'yellow' },
    { label: 'Revenue Today', value: '₹45,670', change: '+18%', icon: DollarSign, color: 'purple' }
  ];

  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [pending, mechs] = await Promise.all([
          api.get('/api/requests/pending'),
          api.get('/api/workshops'),
        ]);
        setRecentRequests(
          pending.map((r: any) => ({
            id: r._id,
            customer: r.userId?.name || 'User',
            service: Array.isArray(r.serviceTypes) && r.serviceTypes.length ? r.serviceTypes.join(', ') : r.serviceType,
            location: r.location?.address || 'GPS',
            mechanic: r.mechanicId ? 'Assigned' : '—',
            status: r.status,
            time: new Date(r.createdAt).toLocaleTimeString(),
          }))
        );
        setMechanics(mechs);
      } catch (e) {
        toast.error('Failed to load pending requests');
      }
    };
    load();
  }, []);

  const handleAssign = async (requestId: string) => {
    try {
      const mechanic = mechanics[0];
      if (!mechanic) return toast.error('No mechanics available');
      await api.post(`/api/requests/${requestId}/assign`, { mechanicId: mechanic.id, etaMinutes: 20 });
      toast.success('Assigned');
      // refresh list
      const pending = await api.get('/api/requests/pending');
      setRecentRequests(
        pending.map((r: any) => ({
          id: r._id,
          customer: r.userId?.name || 'User',
          service: Array.isArray(r.serviceTypes) && r.serviceTypes.length ? r.serviceTypes.join(', ') : r.serviceType,
          location: r.location?.address || 'GPS',
          mechanic: r.mechanicId ? 'Assigned' : '—',
          status: r.status,
          time: new Date(r.createdAt).toLocaleTimeString(),
        }))
      );
    } catch (e) {
      toast.error('Assignment failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideNavigation userType="admin" />
      
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor and manage platform operations</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>

          {/* Requests Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Recent Requests</h2>
            </div>
            <RequestsTable requests={recentRequests} onAssign={handleAssign} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
