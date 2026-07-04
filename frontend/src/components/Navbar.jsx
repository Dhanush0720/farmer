import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, Globe, User as UserIcon, LogOut, MessageSquare, Sprout, TrendingUp, HelpCircle } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    return '/';
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-md border-b border-agri-green-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={getDashboardLink()} className="flex items-center space-x-2 py-2">
              <Sprout className="h-8 w-8 text-agri-green-medium animate-pulse" />
              <span className="text-xl font-bold tracking-tight text-agri-green-dark">
                {t('title')}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/prices" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-agri-soil-dark hover:bg-agri-green-light hover:text-agri-green-dark transition">
              <TrendingUp className="h-4 w-4" />
              <span>{t('navBrowsePrices')}</span>
            </Link>
            <Link to="/listings" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-agri-soil-dark hover:bg-agri-green-light hover:text-agri-green-dark transition">
              <Sprout className="h-4 w-4" />
              <span>{t('navBrowseListings')}</span>
            </Link>
            <Link to="/fertilizer" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-agri-soil-dark hover:bg-agri-green-light hover:text-agri-green-dark transition">
              <HelpCircle className="h-4 w-4" />
              <span>{t('navFertilizer')}</span>
            </Link>
            {isAuthenticated && (
              <Link to="/messages" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-agri-soil-dark hover:bg-agri-green-light hover:text-agri-green-dark transition relative">
                <MessageSquare className="h-4 w-4" />
                <span>{t('navMessages')}</span>
              </Link>
            )}
          </div>

          {/* Action Buttons & Language Select */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language Dropdown Selector */}
            <div className="relative inline-block text-left">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="flex items-center justify-center pl-9 pr-8 h-12 rounded-lg text-sm font-bold border-2 border-agri-green-medium text-agri-green-dark bg-white hover:bg-agri-green-light transition shadow-sm active:scale-95 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231b5e20' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center',
                  backgroundSize: '14px'
                }}
                aria-label="Select Language"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Globe className="h-4 w-4 text-agri-green-medium" />
              </div>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-semibold text-agri-green-dark uppercase tracking-wider bg-agri-green-light px-2 py-0.5 rounded-full inline-block self-end">
                    {t(`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`)}
                  </span>
                  <span className="text-sm font-medium text-agri-soil-dark">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-3 h-12 w-12 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition active:scale-95 shadow-sm"
                  title={t('navLogout')}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 h-12 rounded-lg text-sm font-medium text-agri-soil-dark hover:bg-agri-green-light transition"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-5 h-12 rounded-lg text-sm font-bold bg-agri-green text-white hover:bg-agri-green-dark transition shadow-md active:scale-95"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button - min 48x48 touch target */}
          <div className="flex items-center md:hidden space-x-2">
            <div className="relative">
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="flex items-center justify-center pl-8 pr-6 h-12 border border-agri-green-medium text-agri-green-dark bg-white rounded-lg text-xs font-bold shadow-sm active:scale-95 appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232e7d32' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 6px center',
                  backgroundSize: '12px'
                }}
                aria-label="Select Language"
              >
                <option value="en">EN</option>
                <option value="hi">हिन्दी</option>
                <option value="te">తెలుగు</option>
                <option value="mr">मराठी</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center">
                <Globe className="h-3.5 w-3.5 text-agri-green-medium" />
              </div>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center h-12 w-12 rounded-lg text-agri-soil-dark hover:bg-agri-green-light transition focus:outline-none"
              aria-expanded="false"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-agri-green-light py-2 px-4 space-y-2 animate-fade-in shadow-inner">
          <Link
            to="/prices"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 p-3 h-12 rounded-lg text-base font-semibold text-agri-soil-dark hover:bg-agri-green-light transition"
          >
            <TrendingUp className="h-5 w-5 text-agri-green-medium" />
            <span>{t('navBrowsePrices')}</span>
          </Link>
          <Link
            to="/listings"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 p-3 h-12 rounded-lg text-base font-semibold text-agri-soil-dark hover:bg-agri-green-light transition"
          >
            <Sprout className="h-5 w-5 text-agri-green-medium" />
            <span>{t('navBrowseListings')}</span>
          </Link>
          <Link
            to="/fertilizer"
            onClick={() => setIsOpen(false)}
            className="flex items-center space-x-3 p-3 h-12 rounded-lg text-base font-semibold text-agri-soil-dark hover:bg-agri-green-light transition"
          >
            <HelpCircle className="h-5 w-5 text-agri-green-medium" />
            <span>{t('navFertilizer')}</span>
          </Link>
          {isAuthenticated && (
            <Link
              to="/messages"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 p-3 h-12 rounded-lg text-base font-semibold text-agri-soil-dark hover:bg-agri-green-light transition"
            >
              <MessageSquare className="h-5 w-5 text-agri-green-medium" />
              <span>{t('navMessages')}</span>
            </Link>
          )}

          <div className="pt-4 border-t border-agri-green-light">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1 flex items-center justify-between bg-agri-green-light rounded-lg">
                  <span className="text-xs font-semibold text-agri-green-dark uppercase">
                    {t(`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`)}
                  </span>
                  <span className="text-sm font-semibold text-agri-soil-dark">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center p-3 h-12 rounded-lg text-base font-bold bg-red-50 text-red-600 hover:bg-red-100 transition shadow-sm active:scale-95"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center h-12 rounded-lg text-base font-semibold border-2 border-agri-green text-agri-green-dark bg-white hover:bg-agri-green-light transition"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center h-12 rounded-lg text-base font-bold bg-agri-green text-white hover:bg-agri-green-dark transition shadow-md active:scale-95"
                >
                  {t('navRegister')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
