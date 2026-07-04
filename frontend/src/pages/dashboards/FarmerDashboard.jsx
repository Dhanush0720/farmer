import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Sprout, TrendingUp, AlertCircle, ShoppingBag, PlusCircle, Check, Loader2, Sparkles, MessageSquare } from 'lucide-react';

const FarmerDashboard = () => {
  const { user, token, apiUrl } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listing creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [cropType, setCropType] = useState('Wheat');
  const [volume, setVolume] = useState('');
  const [unit, setUnit] = useState('Quintal');
  const [qualityGrade, setQualityGrade] = useState('Grade B');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [description, setDescription] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [offlineSyncMsg, setOfflineSyncMsg] = useState('');

  // Common Indian Crop list
  const cropOptions = ["Wheat", "Rice", "Corn", "Coconut", "Potato", "Onion", "Tomato", "Chilli", "Mustard", "Cotton", "Sugarcane"];

  const fetchMyListings = async () => {
    try {
      const res = await fetch(`${apiUrl}/listings/my-listings`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setMyListings(data.data);
      }
    } catch (err) {
      console.error("Error loading farmer listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();

    const handleOnline = async () => {
      const offlineListings = JSON.parse(localStorage.getItem('offline_listings') || '[]');
      if (offlineListings.length > 0) {
        setOfflineSyncMsg('Network connection restored! Synchronizing offline crop listings...');
        let successCount = 0;
        for (const item of offlineListings) {
          try {
            const res = await fetch(`${apiUrl}/listings`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(item)
            });
            const data = await res.json();
            if (data.success) {
              successCount++;
            }
          } catch (e) {
            console.error('Error syncing offline listing:', e);
          }
        }
        localStorage.removeItem('offline_listings');
        setOfflineSyncMsg(`Successfully uploaded ${successCount} queued listings to the database!`);
        fetchMyListings();
        setTimeout(() => setOfflineSyncMsg(''), 4000);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [apiUrl, token]);

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!volume || !expectedPrice) {
      setFormError('Please input volume and expected price');
      return;
    }

    setFormError('');
    setFormLoading(true);

    const payload = {
      cropType,
      volume: Number(volume),
      unit,
      qualityGrade,
      expectedPrice: Number(expectedPrice),
      description
    };

    // Store listing locally if offline
    if (!navigator.onLine) {
      const existing = JSON.parse(localStorage.getItem('offline_listings') || '[]');
      existing.push(payload);
      localStorage.setItem('offline_listings', JSON.stringify(existing));

      setFormLoading(false);
      setFormSuccess(true);
      setVolume('');
      setExpectedPrice('');
      setDescription('');
      setFormError('App is offline! Your listing was saved locally and will automatically upload when network returns.');

      setTimeout(() => {
        setFormSuccess(false);
        setShowAddForm(false);
        setFormError('');
      }, 5000);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setFormLoading(false);

      if (data.success) {
        setFormSuccess(true);
        setVolume('');
        setExpectedPrice('');
        setDescription('');
        
        // Refresh listings
        fetchMyListings();

        setTimeout(() => {
          setFormSuccess(false);
          setShowAddForm(false);
        }, 2000);
      } else {
        setFormError(data.message || 'Failed to create listing');
      }
    } catch (err) {
      setFormLoading(false);
      setFormError('Server connection error. Saved to offline queue.');
      const existing = JSON.parse(localStorage.getItem('offline_listings') || '[]');
      existing.push(payload);
      localStorage.setItem('offline_listings', JSON.stringify(existing));
    }
  };

  const handleMarkSold = async (id) => {
    try {
      const res = await fetch(`${apiUrl}/listings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'sold' })
      });
      const data = await res.json();
      if (data.success) {
        fetchMyListings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Conversational header banner */}
      <div className="bg-gradient-to-tr from-agri-green-dark to-agri-green-medium rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {t('dashboardHeader')}, {user.name}! 👨‍🌾
          </h1>
          <p className="text-sm sm:text-base text-agri-green-light font-medium">
            {t('farmerQuestion')}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 text-[180px] pointer-events-none select-none">🚜</div>
      </div>

      {offlineSyncMsg && (
        <div className="rounded-2xl bg-yellow-50 p-4 border border-yellow-200 text-sm text-yellow-800 flex items-center font-semibold shadow-sm animate-pulse">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
          {offlineSyncMsg}
        </div>
      )}

      {/* Giant touch action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sell Crop Card */}
        <button
          onClick={() => {
            setShowAddForm(true);
            // Scroll to form
            setTimeout(() => {
              document.getElementById('listing-form')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-agri-green-medium rounded-2xl shadow-sm hover:bg-agri-green-light/40 transition transition-card active:scale-95 text-center min-h-[140px] w-full"
        >
          <span className="text-4xl">🌾</span>
          <span className="mt-2 text-lg font-extrabold text-agri-green-dark">
            {t('btnSellCrop')}
          </span>
        </button>

        {/* Check Prices Card */}
        <Link
          to="/prices"
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-agri-green-medium rounded-2xl shadow-sm hover:bg-agri-green-light/40 transition transition-card active:scale-95 text-center min-h-[140px] w-full"
        >
          <span className="text-4xl">📈</span>
          <span className="mt-2 text-lg font-extrabold text-agri-green-dark">
            {t('btnCheckPrices')}
          </span>
        </Link>

        {/* Fertilizer Helper Card */}
        <Link
          to="/fertilizer"
          className="flex flex-col items-center justify-center p-6 bg-white border-2 border-agri-green-medium rounded-2xl shadow-sm hover:bg-agri-green-light/40 transition transition-card active:scale-95 text-center min-h-[140px] w-full"
        >
          <span className="text-4xl">🧪</span>
          <span className="mt-2 text-lg font-extrabold text-agri-green-dark">
            {t('btnFindFertilizers')}
          </span>
        </Link>
      </div>

      {/* Conditional Listing creation form section */}
      {showAddForm && (
        <div id="listing-form" className="bg-white rounded-2xl border-2 border-agri-green p-6 shadow-md scroll-mt-20">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-extrabold text-agri-soil-dark flex items-center">
              <PlusCircle className="h-5 w-5 text-agri-green mr-2" />
              {t('postListingTitle')}
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs font-bold text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>

          {formError && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-200">
              Crop posting submitted! It is pending verified mandi review.
            </div>
          )}

          <form onSubmit={handleCreateListing} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Crop selection */}
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('cropType')} *
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-lg px-3 bg-white focus:outline-none"
                >
                  {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('qualityGradeLabel')}
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full h-12 border border-gray-300 rounded-lg px-3 bg-white focus:outline-none"
                >
                  <option value="Grade A">Grade A (High Premium)</option>
                  <option value="Grade B">Grade B (Standard Market)</option>
                  <option value="Grade C">Grade C (Industrial Feed)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('quantityQuintal')} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    placeholder="e.g. 50"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    min="1"
                    className="w-full h-12 border border-gray-300 rounded-lg px-3 focus:outline-none"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-gray-500 font-bold">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Expected Price */}
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('expectedPricePerUnit')} *
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2300"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  min="1"
                  className="w-full h-12 border border-gray-300 rounded-lg px-3 focus:outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                {t('optionalDescription')}
              </label>
              <textarea
                placeholder="Details on moisture level, harvesting date, storing method..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="flex w-full items-center justify-center h-12 rounded-lg bg-agri-green text-base font-bold text-white shadow-md hover:bg-agri-green-dark transition"
            >
              {formLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
              {t('createPostBtn')}
            </button>
          </form>
        </div>
      )}

      {/* Farmer listings list */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-agri-soil-dark flex items-center px-1">
          <ShoppingBag className="h-5 w-5 text-agri-green mr-2" />
          My Crop Offerings
        </h2>

        {loading ? (
          <div className="text-center text-gray-500 py-8">Loading postings...</div>
        ) : myListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-agri-green-light p-8 text-center text-gray-500">
            No crop listings posted yet. Tap <span className="font-bold text-agri-green">Sell Crop</span> to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myListings.map(l => (
              <div key={l._id} className="bg-white rounded-2xl border border-agri-green-light p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-agri-green-dark bg-agri-green-light px-2.5 py-0.5 rounded-full">
                      {l.qualityGrade}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      l.status === 'verified' ? 'bg-green-100 text-green-800' :
                      l.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                      l.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {l.status === 'pending' ? t('pending') : l.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-agri-soil-dark">{l.cropType}</h3>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <p>Volume: <span className="font-semibold text-agri-soil-dark">{l.volume} {l.unit}</span></p>
                    <p>Expected: <span className="font-semibold text-agri-soil-dark">₹{l.expectedPrice}/{l.unit}</span></p>
                    <p className="col-span-2">Location: <span className="font-semibold text-agri-soil-dark">{l.location.village}, {l.location.district}</span></p>
                  </div>
                </div>

                {/* Listing inquiries indicator */}
                {l.inquiries && l.inquiries.length > 0 && (
                  <div className="mt-3 p-2 bg-amber-50 rounded-lg flex items-center justify-between text-xs text-amber-800 border border-amber-100">
                    <span className="flex items-center font-semibold">
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      {l.inquiries.length} Buyer inquiries
                    </span>
                    <Link to="/messages" className="font-bold underline hover:text-amber-900">
                      Reply now
                    </Link>
                  </div>
                )}

                {l.status !== 'sold' && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleMarkSold(l._id)}
                      className="flex w-full items-center justify-center h-10 border border-agri-green text-xs font-bold text-agri-green hover:bg-agri-green-light rounded-lg transition active:scale-95"
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Mark as Sold
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
