import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { MapPin, ShieldCheck, HelpCircle, Loader2 } from 'lucide-react';

const Onboard = () => {
  const { user, onboard, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already onboarded or not logged in
  useEffect(() => {
    if (user && user.isOnboarded) {
      navigate('/');
    }
  }, [user, navigate]);

  // Farmer form states
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [acreage, setAcreage] = useState('');
  const [cropsInput, setCropsInput] = useState('');
  const [selectedCrops, setSelectedCrops] = useState([]);

  // Mandi Owner form states
  const [licenseNumber, setLicenseNumber] = useState('');
  const [mandiName, setMandiName] = useState('');
  const [mandiAddress, setMandiAddress] = useState('');
  const [mandiDistrict, setMandiDistrict] = useState('');
  const [mandiState, setMandiState] = useState('');

  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Common Indian Crop suggestions for farmer profile
  const commonCrops = ["Wheat", "Rice", "Corn", "Coconut", "Potato", "Onion", "Tomato", "Chilli", "Mustard", "Cotton", "Sugarcane"];

  const handleAddCrop = (crop) => {
    if (!selectedCrops.includes(crop)) {
      setSelectedCrops([...selectedCrops, crop]);
    }
  };

  const handleRemoveCrop = (crop) => {
    setSelectedCrops(selectedCrops.filter(c => c !== crop));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    let profileData = {};

    if (user.role === 'farmer') {
      if (!village || !district || !state) {
        setError('Please fill in village, district, and state details');
        setSubmitLoading(false);
        return;
      }
      profileData = {
        village,
        district,
        state,
        acreage: Number(acreage) || 0,
        primaryCrops: selectedCrops
      };
    } else if (user.role === 'market_owner') {
      if (!licenseNumber || !mandiName || !mandiDistrict || !mandiState) {
        setError('Please provide Mandi License Number, Registered Name, and Location details');
        setSubmitLoading(false);
        return;
      }
      profileData = {
        licenseNumber,
        mandiName,
        location: {
          address: mandiAddress || `${mandiDistrict}, ${mandiState}`,
          district: mandiDistrict,
          state: mandiState,
          latitude: 26.0 + Math.random() * 2, // simulated coordinates
          longitude: 80.0 + Math.random() * 2
        }
      };
    }

    const result = await onboard(profileData);
    setSubmitLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Onboarding update failed');
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-agri-green" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-2xl bg-white p-8 shadow-xl border border-agri-green-light">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-agri-soil-dark">
            {t('onboardingTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {user.role === 'farmer' ? t('farmerOnboardingSub') : t('mandiOnboardingSub')}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {user.role === 'farmer' ? (
            /* Farmer specific onboarding form */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                    {t('villageLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Rampur"
                    className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                    {t('districtLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Patna"
                    className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('stateLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Bihar"
                  className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('acreageLabel')}
                </label>
                <input
                  type="number"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  placeholder="e.g. 5"
                  min="0"
                  step="0.5"
                  className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                />
              </div>

              {/* Crop tags input */}
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-2">
                  {t('primaryCropsLabel')} (Select multiple)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {selectedCrops.map(crop => (
                    <span key={crop} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-agri-green-light text-agri-green-dark">
                      {crop}
                      <button
                        type="button"
                        onClick={() => handleRemoveCrop(crop)}
                        className="ml-1.5 text-xs text-red-600 font-extrabold hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {commonCrops.map(crop => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => handleAddCrop(crop)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                        selectedCrops.includes(crop)
                          ? 'bg-agri-green text-white border-transparent'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Market Owner / Mandi Admin onboarding form */
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('registeredMandiName')} *
                </label>
                <input
                  type="text"
                  required
                  value={mandiName}
                  onChange={(e) => setMandiName(e.target.value)}
                  placeholder="e.g. Azadpur Mandi"
                  className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('mandiLicenseLabel')} *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. LIC-2026-99"
                    className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    required
                    value={mandiDistrict}
                    onChange={(e) => setMandiDistrict(e.target.value)}
                    placeholder="e.g. North Delhi"
                    className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={mandiState}
                    onChange={(e) => setMandiState(e.target.value)}
                    placeholder="e.g. Delhi"
                    className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                  {t('mandiAddress')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={mandiAddress}
                    onChange={(e) => setMandiAddress(e.target.value)}
                    placeholder="e.g. Azadpur, New Delhi, Delhi"
                    className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitLoading}
            className="flex w-full items-center justify-center h-12 rounded-lg bg-agri-green text-base font-bold text-white shadow-md hover:bg-agri-green-dark transition tap-effect"
          >
            {submitLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboard;
