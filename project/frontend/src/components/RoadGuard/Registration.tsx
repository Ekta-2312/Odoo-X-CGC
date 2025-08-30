import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Phone, Car, Wrench, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Registration: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    role: 'user'
  });
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'user@gmail.com';

  const roles = [
    { 
      id: 'user', 
      label: 'Vehicle Owner', 
      icon: User, 
      desc: 'Request roadside assistance services',
      color: 'border-blue-500 bg-blue-50'
    },
    { 
      id: 'mechanic', 
      label: 'Mechanic/Worker', 
      icon: Wrench, 
      desc: 'Provide assistance and repair services',
      color: 'border-orange-500 bg-orange-50'
    },
    { 
      id: 'admin', 
      label: 'Workshop Owner', 
      icon: Settings, 
      desc: 'Manage operations and workers',
      color: 'border-purple-500 bg-purple-50'
    }
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.role === 'user' && (!formData.vehicleMake || !formData.licensePlate)) {
      toast.error('Please provide vehicle information');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: formData.name,
          mobile: formData.mobile,
          role: formData.role,
          vehicleDetails: formData.role === 'user' ? {
            make: formData.vehicleMake,
            model: formData.vehicleModel,
            year: formData.vehicleYear,
            licensePlate: formData.licensePlate,
            vehicleType: 'car'
          } : {}
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration completed successfully!');
        
        // Store token and user data
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate based on role
        setTimeout(() => {
          switch (data.user.role) {
            case 'user':
              navigate('/user');
              break;
            case 'mechanic':
              navigate('/mechanic');
              break;
            case 'admin':
              navigate('/admin');
              break;
          }
        }, 1000);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          className="flex items-center space-x-3 mb-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate('/otp')} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Complete Profile</h1>
        </motion.div>

        <motion.div 
          className="bg-white rounded-2xl card-shadow-lg p-6 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Email Display */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-700">
              ✓ Email verified: <span className="font-semibold">{email}</span>
            </p>
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Select Your Role</label>
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <motion.button
                  key={role.id}
                  onClick={() => setFormData({...formData, role: role.id})}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    formData.role === role.id ? role.color : 'border-gray-200 hover:border-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-6 h-6 ${
                      formData.role === role.id ? 
                      (role.id === 'user' ? 'text-blue-600' : role.id === 'mechanic' ? 'text-orange-600' : 'text-purple-600') : 
                      'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-semibold text-gray-800">{role.label}</h3>
                      <p className="text-sm text-gray-600">{role.desc}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-700">Basic Information</label>
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="input-field"
            />
            <input
              type="tel"
              placeholder="Mobile Number *"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="input-field"
              maxLength={10}
            />
          </div>

          {/* Vehicle Information (only for users) */}
          {formData.role === 'user' && (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-700">Vehicle Information</label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Make *"
                  value={formData.vehicleMake}
                  onChange={(e) => setFormData({...formData, vehicleMake: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Model *"
                  value={formData.vehicleModel}
                  onChange={(e) => setFormData({...formData, vehicleModel: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Year"
                  value={formData.vehicleYear}
                  onChange={(e) => setFormData({...formData, vehicleYear: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="License Plate *"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
                  className="input-field"
                />
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            onClick={handleSubmit}
            className="w-full btn-primary"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Complete Registration
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Registration;
