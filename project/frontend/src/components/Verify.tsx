import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Key, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const Verify: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const emailFromUrl = searchParams.get('email');
  const isGoogleAuth = searchParams.get('google') === 'true';
  
  const [email, setEmail] = useState(() => emailFromUrl || '');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError(null);
    setMessage(null);
    
    // Validate OTP format
    const cleanOtp = otp.replace(/\s/g, ''); // Remove any spaces
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Sending OTP verification:', { 
        email: email.trim(), 
        otp: cleanOtp,
        isGoogleAuth 
      });
      
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: cleanOtp 
        })
      });

      console.log('Response status:', response.status);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }
      
      console.log('OTP verification response:', data);

      if (response.ok) {
        if (isGoogleAuth && data.token) {
          setMessage('✅ Verification successful! Redirecting to dashboard...');
          
          localStorage.setItem('accessToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setTimeout(() => {
            switch (data.user.role) {
              case 'admin':
                navigate('/admin');
                break;
              case 'mechanic':
                navigate('/mechanic');
                break;
              default:
                navigate('/user');
            }
          }, 1500);
        } else if (data.needsRegistration) {
          setMessage('✅ Email verified! Redirecting to registration...');
          setTimeout(() => {
            navigate('/register', { state: { email, verified: true } });
          }, 1500);
        } else {
          setMessage('✅ Verification successful!');
          setTimeout(() => {
            navigate('/auth');
          }, 1500);
        }
      } else {
        // Handle error response from server
        console.error('Verification failed:', data);
        
        // Show debug info in development
        if (data.expected && data.received) {
          setError("Invalid OTP.");
        } else {
          setError(data.error || 'Invalid OTP. Please check the 6-digit code from your email.');
        }
        
        // Clear OTP on error
        setOtp('');
      }
    } catch (err: any) {
      console.error('Network error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 6 digits
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(value);
    setError(null);
    setMessage(null);
  };

  const handleResend = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setTimer(300);
        setMessage('📧 New OTP sent to your email');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/auth')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 ml-4">
            {isGoogleAuth ? 'Complete Google Sign-in' : 'Verify Email'}
          </h1>
        </div>

        {/* RoadGuard Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">RG</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">RoadGuard</h2>
          <p className="text-gray-600 text-sm">Smart Roadside Assistance</p>
        </div>

        {/* Google Auth Notice */}
        {isGoogleAuth && (
          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="text-blue-600" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Google Authentication</p>
                <p className="text-xs text-blue-600">Check your Gmail for the OTP</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="text-blue-600" size={20} />
            <div>
              <p className="text-sm text-gray-600">OTP sent to:</p>
              <p className="font-semibold text-gray-800">{email}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit OTP
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? 'border-red-500' : 'border-gray-200 focus:border-blue-500'
                }`}
                placeholder="000000"
                maxLength={6}
                required
                autoComplete="off"
                inputMode="numeric"
                pattern="[0-9]{6}"
                disabled={isLoading}
              />
            </div>
            {otp && otp.length < 6 && (
              <p className="text-xs text-gray-500 mt-1">
                Enter all 6 digits ({otp.length}/6)
              </p>
            )}
            {otp.length === 6 && !error && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Ready to verify
              </p>
            )}
          </div>

          {/* Show current OTP for debugging
          {process.env.NODE_ENV === 'development' && otp && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <p className="text-xs text-yellow-800">Debug: OTP entered = "{otp}"</p>
            </div>
          )} */}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">❌</span>
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}

          {message && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-xl border ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {message}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Time remaining: <span className="font-mono text-orange-600">{formatTime(timer)}</span>
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || isLoading}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <RefreshCw size={16} />
              Resend OTP
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Verify;