import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Phone, 
  Share2,
  Car,
  Wrench,
  Battery,
  User
} from 'lucide-react';
import UserMenu from './UserMenu';
import { api } from '../../lib/api';
import toast from 'react-hot-toast';

const WorkshopDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  type Mechanic = {
    _id: string;
    name?: string;
    email?: string;
    mobile?: string;
    phone?: string;
    contactNumber?: string;
    profileImage?: string;
    rating?: number;
    totalServices?: number;
    location?: { address?: string; latitude?: number; longitude?: number };
    isVerified?: boolean;
  };

  const [mech, setMech] = useState<Mechanic | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    const fetchMech = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data: Mechanic = await api.get(`/api/workshops/${id}`);
        if (!ignore) setMech(data);
      } catch (e) {
        toast.error('Workshop not found');
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchMech();
    return () => { ignore = true; };
  }, [id]);

  const display = useMemo(() => {
    const name = mech?.name || 'Mechanic';
    const phone = mech?.mobile || mech?.phone || mech?.contactNumber || 'Not specified';
    const address = mech?.location?.address || 'Address not specified';
    const rating = typeof mech?.rating === 'number' ? mech!.rating! : 0;
    const reviews = typeof mech?.totalServices === 'number' ? mech!.totalServices! : 0;
    const image = mech?.profileImage || 'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg';
    return { name, phone, address, rating, reviews, image };
  }, [mech]);

  const services = [
    { name: 'Engine Repair', price: '₹500+', icon: Car },
    { name: 'Towing Service', price: '₹300+', icon: Wrench },
    { name: 'Battery Service', price: '₹200+', icon: Battery }
  ];

  const reviews = [
    { name: 'Amit Singh', rating: 5, comment: 'Quick and professional service!', date: '2 days ago' },
    { name: 'Priya Sharma', rating: 4, comment: 'Good work, reasonable prices.', date: '1 week ago' },
    { name: 'Rahul Gupta', rating: 5, comment: 'Excellent emergency service at night.', date: '2 weeks ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/user')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">Workshop Details</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Share2 className="w-6 h-6 text-gray-600" />
            </button>
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="relative">
              <img src={display.image} alt={display.name} className="w-full h-64 object-cover" />
              <div className="absolute inset-0 bg-black opacity-30"></div>
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
                <h2 className="text-3xl font-bold text-white">{display.name}</h2>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">{display.rating}</span>
                  </div>
                  <span className="text-white">({display.reviews} reviews)</span>
                </div>
                <div className="flex space-x-4 mt-4">
                  <div className="flex items-center text-white">
                    <MapPin className="w-5 h-5" />
                    <span className="ml-1">{display.address}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Phone className="w-5 h-5" />
                    <span className="ml-1">{display.phone}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-white bg-green-500 px-3 py-1 rounded-full text-sm font-semibold">Open 24/7</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">Services Offered</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="bg-gray-100 p-4 rounded-lg flex items-center">
                    <service.icon className="w-6 h-6 text-gray-600" />
                    <div className="ml-3">
                      <h4 className="text-gray-800 font-semibold">{service.name}</h4>
                      <p className="text-gray-600">{service.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">Customer Reviews</h3>
                <div className="mt-2 space-y-4">
                  {reviews.map((review, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <User className="w-8 h-8 text-gray-600" />
                          <div className="ml-3">
                            <h4 className="text-gray-800 font-semibold">{review.name}</h4>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">{review.date}</span>
                      </div>
                      <p className="mt-2 text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center">
          <div className="bg-white px-4 py-2 rounded-lg shadow">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default WorkshopDetails;
