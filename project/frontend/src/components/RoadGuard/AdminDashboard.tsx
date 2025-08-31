import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, ClipboardList, Clock, DollarSign, RefreshCw, Filter } from 'lucide-react';
import SideNavigation from './SideNavigation';
import StatsCard from './StatsCard';
import RequestsTable from './RequestsTable';
import { api } from '../../lib/api';
import { getSocket } from '../../lib/socket';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  // const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState<Array<{label:string;value:string;change:string;icon:any;color:'blue'|'green'|'yellow'|'purple'}>>([
    { label: 'Total Requests', value: '—', change: '', icon: ClipboardList, color: 'blue' },
    { label: 'Active Workers', value: '—', change: '', icon: Users, color: 'green' },
    { label: 'Pending Requests', value: '—', change: '', icon: Clock, color: 'yellow' },
    { label: 'Revenue Today', value: '—', change: '', icon: DollarSign, color: 'purple' }
  ]);

  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'pending' | 'all'>('all');
  const [autoFallbackAll, setAutoFallbackAll] = useState(false);
  const location = useLocation();
  const activeTab = useMemo<'dashboard' | 'requests' | 'workers' | 'analytics' | 'settings'>(() => {
    const params = new URLSearchParams(location.search);
    const t = (params.get('tab') || 'dashboard') as any;
    return ['dashboard','requests','workers','analytics','settings'].includes(t) ? t : 'dashboard';
  }, [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
  setAuthError(null);
        const promises: Promise<any>[] = [] as any;
        // Load mechanics list
        // - Workers tab needs FULL list (including unverified) via admin endpoint
        // - Other tabs can use public list (verified only) for assignment
        if (activeTab === 'workers') {
          promises.push(api.get('/api/workshops/admin/all'));
        } else {
          promises.push(api.get('/api/workshops'));
        }
        // Only load requests data for dashboard/requests tabs
        if (activeTab === 'dashboard' || activeTab === 'requests') {
          promises.push(filter === 'pending' ? api.get('/api/requests/pending') : api.get('/api/requests/all'));
        }
        const settled = await Promise.allSettled(promises);
        // Map results
        const mechsR = settled[0];
        const reqR = (activeTab === 'dashboard' || activeTab === 'requests') ? settled[1] : null;
        if (reqR && reqR.status === 'rejected') {
          const msg = String(reqR.reason?.message || reqR.reason || '');
          const notAuth = msg.includes('Unauthorized') || msg.includes('Forbidden');
          if (notAuth) {
            setAuthError('This page requires admin access. Please log in as an admin.');
          } else {
            toast.error('Failed to load pending requests');
          }
        }
        let requests = reqR && reqR.status === 'fulfilled' ? reqR.value : [];
        // Auto-fallback to All if Pending is empty (common when mechanics accept quickly)
        if ((activeTab === 'dashboard' || activeTab === 'requests') && filter === 'pending' && Array.isArray(requests) && requests.length === 0) {
          try {
            const all = await api.get('/api/requests/all');
            requests = all;
            setAutoFallbackAll(true);
          } catch {
            setAutoFallbackAll(false);
          }
        } else {
          setAutoFallbackAll(false);
        }
        const mechs = (mechsR as any).status === 'fulfilled' ? (mechsR as any).value : [];
        setRecentRequests(
          (Array.isArray(requests) ? requests : []).map((r: any) => ({
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
        // live stats
        if (activeTab === 'dashboard' || activeTab === 'requests') {
          setStats((prev) => [
            { ...prev[0], value: String((requests || []).length) },
            { ...prev[1], value: String(mechs.length) },
            { ...prev[2], value: String((requests || []).filter((r: any) => ['submitted','assigned'].includes(r.status)).length) },
            prev[3],
          ]);
        } else {
          setStats((prev) => [
            { ...prev[0], value: '—' },
            { ...prev[1], value: String(mechs.length) },
            { ...prev[2], value: '—' },
            prev[3],
          ]);
        }
      } catch (e) {
        toast.error('Failed to load pending requests');
      }
    };
    load();
    // Live updates via socket
    const s = getSocket();
    const onUpdate = async () => {
      if (!(activeTab === 'dashboard' || activeTab === 'requests')) return;
      try {
        const [reqR] = await Promise.allSettled([
          filter === 'pending' ? api.get('/api/requests/pending') : api.get('/api/requests/all'),
        ]);
        if (reqR.status === 'rejected') return; // keep last good state
        const requests = reqR.status === 'fulfilled' ? reqR.value : [];
        setRecentRequests(
          requests.map((r: any) => ({
            id: r._id,
            customer: r.userId?.name || 'User',
            service: Array.isArray(r.serviceTypes) && r.serviceTypes.length ? r.serviceTypes.join(', ') : r.serviceType,
            location: r.location?.address || 'GPS',
            mechanic: r.mechanicId ? 'Assigned' : '—',
            status: r.status,
            time: new Date(r.createdAt).toLocaleTimeString(),
          }))
        );
        setStats((prev) => [
          { ...prev[0], value: String(requests.length) },
          prev[1],
          { ...prev[2], value: String((requests || []).filter((r: any) => ['submitted','assigned'].includes(r.status)).length) },
          prev[3],
        ]);
      } catch {}
    };
    s.on('request:new', onUpdate);
    s.on('request:updated', onUpdate);
    return () => {
      s.off('request:new', onUpdate);
      s.off('request:updated', onUpdate);
    };
  }, [filter, activeTab]);

  const handleAssign = async (requestId: string, mechanicId: string) => {
    try {
      if (!mechanicId) return toast.error('Select a mechanic');
      await api.post(`/api/requests/${requestId}/assign`, { mechanicId, etaMinutes: 20 });
      toast.success('Assigned');
      // refresh list
      const refreshed = await (filter === 'pending' ? api.get('/api/requests/pending') : api.get('/api/requests/all'));
      setRecentRequests(
        refreshed.map((r: any) => ({
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

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/requests/${id}`);
      toast.success('Request deleted');
      const refreshed = await (filter === 'pending' ? api.get('/api/requests/pending') : api.get('/api/requests/all'));
      setRecentRequests(
        refreshed.map((r: any) => ({
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
      toast.error('Delete failed');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    try {
      await api.post('/api/requests/bulk-delete', { ids });
      toast.success('Deleted selected');
      const refreshed = await (filter === 'pending' ? api.get('/api/requests/pending') : api.get('/api/requests/all'));
      setRecentRequests(
        refreshed.map((r: any) => ({
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
      // Fallback: attempt to delete one-by-one
      let ok = 0;
      for (const id of ids) {
        try {
          await api.delete(`/api/requests/${id}`);
          ok++;
        } catch {}
      }
      if (ok > 0) {
        toast.success(`Deleted ${ok} of ${ids.length}`);
        const refreshed = await (filter === 'pending' ? api.get('/api/requests/pending') : api.get('/api/requests/all'));
        setRecentRequests(
          refreshed.map((r: any) => ({
            id: r._id,
            customer: r.userId?.name || 'User',
            service: Array.isArray(r.serviceTypes) && r.serviceTypes.length ? r.serviceTypes.join(', ') : r.serviceType,
            location: r.location?.address || 'GPS',
            mechanic: r.mechanicId ? 'Assigned' : '—',
            status: r.status,
            time: new Date(r.createdAt).toLocaleTimeString(),
          }))
        );
      } else {
        toast.error('Bulk delete failed');
      }
    }
  };

  const handleVerifyToggle = async (id: string, isVerified: boolean) => {
    try {
      await api.patch(`/api/workshops/admin/${id}/verify`, { isVerified });
      // refresh mechanics list on workers tab
      const data = await api.get('/api/workshops/admin/all');
      setMechanics(data);
      toast.success(isVerified ? 'Mechanic verified' : 'Mechanic unverified');
    } catch {
      toast.error('Failed to update verification');
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
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Admin Dashboard'}
                {activeTab === 'requests' && 'Requests'}
                {activeTab === 'workers' && 'Workers'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'dashboard' && 'Monitor and manage platform operations'}
                {activeTab === 'requests' && 'Assign and track service requests'}
                {activeTab === 'workers' && 'Manage registered mechanics'}
                {activeTab === 'analytics' && 'Overview of key metrics'}
                {activeTab === 'settings' && 'Configuration'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
              {(activeTab === 'dashboard' || activeTab === 'requests') && (
                <div className="flex items-center space-x-2">
                  <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
                    <button onClick={() => setFilter('pending')} className={`px-3 py-1 text-sm ${filter==='pending' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                      <span className="inline-flex items-center gap-1"><Filter className="w-4 h-4"/> Pending</span>
                    </button>
                    <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm border-l border-gray-200 ${filter==='all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}>
                      All
                    </button>
                  </div>
                  <button onClick={() => window.location.reload()} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh">
                    <RefreshCw className="w-4 h-4 text-gray-600"/>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Recent Requests</h2>
                  {autoFallbackAll && (
                    <p className="mt-1 text-xs text-gray-500">No pending requests found — showing all requests.</p>
                  )}
                </div>
                {authError ? (
                  <div className="p-6 text-center space-y-4">
                    <p className="text-red-600 font-medium">{authError}</p>
                    <div className="space-x-2">
                      <button onClick={() => navigate('/login')} className="px-4 py-2 bg-blue-600 text-white rounded">Go to Login</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {recentRequests.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">No pending requests yet.</div>
                    ) : (
                      <RequestsTable
                        requests={recentRequests}
                        onAssign={handleAssign}
                        mechanics={mechanics.map((m: any) => ({ id: String(m.id), name: m.name }))}
                        onDelete={handleDelete}
                        onBulkDelete={handleBulkDelete}
                      />
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">All Requests</h2>
                {autoFallbackAll && (
                  <p className="mt-1 text-xs text-gray-500">No pending requests found — showing all requests.</p>
                )}
              </div>
              <RequestsTable
                requests={recentRequests}
                onAssign={handleAssign}
                mechanics={mechanics.map((m: any) => ({ id: String(m.id), name: m.name }))}
                onDelete={handleDelete}
                onBulkDelete={handleBulkDelete}
              />
            </div>
          )}

          {activeTab === 'workers' && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Registered Mechanics</h2>
                <span className="text-sm text-gray-500">Total: {mechanics.length}</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2">Name</th>
                      <th className="text-left px-4 py-2">Phone</th>
                      <th className="text-left px-4 py-2">Rating</th>
                      <th className="text-left px-4 py-2">Jobs</th>
                      <th className="text-left px-4 py-2">Address</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mechanics.map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{m.name}{m.isVerified && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>}</td>
                        <td className="px-4 py-2">{m.mobile || '—'}</td>
                        <td className="px-4 py-2">{Number(m.rating || 0).toFixed(1)}</td>
                        <td className="px-4 py-2">{m.totalServices || 0}</td>
                        <td className="px-4 py-2">{m.location?.address || '—'}</td>
                        <td className="px-4 py-2 space-x-2">
                          {m.isVerified ? (
                            <button onClick={() => handleVerifyToggle(m.id, false)} className="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200">Unverify</button>
                          ) : (
                            <button onClick={() => handleVerifyToggle(m.id, true)} className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700">Verify</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
              <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Charts and reports coming soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Settings will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
