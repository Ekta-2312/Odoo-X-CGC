import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './LoadingSpinner';

export const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');
      
      if (token) {
        try {
          await loginWithGoogle({ token });
          navigate('/success');
        } catch (error) {
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );
};
