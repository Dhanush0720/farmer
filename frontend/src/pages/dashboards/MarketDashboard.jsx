import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TrendingUp, UserCheck, ShieldAlert, Award, ChevronRight, Check, X, Loader2, Plus } from 'lucide-react';

const MarketDashboard = () => {
  const { user, token, apiUrl } = useAuth();
  const { t } = useLanguage();

  const [mandi, setMandi] = useState(null);
  const [pendingListings, setPendingListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [cropName, setCropName] = useState('Wheat');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [priceUnit, setPriceUnit] = useState('Quintal');

  const [mandiMsg, setMandiMsg] = useState('');
  const [mandiError, setMandiError] = useState('');
  const [mandiLoading, setMandiLoading] = useState(false);

  const fetchMandiData = async () => {
    try {
      const [mandiRes, pendingRes] = await Promise.all([
        fetch(`${apiUrl}/markets/my-mandi/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/listings/pending`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const mandiData = await mandiRes.json();
      const pendingData = await pendingRes.json();

      if (mandiData.success) setMandi(mandiData.data);
      if (pendingData.success) setPendingListings(pendingData.data);
    } catch (err) {
      console.error("Error loading mandi admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
  }, [apiUrl, token]);

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!priceMin || !priceMax) return;
    if (Number(priceMin) > Number(priceMax)) {
      setMandiError('Min price cannot exceed Max price');
      return;
    }

    setMandiError('');
    setMandiLoading(true);

    try {
      const res = await fetch(`${apiUrl}/markets/${mandi._id}/prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          cropName,
          priceMin: Number(priceMin),
          priceMax: Number(priceMax),
          unit: priceUnit
        })
      });

      const data = await res.json();
      setMandiLoading(false);

      if (data.success) {
        setMandiMsg('Price board updated successfully!');
        setPriceMin('');
        setPriceMax('');
        // Refresh mandi data
        fetchMandiData();
        setTimeout(() => setMandiMsg(''), 3000);
      } else {
        setMandiError(data.message || 'Failed to update price board');
      }
    } catch (err) {
      setMandiLoading(false);
      setMandiError('Network error updating price board.');
    }
  };

  const handleVerifyFarmerListing = async (listingId, action) => {
    try {
      const res = await fetch(`${apiUrl}/listings/${listingId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: action }) // 'verified' or 'rejected'
      });
      const data = await res.json();
      if (data.success) {
        fetchMandiData();
      }
    } catch (err) {
      console.error("Error verifying listing:", err);
    }
  };

  const handleVerifyMandiSelf = async () => {
    if (!mandi) return;
    try {
      const res = await fetch(`${apiUrl}/markets/${mandi._id}/verify-mandi`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMandiData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Mandi info banner */}
      <div className="bg-white rounded-3xl border border-agri-green-light p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-3xl">🏫</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-agri-soil-dark">
                {mandi ? mandi.name : t('mandiAdminDash')}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                License: {mandi?.licenseNumber} | {mandi?.location?.address}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          {mandi?.isVerified ? (
            <span className="flex items-center px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-extrabold text-sm rounded-xl">
              <Award className="h-4 w-4 mr-1.5" />
              Verified Mandi Admin
            </span>
          ) : (
            <button
              onClick={handleVerifyMandiSelf}
              className="flex items-center px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 font-bold text-xs rounded-xl shadow-sm hover:bg-amber-100 transition"
            >
              Verify License Board
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Verification Board */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-extrabold text-agri-soil-dark flex items-center px-1">
            <UserCheck className="h-5 w-5 text-agri-green mr-2" />
            {t('pendingVerifications')} ({pendingListings.length})
          </h2>

          {pendingListings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-agri-green-light p-8 text-center text-gray-500">
              No new farmer postings waiting for validation today. All clean!
            </div>
          ) : (
            <div className="space-y-3">
              {pendingListings.map(l => (
                <div key={l._id} className="bg-white rounded-2xl border border-agri-green-light p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">{l.cropType}</span>
                      <span className="text-xs text-gray-400 font-semibold">{l.qualityGrade}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Farmer: <span className="font-bold text-agri-soil-dark">{l.farmer.name} ({l.farmer.phone})</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Volume: <span className="font-bold text-agri-soil-dark">{l.volume} {l.unit}</span> | expected: <span className="font-bold text-agri-soil-dark">₹{l.expectedPrice}/{l.unit}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">📍 Village: {l.location.village}, {l.location.district}</p>
                  </div>

                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleVerifyFarmerListing(l._id, 'verified')}
                      className="flex-1 sm:flex-none flex items-center justify-center px-3 h-10 bg-agri-green text-xs font-bold text-white rounded-lg hover:bg-agri-green-dark transition"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyFarmerListing(l._id, 'rejected')}
                      className="flex-1 sm:flex-none flex items-center justify-center px-3 h-10 border border-red-300 text-xs font-bold text-red-600 rounded-lg hover:bg-red-50 transition"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Price Board form */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-agri-green-light p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-agri-soil-dark flex items-center">
              <TrendingUp className="h-5 w-5 text-agri-green mr-2" />
              {t('updatePriceBoard')}
            </h3>

            {mandiError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {mandiError}
              </div>
            )}

            {mandiMsg && (
              <div className="rounded-lg bg-green-50 p-3 text-xs text-green-700 border border-green-200">
                {mandiMsg}
              </div>
            )}

            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Crop Name</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full h-11 border border-gray-300 rounded-lg px-2 bg-white text-sm focus:outline-none"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Rice">Rice</option>
                  <option value="Corn">Corn</option>
                  <option value="Coconut">Coconut</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Chilli">Chilli</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2100"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 2400"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full h-11 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={mandiLoading}
                className="flex items-center justify-center w-full h-11 bg-agri-green text-sm font-bold text-white rounded-lg hover:bg-agri-green-dark shadow transition"
              >
                {mandiLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-1.5" />}
                Publish Today's Price
              </button>
            </form>

            {/* Displaying price list */}
            {mandi?.priceBoard?.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-extrabold text-agri-soil-dark mb-2">Verified Price Board:</h4>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {mandi.priceBoard.slice().reverse().map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <div>
                        <span className="font-bold text-agri-soil-dark">{p.cropName}</span>
                        <p className="text-[9px] text-gray-400">{new Date(p.date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-agri-green-dark font-extrabold">₹{p.priceMin} - {p.priceMax}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketDashboard;
