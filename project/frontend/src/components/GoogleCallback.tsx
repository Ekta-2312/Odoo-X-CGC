import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from './LoadingSpinner';

export const GoogleCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        if (!code) {
          throw new Error('No code received');
        }

        // Send code to your backend
        const response = await fetch('http://localhost:5000/api/auth/google/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to authenticate');
        }

        // On success, navigate to success page
        navigate('/success');
      } catch (error) {
        console.error('Google callback error:', error);
        navigate('/login');
      }
    };

    handleGoogleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  );
};
