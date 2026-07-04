import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboard from './pages/onboarding/Onboard';
import MarketPrices from './pages/MarketPrices';
import CropListings from './pages/CropListings';
import FertilizerTool from './pages/FertilizerTool';
import Messages from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <div className="min-h-screen bg-[#f5f8f5]/40 flex flex-col font-sans">
            {/* Header Navigation */}
            <Navbar />

            {/* Main Application Surface */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Routes>
                {/* Public / Guest Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/prices" element={<MarketPrices />} />
                <Route path="/listings" element={<CropListings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Step 2 Onboarding (Authenticated but incomplete profiles) */}
                <Route
                  path="/onboard"
                  element={
                    <ProtectedRoute>
                      <Onboard />
                    </ProtectedRoute>
                  }
                />

                {/* Authenticated / Role-specific Routes */}
                <Route
                  path="/fertilizer"
                  element={
                    <ProtectedRoute allowedRoles={['farmer', 'user']}>
                      <FertilizerTool />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute allowedRoles={['farmer', 'user', 'market_owner']}>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-agri-green-light py-6 text-center text-xs text-gray-500">
              <div className="max-w-7xl mx-auto px-4">
                <p className="font-semibold text-agri-green-dark">🌾 KrishiMarket Agricultural Platform</p>
                <p className="mt-1">© 2026. Supporting local Indian agriculture, smart pricing boards, and direct trade verification.</p>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
