import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import RoadGuard Components
import SplashScreen from './components/RoadGuard/SplashScreen';
import AuthScreen from './components/RoadGuard/AuthScreen';
import OTPVerification from './components/RoadGuard/OTPVerification';
import Registration from './components/RoadGuard/Registration';
import UserDashboard from './components/RoadGuard/UserDashboard';
import MechanicDashboard from './components/RoadGuard/MechanicDashboard';
import AdminDashboard from './components/RoadGuard/AdminDashboard';
import ServiceRequest from './components/RoadGuard/ServiceRequest';
import TrackRequest from './components/RoadGuard/TrackRequest';
import WorkshopDetails from './components/RoadGuard/WorkshopDetails';
import PaymentGateway from './components/RoadGuard/PaymentGateway';
import RatingsReview from './components/RoadGuard/RatingsReview';
import RequestHistory from './components/RoadGuard/RequestHistory';
import Vehicles from './components/RoadGuard/Vehicles';

// Keep existing components for backward compatibility
import { Verify } from './components/Verify';

const TokenHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const role = searchParams.get('role');
    
    if (token) {
      localStorage.setItem('accessToken', token);
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userData = {
          id: payload.userId,
          email: payload.email,
          role: payload.role || role || 'user',
          name: payload.name || 'User'
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate based on role
        switch (userData.role) {
          case 'admin':
            navigate('/admin', { replace: true });
            break;
          case 'mechanic':
            navigate('/mechanic', { replace: true });
            break;
          default:
            navigate('/user', { replace: true });
        }
      } catch (error) {
        console.error('Error parsing token:', error);
        navigate('/auth', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Setting up your account...</p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('accessToken');
  
  if (!token || !user.id) {
    return <Navigate to="/auth" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
      
      <Routes>
        {/* Splash & Auth */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/dashboard" element={<TokenHandler />} />
        
        {/* User Routes */}
        <Route 
          path="/user" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/request" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <ServiceRequest />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/track" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <TrackRequest />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/workshop/:id" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <WorkshopDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payment" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <PaymentGateway />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/review" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <RatingsReview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <RequestHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Vehicles />
            </ProtectedRoute>
          } 
        />
        
        {/* Mechanic Routes */}
        <Route 
          path="/mechanic" 
          element={
            <ProtectedRoute allowedRoles={['mechanic']}>
              <MechanicDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
};

export default App;