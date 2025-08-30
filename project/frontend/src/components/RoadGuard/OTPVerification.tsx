import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const OTPVerification: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get email from URL params (Google auth) or location state (regular auth)
  const email = searchParams.get('email') || location.state?.email || '';
  const isGoogleAuth = searchParams.get('google') === 'true';

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }

      // Auto-submit when all fields are filled
      if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
        handleVerify(newOtp.join(''));
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    
    if (code.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    if (!email) {
      toast.error('Email not found. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Verifying OTP with backend:', { email, otp: code, isGoogleAuth });
      
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          otp: code.trim() 
        })
      });

      const data = await response.json();
      console.log('Backend response:', response.status, data);

      if (response.ok) {
        if (isGoogleAuth && data.token) {
          // Google auth flow - user is created and logged in
          toast.success('OTP verified successfully!');
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
          }, 1000);
        } else if (data.needsRegistration) {
          // Regular verification - proceed to registration
          toast.success('OTP verified successfully!');
          navigate('/register', { state: { email, verified: true } });
        } else {
          // Fallback
          toast.success('OTP verified successfully!');
          navigate('/register', { state: { email, verified: true } });
        }
      } else {
        // Show error from backend
        toast.error(data.error || 'Invalid OTP. Please try again.');
        // Clear the OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        // Focus first input
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email not found. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setTimeLeft(60);
        setCanResend(false);
        toast.success('OTP resent to your email');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if no email found
  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl card-shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Email Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to find the email address for verification.</p>
          <button 
            onClick={() => navigate('/auth')}
            className="btn-primary"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div 
          className="flex items-center space-x-3 mb-8"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button 
            onClick={() => navigate('/auth')} 
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Verify Email</h1>
        </motion.div>

        {/* OTP Card */}
        <motion.div 
          className="bg-white rounded-2xl card-shadow-lg p-8 space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Google Auth Notice */}
          {isGoogleAuth && (
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
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

          {/* Email Info */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit verification code to
              </p>
              <p className="font-semibold text-blue-600 break-all">{email}</p>
            </div>
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  maxLength={1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  disabled={isLoading}
                />
              ))}
            </div>

            <button
              onClick={() => handleVerify()}
              disabled={otp.join('').length !== 6 || isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>

          {/* Resend */}
          <div className="text-center space-y-3">
            {!canResend ? (
              <p className="text-gray-600 text-sm">
                Resend code in <span className="font-semibold text-blue-600">{timeLeft}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mx-auto disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">Resend OTP</span>
              </button>
            )}
            
            <button
              onClick={() => navigate('/auth')}
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Use different email address
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerification;
