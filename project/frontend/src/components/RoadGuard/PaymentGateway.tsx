import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Shield,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const PaymentGateway: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentData, setPaymentData] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const serviceDetails = {
    service: 'Engine Breakdown Repair',
    mechanic: 'Rajesh Kumar',
    duration: '45 minutes',
    parts: '₹800',
    labor: '₹500',
    tax: '₹117',
    total: '₹1,417'
  };

  const paymentMethods = [
    { 
      id: 'upi', 
      label: 'UPI Payment', 
      icon: Smartphone, 
      desc: 'Pay using UPI apps',
      popular: true
    },
    { 
      id: 'card', 
      label: 'Credit/Debit Card', 
      icon: CreditCard, 
      desc: 'Visa, Mastercard, RuPay'
    },
    { 
      id: 'wallet', 
      label: 'Digital Wallet', 
      icon: Wallet, 
      desc: 'Paytm, PhonePe, Google Pay'
    }
  ];

  const handlePayment = () => {
    if (selectedMethod === 'upi' && !paymentData.upiId) {
      toast.error('Please enter UPI ID');
      return;
    }
    
    if (selectedMethod === 'card' && (!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv)) {
      toast.error('Please fill in all card details');
      return;
    }

    toast.success('Payment processing...');
    
    setTimeout(() => {
      toast.success('Payment successful!');
      navigate('/review');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/track')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Payment</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <motion.div 
          className="bg-white rounded-xl p-6 card-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Service Completed</h3>
              <p className="text-sm text-gray-600">Ready for payment</p>
            </div>
          </div>

          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium text-gray-800">{serviceDetails.service}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Mechanic:</span>
              <span className="font-medium text-gray-800">{serviceDetails.mechanic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-800">{serviceDetails.duration}</span>
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Payment Method</h2>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div 
                key={method.id} 
                onClick={() => setSelectedMethod(method.id)} 
                className={`flex items-center p-4 rounded-lg cursor-pointer 
                  ${selectedMethod === method.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
              >
                <method.icon className="w-8 h-8 text-gray-700 mr-3" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{method.label}</h3>
                  <p className="text-sm text-gray-600">{method.desc}</p>
                </div>
                {selectedMethod === method.id && (
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handlePayment}
          className="w-full btn-success text-lg font-bold py-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Pay {serviceDetails.total}
        </motion.button>
      </div>
    </div>
  );
};

export default PaymentGateway;
