import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, Search, MapPin, MessageSquare, AlertCircle } from 'lucide-react';
import VoiceInput from '../components/VoiceInput';

const CropListings = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated, apiUrl } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cropFilter, setCropFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let query = `?`;
      if (cropFilter) query += `cropType=${cropFilter}&`;
      if (districtFilter) query += `district=${districtFilter}&`;
      
      const res = await fetch(`${apiUrl}/listings${query}`);
      const data = await res.json();
      if (data.success) {
        setListings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [cropFilter, districtFilter, apiUrl]);

  const handleMessage = (listingId) => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate(`/messages?listingId=${listingId}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="px-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-soil-dark flex items-center justify-center sm:justify-start">
          <Sprout className="h-6 w-6 text-agri-green mr-2" />
          {t('cropListings')}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Browse fresh crop lots listed directly by verified Indian producers.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-agri-green-light shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Crop Type</label>
          <div className="relative">
            <Search className="absolute inset-y-0 left-0 pl-3 h-5 w-5 my-auto text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Wheat, Rice..."
              value={cropFilter}
              onChange={(e) => setCropFilter(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg pl-9 pr-10 text-sm focus:outline-none"
            />
            <VoiceInput
              onTranscript={(text) => setCropFilter(text)}
              activeLanguage={language}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District / Region</label>
          <div className="relative">
            <MapPin className="absolute inset-y-0 left-0 pl-3 h-5 w-5 my-auto text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Patna, North Delhi..."
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full h-11 border border-gray-300 rounded-lg pl-9 pr-10 text-sm focus:outline-none"
            />
            <VoiceInput
              onTranscript={(text) => setDistrictFilter(text)}
              activeLanguage={language}
            />
          </div>
        </div>
      </div>

      {/* List results */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">Loading crop lots...</div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-agri-green-light p-12 text-center text-gray-500">
          {t('noListingsFound')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(l => (
            <div key={l._id} className="bg-white rounded-2xl border border-agri-green-light p-5 shadow-sm hover:shadow-md transition transition-card flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-agri-green-dark bg-agri-green-light px-2.5 py-0.5 rounded-full">
                    {l.qualityGrade}
                  </span>
                  <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded font-bold uppercase">
                    {t('verified')}
                  </span>
                </div>

                <h3 className="font-extrabold text-lg text-agri-soil-dark">{l.cropType}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  📍 Village: {l.location.village}, {l.location.district}, {l.location.state}
                </p>

                <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg">
                  <div>
                    <span className="block text-gray-400">Available Vol</span>
                    <span className="font-bold text-sm text-agri-soil-dark">{l.volume} {l.unit}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400">Expected Price</span>
                    <span className="font-bold text-sm text-agri-soil-dark">₹{l.expectedPrice}/{l.unit}</span>
                  </div>
                </div>

                {l.description && (
                  <p className="text-xs italic text-gray-500 mt-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    "{l.description}"
                  </p>
                )}

                <div className="mt-4 flex items-center space-x-2 text-[10px] text-gray-400 font-semibold uppercase">
                  <span>Producer: {l.farmer?.name}</span>
                </div>
              </div>

              <button
                onClick={() => handleMessage(l._id)}
                className="mt-5 flex items-center justify-center w-full h-11 bg-agri-green text-sm font-bold text-white rounded-lg hover:bg-agri-green-dark transition shadow-sm active:scale-95"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {isAuthenticated ? t('contactFarmer') : 'Login to Message'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CropListings;
