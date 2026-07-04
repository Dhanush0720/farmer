import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-agri-green-light">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-agri-green border-t-transparent"></div>
          <p className="mt-4 text-agri-soil-dark font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !token) {
    // Redirect to login but save the path they tried to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && !user?.isOnboarded) {
    // Force onboarding step 2 if not completed
    if (location.pathname !== '/onboard') {
      return <Navigate to="/onboard" replace />;
    }
  }

  // Check role authorization
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to home if unauthorized
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
