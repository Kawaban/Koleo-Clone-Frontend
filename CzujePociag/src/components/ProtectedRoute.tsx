import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');

  // If not authenticated, redirect to login with current location
  if (!isAuthenticated) {
    return <Navigate 
      to="/login" 
      state={{ 
        returnTo: location.pathname,
        ...location.state // Pass along any existing state
      }} 
      replace 
    />;
  }

  // Check if we're on the map page
  if (location.pathname === '/map') {
    if (!location.state?.fromStation || !location.state?.toStation || !location.state?.date) {
      return <Navigate to="/" replace />;
    }
  }
  
  // Check if we're on the buy-ticket page
  if (location.pathname === '/buy-ticket') {
    if (!location.state?.trainNumber || !location.state?.from || !location.state?.to) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute; 