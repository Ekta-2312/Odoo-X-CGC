import React from 'react';
import { User, Clock, Trash2 } from 'lucide-react';

interface Request {
  id: string;
  customer: string;
  service: string;
  location: string;
  mechanic: string;
  status: string;
  time: string;
}

interface RequestsTableProps {
  requests: Request[];
  onAssign?: (requestId: string, mechanicId: string) => void;
  mechanics?: Array<{ id: string; name: string }>; // optional list for assignment
  onDelete?: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onAssign, mechanics, onDelete, onBulkDelete }) => {
  const [selected, setSelected] = React.useState<Record<string, string>>({});
  const [checked, setChecked] = React.useState<Record<string, boolean>>({});
  const allChecked = requests.length > 0 && requests.every(r => checked[r.id]);
  const anyChecked = requests.some(r => checked[r.id]);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-600';
      case 'assigned':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Service Requests</h3>
        <div className="flex items-center gap-3">
          {onAssign && (
            <span className="text-sm text-gray-500">Assign a mechanic to pending requests</span>
          )}
          {onBulkDelete && (
            <button
              disabled={!anyChecked}
              onClick={() => onBulkDelete(Object.keys(checked).filter(id => checked[id]))}
              className={`px-3 py-1 text-xs rounded ${anyChecked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            >
              Delete Selected
            </button>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={(e) => {
                      const next: Record<string, boolean> = {};
                      requests.forEach(r => next[r.id] = e.target.checked);
                      setChecked(next);
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mechanic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={!!checked[request.id]}
                      onChange={(e) => setChecked(prev => ({ ...prev, [request.id]: e.target.checked }))}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-800">{request.id}</div>
                      <div className="text-sm text-gray-600">{request.service}</div>
                      <div className="text-xs text-gray-500">{request.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{request.customer}</div>
                        <div className="text-sm text-gray-600 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{request.time}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">{request.mechanic}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {onAssign && mechanics && mechanics.length > 0 && (
                        <>
                          <select
                            value={selected[request.id] || mechanics[0].id}
                            onChange={(e) => setSelected((prev) => ({ ...prev, [request.id]: e.target.value }))}
                            className="border border-gray-300 rounded px-2 py-1 text-xs"
                          >
                            {mechanics.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => onAssign(request.id, selected[request.id] || mechanics[0].id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                          >
                            Assign
                          </button>
                        </>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(request.id)}
                          className="p-1 text-red-600 hover:text-red-700 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RequestsTable;
