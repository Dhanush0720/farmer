import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Search, MapPin, TrendingUp, Sprout, ArrowRight, UserPlus } from 'lucide-react';

const GuestDashboard = () => {
  const { t } = useLanguage();
  const { apiUrl } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [markets, setMarkets] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketsRes, listingsRes] = await Promise.all([
          fetch(`${apiUrl}/markets`),
          fetch(`${apiUrl}/listings`)
        ]);
        const marketsData = await marketsRes.json();
        const listingsData = await listingsRes.json();
        
        if (marketsData.success) setMarkets(marketsData.data.slice(0, 3));
        if (listingsData.success) setListings(listingsData.data.slice(0, 4));
      } catch (err) {
        console.error("Error loading guest data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-agri-green-dark to-agri-green-medium px-6 py-12 text-white shadow-xl sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
            🚨 Live Prices Board
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {t('guestWelcome')}
          </h1>
          <p className="text-base sm:text-lg text-agri-green-light max-w-md">
            {t('guestSub')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              to="/register"
              className="flex items-center justify-center px-6 h-12 bg-white text-agri-green-dark font-bold rounded-lg shadow-md hover:bg-agri-green-light transition tap-effect"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Join KrishiMarket
            </Link>
            <Link
              to="/prices"
              className="flex items-center justify-center px-6 h-12 border border-white text-white font-bold rounded-lg hover:bg-white/10 transition"
            >
              {t('browseLivePrices')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
        {/* Dynamic ambient leaf pattern */}
        <div className="absolute right-0 bottom-0 opacity-15 text-[150px] pointer-events-none select-none">🌾</div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Mandi Prices */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-extrabold text-agri-soil-dark flex items-center">
              <TrendingUp className="h-5 w-5 text-agri-green mr-2" />
              {t('mandiPriceBoard')}
            </h2>
            <Link to="/prices" className="text-sm font-bold text-agri-green hover:underline flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-agri-green-light shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading daily prices...</div>
            ) : markets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No active mandi prices logged today.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {markets.map(m => (
                  <div key={m._id} className="p-4 sm:p-5 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-agri-soil-dark text-base sm:text-lg">{m.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center mt-0.5">
                          <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                          {m.district}, {m.state}
                        </p>
                      </div>
                      <span className="text-xs bg-agri-green-light text-agri-green-dark px-2.5 py-1 rounded-full font-bold">
                        {t('verified')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 bg-gray-50 p-2.5 rounded-xl">
                      {m.priceBoard.slice(0, 4).map((p, idx) => (
                        <div key={idx} className="text-center p-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                          <p className="text-xs font-bold text-agri-soil-dark truncate">{p.cropName}</p>
                          <p className="text-sm font-extrabold text-agri-green-dark mt-0.5">
                            ₹{p.priceMin} - {p.priceMax}
                          </p>
                          <p className="text-[10px] text-gray-400">/{p.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nearby Mandis & Quick Links */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-extrabold text-agri-soil-dark flex items-center px-1">
              <MapPin className="h-5 w-5 text-agri-green mr-2" />
              {t('nearbyMandis')}
            </h2>
            <div className="bg-white rounded-2xl border border-agri-green-light shadow-sm p-5 space-y-4">
              {loading ? (
                <p className="text-sm text-gray-500 text-center">Loading mandis...</p>
              ) : markets.length === 0 ? (
                <p className="text-sm text-gray-500">No mandis near you.</p>
              ) : (
                markets.map(m => (
                  <div key={m._id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-xl transition">
                    <span className="text-2xl mt-1">🏫</span>
                    <div>
                      <h4 className="font-bold text-sm text-agri-soil-dark">{m.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{m.location.address}</p>
                      <p className="text-[10px] text-agri-green-dark font-semibold mt-1 bg-agri-green-light px-2 py-0.5 rounded-md inline-block">
                        License: {m.licenseNumber}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fresh listings segment */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-xl font-extrabold text-agri-soil-dark flex items-center">
            <Sprout className="h-5 w-5 text-agri-green mr-2" />
            {t('cropListings')}
          </h2>
          <Link to="/listings" className="text-sm font-bold text-agri-green hover:underline flex items-center">
            Browse All Crop Listings <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-agri-green-light p-8 text-center text-gray-500">
            No crop listings posted by farmers yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map(l => (
              <div key={l._id} className="bg-white rounded-2xl border border-agri-green-light p-4 shadow-sm hover:shadow-md transition transition-card flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-agri-green-dark bg-agri-green-light px-2.5 py-0.5 rounded-full">
                      {l.qualityGrade}
                    </span>
                    <span className="text-xs text-gray-400 font-semibold uppercase">{l.status}</span>
                  </div>

                  <h3 className="font-bold text-lg text-agri-soil-dark">{l.cropType}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    📍 {l.location.village}, {l.location.district}
                  </p>
                  
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-600">
                      Volume: <span className="font-semibold text-agri-soil-dark">{l.volume} {l.unit}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Expected Price: <span className="font-semibold text-agri-soil-dark">₹{l.expectedPrice}/{l.unit}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center h-10 bg-agri-green text-xs font-bold text-white rounded-lg hover:bg-agri-green-dark transition shadow-sm"
                  >
                    Login to Message
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestDashboard;
