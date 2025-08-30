import React, { useState } from 'react';
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Requests', value: '1,247', change: '+12%', icon: ClipboardList, color: 'blue' },
    { label: 'Active Workers', value: '89', change: '+5%', icon: Users, color: 'green' },
    { label: 'Pending Requests', value: '23', change: '-8%', icon: Clock, color: 'yellow' },
    { label: 'Revenue Today', value: '₹45,670', change: '+18%', icon: DollarSign, color: 'purple' }
  ];

  const recentRequests = [
    {
      id: 'RG123456',
      customer: 'Amit Sharma',
      service: 'Engine Breakdown',
      location: 'Andheri East',
      mechanic: 'Rajesh Kumar',
      status: 'in-progress',
      time: '2:30 PM'
    },
    {
      id: 'RG123457',
      customer: 'Sunita Verma',
      service: 'Tire Change',
      location: 'Borivali West',
      mechanic: 'Suresh Rathi',
      status: 'completed',
      time: '1:15 PM'
    },
    {
      id: 'RG123458',
      customer: 'Rahul Joshi',
      service: 'Battery Replacement',
      location: 'Dadar',
      mechanic: 'Amit Patil',
      status: 'pending',
      time: '3:00 PM'
    },
    {
      id: 'RG123459',
      customer: 'Priya Singh',
      service: 'Oil Change',
      location: 'Juhu',
      mechanic: 'Rajiv Mehta',
      status: 'in-progress',
      time: '4:45 PM'
    }
  ];

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
            <RequestsTable requests={recentRequests} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
