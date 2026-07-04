import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { KeyRound, Phone, AlertCircle, RefreshCw, Key } from 'lucide-react';

const Login = () => {
  const { login, apiUrl } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password flow states
  const [isForgot, setIsForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = input phone, 2 = input OTP & new password
  const [forgotPhone, setForgotPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(phone, password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    } else {
      setError(result.message || 'Invalid Credentials');
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotPhone) {
      setForgotError('Please enter phone number');
      return;
    }
    setForgotError('');
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setForgotMsg(data.message);
        setForgotStep(2);
      } else {
        setForgotError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setForgotError('Network error, please try again.');
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setForgotError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long');
      return;
    }

    setForgotError('');
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: forgotPhone, otp, newPassword })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setIsForgot(false);
        setForgotStep(1);
        setPhone(forgotPhone);
        setPassword(newPassword);
        setError('Password reset success. Please log in.');
      } else {
        setForgotError(data.message);
      }
    } catch (err) {
      setLoading(false);
      setForgotError('Network error resetting password.');
    }
  };

  if (isForgot) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-agri-green-light">
          <div className="text-center">
            <KeyRound className="mx-auto h-12 w-12 text-agri-green" />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-agri-soil-dark">
              {t('resetPasswordTitle')}
            </h2>
          </div>

          {forgotError && (
            <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{forgotError}</span>
            </div>
          )}

          {forgotMsg && forgotStep === 2 && (
            <div className="rounded-lg bg-amber-50 p-4 text-xs text-amber-800 border border-amber-200">
              {forgotMsg}
            </div>
          )}

          {forgotStep === 1 ? (
            <form className="mt-8 space-y-6" onSubmit={handleForgotRequest}>
              <div>
                <label className="block text-sm font-semibold text-agri-soil-dark mb-2">
                  {t('phoneLabel')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                    <Phone className="h-5 w-5" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">{t('enterPhoneForOtp')}</p>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center h-12 rounded-lg bg-agri-green text-base font-bold text-white shadow-md hover:bg-agri-green-dark transition tap-effect"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : null}
                  {t('sendOtpBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsForgot(false)}
                  className="flex w-full items-center justify-center h-12 rounded-lg text-sm font-semibold text-agri-soil-dark bg-gray-50 hover:bg-gray-100 transition"
                >
                  {t('backToHome')}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleForgotReset}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-agri-soil-dark mb-2">
                    Enter OTP (6-digits)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                      <Key className="h-5 w-5" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Enter 123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{t('enterOtpAndNewPassword')}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-agri-soil-dark mb-2">
                    {t('newPasswordLabel')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                      <KeyRound className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Must be at least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center h-12 rounded-lg bg-agri-green text-base font-bold text-white shadow-md hover:bg-agri-green-dark transition tap-effect"
                >
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : null}
                  {t('resetPasswordBtn')}
                </button>
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="flex w-full items-center justify-center h-12 rounded-lg text-sm font-semibold text-agri-soil-dark bg-gray-50 hover:bg-gray-100 transition"
                >
                  Back
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl border border-agri-green-light">
        <div className="text-center">
          <KeyRound className="mx-auto h-12 w-12 text-agri-green animate-pulse" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-agri-soil-dark">
            {t('navLogin')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-bold text-agri-green-medium hover:text-agri-green-dark underline">
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-agri-soil-dark mb-2">
                {t('phoneLabel')}
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

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-agri-soil-dark">
                  {t('passwordLabel')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-xs font-bold text-agri-green-medium hover:text-agri-green-dark underline"
                >
                  {t('forgotPasswordLink')}
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-agri-green-medium">
                  <KeyRound className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full h-12 rounded-lg border border-gray-300 pl-10 pr-3 text-base shadow-sm focus:border-agri-green focus:outline-none focus:ring-1 focus:ring-agri-green"
                />
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
              {t('navLogin')}
            </button>
          </div>
        </form>

        {/* Demo Helper Panel */}
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mt-6">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Quick Demo Accounts:</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <p>👨‍🌾 <span className="font-semibold">Farmer:</span> 9876543210 (pw: password123)</p>
            <p>🏫 <span className="font-semibold">Mandi Admin:</span> 8765432109 (pw: password123)</p>
            <p>💼 <span className="font-semibold">Trader:</span> 7654321098 (pw: password123)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
