import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, Scale, Search, ShieldCheck } from 'lucide-react';
import PriceTrendChart from '../components/PriceTrendChart';

const MarketPrices = () => {
  const { t } = useLanguage();
  const { apiUrl } = useAuth();
  
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [comparisons, setComparisons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cropOptions = ["Wheat", "Rice", "Corn", "Coconut", "Potato", "Onion", "Tomato", "Chilli"];

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${apiUrl}/markets/compare/prices?cropName=${selectedCrop}`);
        const data = await res.json();
        if (data.success) {
          setComparisons(data.data);
        } else {
          setError(data.message || 'Failed to compare regional prices');
        }
      } catch (err) {
        console.error(err);
        setError('Network error fetching price comparison data.');
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [selectedCrop, apiUrl]);

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="px-1 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-agri-soil-dark flex items-center justify-center sm:justify-start">
          <TrendingUp className="h-6 w-6 text-agri-green mr-2" />
          {t('mandiPriceBoard')}
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Select a crop to compare daily verified pricing boards across Indian mandis.
        </p>
      </div>

      {/* Select crop selector - giant touch targets */}
      <div className="bg-white p-5 rounded-2xl border border-agri-green-light shadow-sm">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('selectCrop')}
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {cropOptions.map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`h-12 text-sm font-extrabold rounded-xl border-2 transition tap-effect flex items-center justify-center ${
                selectedCrop === crop
                  ? 'border-agri-green bg-agri-green-light text-agri-green-dark'
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {comparisons.length > 0 && (
        <PriceTrendChart
          cropName={selectedCrop}
          baseMin={Math.min(...comparisons.map(c => c.priceMin))}
          baseMax={Math.max(...comparisons.map(c => c.priceMax))}
        />
      )}

      {/* Table segment */}
      <div className="bg-white rounded-2xl border border-agri-green-light shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading regional comparison board...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 font-semibold">{error}</div>
        ) : comparisons.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No prices verified for <span className="font-bold text-agri-soil-dark">{selectedCrop}</span> today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-agri-green-light border-b border-agri-green-light text-agri-green-dark text-xs font-bold uppercase tracking-wider">
                  <th className="p-4 sm:p-5">Mandi Name</th>
                  <th className="p-4 sm:p-5">Region</th>
                  <th className="p-4 sm:p-5 text-center">Daily Prices (₹)</th>
                  <th className="p-4 sm:p-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {comparisons.map((c, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="p-4 sm:p-5 font-bold text-agri-soil-dark">{c.marketName}</td>
                    <td className="p-4 sm:p-5">
                      <span className="text-xs font-semibold text-gray-500">{c.district}, {c.state}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-center font-extrabold text-agri-green-dark text-base">
                      ₹{c.priceMin} - {c.priceMax}
                      <span className="text-[10px] text-gray-400 font-normal block">per {c.unit}</span>
                    </td>
                    <td className="p-4 sm:p-5 text-right">
                      <span className="inline-flex items-center text-xs bg-green-50 border border-green-200 text-green-700 font-bold px-2 py-0.5 rounded-full">
                        <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Compare utility banner */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start space-x-3 text-amber-800">
        <Scale className="h-5 w-5 mt-0.5 text-agri-amber-dark flex-shrink-0" />
        <div className="text-xs sm:text-sm">
          <h4 className="font-bold">Indian Government Mandi Alert</h4>
          <p className="mt-1">
            Prices displayed on KrishiMarket are updated daily by certified Mandi Admins. Ensure to verify expected grades before negotiating bulk trades.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketPrices;
