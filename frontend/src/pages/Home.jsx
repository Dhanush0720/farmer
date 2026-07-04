import React from 'react';
import { useAuth } from '../context/AuthContext';
import GuestDashboard from './dashboards/GuestDashboard';
import UserDashboard from './dashboards/UserDashboard';
import FarmerDashboard from './dashboards/FarmerDashboard';
import MarketDashboard from './dashboards/MarketDashboard';

const Home = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-agri-green border-t-transparent"></div>
          <p className="mt-4 text-agri-soil-dark font-medium">Checking authorization status...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <GuestDashboard />;
  }

  // Route to the dashboard matching user's MERN RBAC role
  switch (user.role) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'market_owner':
      return <MarketDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};

export default Home;
