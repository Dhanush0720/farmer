import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, MessageSquare, Sprout, Search, Bell, MapPin, CheckCircle } from 'lucide-react';

const UserDashboard = () => {
  const { user, token, updatePreferences, apiUrl } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alert simulation states
  const [alertCrop, setAlertCrop] = useState('Wheat');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  // Search filter
  const [searchCrop, setSearchCrop] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsRes, marketsRes] = await Promise.all([
          fetch(`${apiUrl}/listings`),
          fetch(`${apiUrl}/markets`)
        ]);
        const listData = await listingsRes.json();
        const markData = await marketsRes.json();

        if (listData.success) setListings(listData.data);
        if (markData.success) setMarkets(markData.data);
      } catch (err) {
        console.error("Error fetching trader data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiUrl]);

  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!alertPrice) return;

    const newAlert = {
      cropName: alertCrop,
      targetPrice: Number(alertPrice),
      alertType: 'sms'
    };

    const currentAlerts = user.priceAlerts || [];
    const updatedAlerts = [...currentAlerts, newAlert];

    const res = await updatePreferences({ priceAlerts: updatedAlerts });
    if (res.success) {
      setAlertSuccess(true);
      setAlertPrice('');
      setTimeout(() => setAlertSuccess(false), 4000);
      console.log(`[SIMULATION ALERT] Created SMS trigger for ${alertCrop} @ ₹${alertPrice}`);
    }
  };

  const handleToggleMandiSave = async (mandiId) => {
    const currentSaved = user.savedMarkets || [];
    let updated;
    if (currentSaved.includes(mandiId)) {
      updated = currentSaved.filter(id => id !== mandiId);
    } else {
      updated = [...currentSaved, mandiId];
    }
    await updatePreferences({ savedMarkets: updated });
  };

  const handleMessageFarmer = (listingId) => {
    // Navigate to listings and open message drawer, or direct chat
    navigate(`/messages?listingId=${listingId}`);
  };

  const filteredListings = listings.filter(l => 
    l.cropType.toLowerCase().includes(searchCrop.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl border border-agri-green-light p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-soil-dark">
            {t('dashboardHeader')}, {user.name} 👋
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-1">
            Browse verified farmer offerings, compare local mandi boards, and negotiate contracts securely.
          </p>
        </div>
        <div className="flex space-x-2">
          <Link
            to="/prices"
            className="flex items-center justify-center px-4 h-12 bg-agri-green text-white font-bold rounded-lg shadow hover:bg-agri-green-dark transition"
          >
            <TrendingUp className="h-5 w-5 mr-2" />
            {t('navBrowsePrices')}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Section: Crop Listings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <h2 className="text-xl font-extrabold text-agri-soil-dark flex items-center">
              <Sprout className="h-5 w-5 text-agri-green mr-2" />
              Verified Farmer Listings
            </h2>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute inset-y-0 left-0 pl-3 h-5 w-5 my-auto text-gray-400" />
              <input
                type="text"
                placeholder={t('searchCropsPlaceholder')}
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-lg pl-9 pr-3 text-sm focus:border-agri-green focus:outline-none"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading crop listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-agri-green-light p-8 text-center text-gray-500">
              No matching crop listings found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredListings.map(l => (
                <div key={l._id} className="bg-white rounded-2xl border border-agri-green-light p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold text-agri-green-dark bg-agri-green-light px-2.5 py-0.5 rounded-full">
                        {l.qualityGrade}
                      </span>
                      <span className="text-xs text-agri-green-dark bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                        {t('verified')}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-agri-soil-dark">{l.cropType}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📍 Village: {l.location.village}, {l.location.district}
                    </p>
                    
                    <div className="mt-3 space-y-1 text-sm text-gray-700">
                      <p>
                        Volume: <span className="font-bold text-agri-soil-dark">{l.volume} {l.unit}</span>
                      </p>
                      <p>
                        Expected Price: <span className="font-bold text-agri-soil-dark">₹{l.expectedPrice} / {l.unit}</span>
                      </p>
                      {l.description && (
                        <p className="text-xs italic text-gray-500 mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                          "{l.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleMessageFarmer(l._id)}
                    className="mt-4 flex items-center justify-center w-full h-11 bg-agri-green text-sm font-bold text-white rounded-lg hover:bg-agri-green-dark transition shadow-sm tap-effect"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Farmer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Subscriptions & Alerts */}
        <div className="space-y-6">
          
          {/* SMS Alerts Setup Simulator */}
          <div className="bg-white rounded-2xl border border-agri-green-light p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-agri-soil-dark flex items-center">
              <Bell className="h-5 w-5 text-agri-amber-dark mr-2" />
              {t('smsAlerts')}
            </h3>

            {alertSuccess && (
              <div className="flex items-center space-x-2 rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-200">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>Simulated SMS alert registered! You will receive messages when prices match.</span>
              </div>
            )}

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Crop Type</label>
                <select
                  value={alertCrop}
                  onChange={(e) => setAlertCrop(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg px-2 text-sm bg-white focus:outline-none"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Corn">Corn</option>
                  <option value="Coconut">Coconut</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Target Price (₹ per Quintal)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2300"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-agri-amber-dark hover:bg-amber-600 text-white font-bold text-xs uppercase rounded-lg shadow transition"
              >
                Set SMS Trigger
              </button>
            </form>

            {user.priceAlerts?.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 mb-2">Active SMS Triggers:</h4>
                <div className="space-y-1.5">
                  {user.priceAlerts.map((a, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg">
                      <span className="font-semibold text-agri-soil-dark">{a.cropName}</span>
                      <span className="text-agri-green-dark font-extrabold">₹{a.targetPrice}/Quintal</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Saved Mandis / Markets Panel */}
          <div className="bg-white rounded-2xl border border-agri-green-light p-5 shadow-sm space-y-3">
            <h3 className="font-extrabold text-lg text-agri-soil-dark flex items-center">
              <MapPin className="h-5 w-5 text-agri-green mr-2" />
              {t('savedMarkets')}
            </h3>

            {loading ? (
              <p className="text-xs text-gray-500">Loading mandis...</p>
            ) : markets.length === 0 ? (
              <p className="text-xs text-gray-500">No mandis configured.</p>
            ) : (
              <div className="space-y-2">
                {markets.map(m => {
                  const isSaved = user.savedMarkets?.includes(m._id);
                  return (
                    <div key={m._id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl">
                      <div>
                        <h4 className="font-bold text-xs text-agri-soil-dark">{m.name}</h4>
                        <p className="text-[10px] text-gray-500">{m.district}, {m.state}</p>
                      </div>
                      <button
                        onClick={() => handleToggleMandiSave(m._id)}
                        className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold border transition ${
                          isSaved
                            ? 'bg-agri-green-light text-agri-green-dark border-transparent'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {isSaved ? '★ Followed' : '☆ Follow'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
