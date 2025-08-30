import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Plus, Trash2, Edit2, ChevronLeft, Car, Bike, Bus, Star, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import UserMenu from './UserMenu';
import SideNavigation from './SideNavigation';

interface Vehicle {
  _id?: string;
  vehicleType: string;
  make?: string;
  model?: string;
  year?: string;
  licensePlate: string;
  color?: string;
  fuelType?: string;
  isDefault?: boolean;
}

const typeOptions = [
  { id: 'car', label: 'Car', icon: Car },
  { id: 'bike', label: 'Bike', icon: Bike },
  { id: 'scooter', label: 'Scooter', icon: Bike },
  { id: 'truck', label: 'Truck', icon: Bus },
  { id: 'van', label: 'Van', icon: Bus },
  { id: 'bus', label: 'Bus', icon: Bus },
  { id: 'other', label: 'Other', icon: Car },
];

const Vehicles: React.FC = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<Vehicle>({ vehicleType: 'car', licensePlate: '', fuelType: 'petrol' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const data = await api.get('/api/vehicles');
      setList(data);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load vehicles');
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.licensePlate) return toast.error('Plate is required');
    setLoading(true);
    try {
      if (editingId) {
        const updated = await api.put(`/api/vehicles/${editingId}`, form);
        setList(prev => prev.map(v => v._id === editingId ? updated : v));
        toast.success('Vehicle updated');
      } else {
        const created = await api.post('/api/vehicles', form);
        setList(prev => [created, ...prev]);
        toast.success('Vehicle added');
      }
      setForm({ vehicleType: 'car', licensePlate: '', fuelType: 'petrol' });
      setEditingId(null);
    } catch (e: any) {
      toast.error(e?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    await api.delete(`/api/vehicles/${id}`);
    setList(prev => prev.filter(v => v._id !== id));
    toast.success('Vehicle removed');
  };

  const setDefault = async (id?: string) => {
    if (!id) return;
    await api.post(`/api/vehicles/${id}/default`);
    setList(prev => prev.map(v => ({ ...v, isDefault: v._id === id })));
    toast.success('Default vehicle set');
  };

  const useForRequest = (v: Vehicle) => {
    navigate('/request', {
      state: {
        prefillVehicle: {
          vehicleType: v.vehicleType,
          make: v.make || '',
          model: v.model || '',
          year: v.year || '',
          plate: v.licensePlate,
          color: v.color || '',
          fuelType: v.fuelType || 'petrol',
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SideNavigation userType="user" />
      <div className="flex-1 lg:ml-64">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg mr-2"><ChevronLeft /></button>
              <h1 className="text-2xl font-semibold text-gray-800">My Vehicles</h1>
            </div>
            <UserMenu />
          </div>
        </div>

        <div className="p-6 space-y-6 max-w-3xl">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-semibold mb-3">Add / Edit Vehicle</h2>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} className="p-3 border rounded-lg">
              {typeOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <select value={form.fuelType} onChange={e => setForm({ ...form, fuelType: e.target.value })} className="p-3 border rounded-lg">
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="electric">Electric</option>
              <option value="hybrid">Hybrid</option>
              <option value="cng">CNG</option>
              <option value="lpg">LPG</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Make" value={form.make || ''} onChange={e => setForm({ ...form, make: e.target.value })} className="p-3 border rounded-lg" />
            <input placeholder="Model" value={form.model || ''} onChange={e => setForm({ ...form, model: e.target.value })} className="p-3 border rounded-lg" />
            <input placeholder="Year" value={form.year || ''} onChange={e => setForm({ ...form, year: e.target.value })} className="p-3 border rounded-lg" />
            <input placeholder="Plate Number" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value.toUpperCase() })} className="p-3 border rounded-lg" />
            <input placeholder="Color" value={form.color || ''} onChange={e => setForm({ ...form, color: e.target.value })} className="p-3 border rounded-lg" />
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={save} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"><Plus size={16} /> {editingId ? 'Update' : 'Add Vehicle'}</button>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm({ vehicleType: 'car', licensePlate: '', fuelType: 'petrol' }); }} className="px-4 py-2 border rounded-lg">Cancel</button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {list.map(v => {
            const TypeIcon = typeOptions.find(t => t.id === v.vehicleType)?.icon || Car;
            return (
              <div key={v._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><TypeIcon className="text-gray-700" size={20} /></div>
                  <div>
                    <div className="font-semibold text-gray-800 flex items-center gap-2">
                      {v.make || '—'} {v.model || ''}
                      {v.isDefault && <span className="text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1"><Star size={12}/> Default</span>}
                    </div>
                    <div className="text-sm text-gray-600">{v.vehicleType.toUpperCase()} • {v.fuelType?.toUpperCase()} • {v.licensePlate}</div>
                    <div className="text-xs text-gray-500">Year {v.year || '—'} • Color {v.color || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!v.isDefault && <button onClick={() => setDefault(v._id)} className="px-3 py-2 text-green-700 bg-green-50 rounded-lg flex items-center gap-1"><CheckCircle2 size={16}/> Default</button>}
                  <button onClick={() => { setEditingId(v._id!); setForm({ vehicleType: v.vehicleType, make: v.make, model: v.model, year: v.year, licensePlate: v.licensePlate, color: v.color, fuelType: v.fuelType }); }} className="px-3 py-2 border rounded-lg flex items-center gap-1"><Edit2 size={16}/> Edit</button>
                  <button onClick={() => useForRequest(v)} className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg">Use</button>
                  <button onClick={() => remove(v._id)} className="px-3 py-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-1"><Trash2 size={16}/> Delete</button>
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center text-gray-500">No vehicles yet. Add your first vehicle above.</div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
