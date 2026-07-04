import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { HelpCircle, ChevronRight, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

const FertilizerTool = () => {
  const { t } = useLanguage();
  const { token, apiUrl } = useAuth();

  const [crop, setCrop] = useState('Wheat');
  const [soil, setSoil] = useState('Alluvial Soil');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationBanner, setLocationBanner] = useState('');

  const cropOptions = ["Wheat", "Rice", "Corn", "Coconut", "Potato", "Onion"];
  const soilOptions = ["Alluvial Soil", "Black Soil", "Red Soil", "Laterite Soil", "Sandy/Desert Soil"];

  const handleQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch(`${apiUrl}/fertilizers/recommendation?cropType=${crop}&soilType=${soil}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setResults(data);
      } else {
        setError(data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setLoading(false);
      setError('Network error query recommendation.');
    }
  };

  const handleGPSDetect = () => {
    setLocating(true);
    setLocationBanner('');
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        let detectedSoil = 'Alluvial Soil';
        let region = 'Indo-Gangetic Basin';

        // Coordinate heuristics mapping to Indian soil zones
        if (latitude < 16) {
          detectedSoil = 'Laterite Soil';
          region = 'Coastal/Western Ghats Region';
        } else if (latitude >= 16 && latitude < 23 && longitude < 79) {
          detectedSoil = 'Black Soil';
          region = 'Deccan Plateau Region';
        } else if (latitude > 24 && longitude < 75) {
          detectedSoil = 'Sandy/Desert Soil';
          region = 'Thar Desert Region';
        } else if (longitude > 80 && latitude < 24) {
          detectedSoil = 'Red Soil';
          region = 'Eastern Peninsular India';
        }

        setSoil(detectedSoil);
        setLocationBanner(`📍 GPS Coordinates: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E (${region}). Auto-selected: ${detectedSoil}`);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        // Fallback simulation coordinates (Delhi)
        setSoil('Alluvial Soil');
        setLocationBanner(`📍 GPS Simulation (Delhi, Indo-Gangetic Plains): 28.61°N, 77.20°E. Auto-selected: Alluvial Soil`);
        setLocating(false);
      },
      { timeout: 5000 }
    );
  };

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <div className="px-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-soil-dark flex items-center justify-center sm:justify-start">
          <Sparkles className="h-6 w-6 text-agri-amber-dark mr-2" />
          {t('fertilizerTool')}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Select your crop and soil profile to consult expert government-subsidized fertilizer recipes.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-agri-green-light shadow-sm">
        <form onSubmit={handleQuery} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crop Select */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {t('selectCrop')}
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-lg px-3 bg-white text-base focus:outline-none"
              >
                {cropOptions.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Soil Select */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t('selectSoil')}
                </label>
                <button
                  type="button"
                  onClick={handleGPSDetect}
                  disabled={locating}
                  className="text-xs text-agri-green-dark hover:text-agri-green font-bold flex items-center transition"
                >
                  {locating ? 'Locating...' : '⚡ GPS Auto-Detect'}
                </button>
              </div>
              <select
                value={soil}
                onChange={(e) => {
                  setSoil(e.target.value);
                  setLocationBanner('');
                }}
                className="w-full h-12 border border-gray-300 rounded-lg px-3 bg-white text-base focus:outline-none"
              >
                {soilOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {locationBanner && (
            <div className="rounded-xl bg-agri-green-light/40 border border-agri-green-medium p-3 text-xs text-agri-soil-dark font-medium flex items-center">
              <span className="mr-2">🗺️</span>
              {locationBanner}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center h-12 rounded-lg bg-agri-green text-base font-bold text-white shadow hover:bg-agri-green-dark transition"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
            {t('getRecommendation')}
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
          {error}
        </div>
      )}

      {/* Results Display */}
      {results && (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-agri-soil-dark px-1">
            Recommended recipes for <span className="text-agri-green-dark">{results.cropType}</span> on <span className="text-agri-green-dark">{results.soilType}</span> Soil:
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {results.recommendations.map((r, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-agri-green-light p-5 shadow-sm space-y-3 relative overflow-hidden">
                {/* Subsidy Badge */}
                {r.subsidyPercent > 0 && (
                  <span className="absolute top-4 right-4 text-xs font-bold text-agri-amber-dark bg-agri-amber-light px-2.5 py-1 rounded-full border border-agri-amber-medium">
                    🔥 {r.subsidyPercent}% Gov Subsidy
                  </span>
                )}

                <div className="flex items-start space-x-3 pr-28">
                  <CheckCircle2 className="h-6 w-6 text-agri-green mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-agri-soil-dark">{r.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Dosage: <span className="font-semibold text-agri-soil-dark bg-gray-100 px-2 py-0.5 rounded-md">{r.dosage}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5">
                      Application Timing: <span className="font-semibold text-agri-green-dark bg-agri-green-light px-2 py-0.5 rounded-md">{r.applicationTiming}</span>
                    </p>
                  </div>
                </div>

                {r.details && (
                  <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2">
                    {r.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FertilizerTool;
