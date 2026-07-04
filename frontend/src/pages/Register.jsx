import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Phone, KeyRound, Globe, AlertCircle, RefreshCw } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    const result = await register({
      name,
      phone,
      email,
      password,
      preferredLanguage,
      role
    });

    setLoading(false);

    if (result.success) {
      // If user requires onboarding (Farmer or Mandi Owner), send to /onboard
      if (role === 'farmer' || role === 'market_owner') {
        navigate('/onboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-agri-green-light">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-agri-green animate-bounce" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-agri-soil-dark">
            {t('navRegister')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-agri-green-medium hover:text-agri-green-dark underline">
              Sign in here
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                {t('nameLabel')} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                {t('phoneLabel')} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                  <Phone className="h-5 w-5" />
                </span>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                />
              </div>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="e.g. ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full h-12 rounded-lg border border-gray-300 px-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                {t('passwordLabel')} *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                />
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-1">
                Preferred Language
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                  <Globe className="h-5 w-5" />
                </span>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 bg-white text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>
            </div>

            {/* Role Selection - Large touch-friendly cards */}
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-2">
                {t('roleLabel')} *
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {/* Farmer Option */}
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition tap-effect ${
                    role === 'farmer'
                      ? 'border-agri-green bg-agri-green-light text-agri-green-dark font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">👨‍🌾</span>
                  <span className="text-xs mt-1">{t('roleFarmer')}</span>
                </button>

                {/* Mandi Owner Option */}
                <button
                  type="button"
                  onClick={() => setRole('market_owner')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition tap-effect ${
                    role === 'market_owner'
                      ? 'border-agri-green bg-agri-green-light text-agri-green-dark font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">🏫</span>
                  <span className="text-xs mt-1">{t('roleMandiOwner')}</span>
                </button>

                {/* Buyer / General Option */}
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition tap-effect ${
                    role === 'user'
                      ? 'border-agri-green bg-agri-green-light text-agri-green-dark font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">💼</span>
                  <span className="text-xs mt-1">Trader/Buyer</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center h-12 rounded-lg bg-agri-green text-base font-bold text-white shadow-md hover:bg-agri-green-dark transition tap-effect"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : null}
              {role === 'user' || role === 'guest' ? t('navRegister') : 'Next: Dynamic Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
