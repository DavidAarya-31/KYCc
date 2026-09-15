import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Home, LogOut, User, TrendingUp, Moon, Sun, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BottomNav } from './BottomNav';
import { supabase } from '../lib/supabase';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [discoverDropdownOpen, setDiscoverDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const displayName = user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    user?.email?.split('@')[0]?.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ') || 
    'User';

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const openProfile = () => {
    setProfileName(user?.user_metadata?.full_name || user?.user_metadata?.name || '');
    setUpdateError('');
    setIsProfileOpen(true);
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileName
        }
      });
      if (error) throw error;
      setIsProfileOpen(false);
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-x-hidden">
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-row flex-nowrap justify-between h-16 items-center w-full max-w-full">
            <div className="flex items-center space-x-4 sm:space-x-8 min-w-0">
              <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900 dark:text-gray-100 min-w-0">
                <img src="/kyc-logo.png" alt="KYC Logo" className="w-8 h-8" />
                <span className="truncate">KYCc</span>
              </Link>
              
              <div className="hidden md:flex space-x-2 sm:space-x-4">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-gray-100 dark:bg-gray-800 transition-colors"
                      : "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  }
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/cards"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                      : "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  }
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </NavLink>
                <NavLink
                  to="/finances"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                      : "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  }
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Finances</span>
                </NavLink>
                <NavLink
                  to="/advisor"
                  className={({ isActive }) =>
                    isActive
                      ? "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800"
                      : "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors"
                  }
                >
                  <User className="w-4 h-4" />
                  <span>Advisor</span>
                </NavLink>

                {/* ── Discover Dropdown ── */}
                <span className="hidden lg:inline text-gray-300 dark:text-gray-700">|</span>
                
                <div 
                  className="relative"
                  onMouseEnter={() => setDiscoverDropdownOpen(true)}
                  onMouseLeave={() => setDiscoverDropdownOpen(false)}
                >
                  <button
                    onClick={() => setDiscoverDropdownOpen(!discoverDropdownOpen)}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors focus:outline-none"
                  >
                    <span>🧭</span>
                    <span>Discover</span>
                    <ChevronDown className="w-4 h-4 ml-0.5" />
                  </button>

                  {discoverDropdownOpen && (
                    <div className="absolute left-0 top-full w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 py-1 border border-gray-100 dark:border-gray-700">
                      <NavLink
                        to="/discover/explore"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-semibold"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`
                        }
                        onClick={() => setDiscoverDropdownOpen(false)}
                      >
                        🔍 Explore Cards
                      </NavLink>
                      <NavLink
                        to="/discover/offers"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-semibold"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`
                        }
                        onClick={() => setDiscoverDropdownOpen(false)}
                      >
                        🎁 Offers
                      </NavLink>
                      <NavLink
                        to="/discover/guides"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-semibold"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`
                        }
                        onClick={() => setDiscoverDropdownOpen(false)}
                      >
                        📚 Guides
                      </NavLink>
                      <NavLink
                        to="/discover/tools"
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-blue-400 font-semibold"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`
                        }
                        onClick={() => setDiscoverDropdownOpen(false)}
                      >
                        🛠️ Tools
                      </NavLink>
                    </div>
                  )}
                </div>
              </div>
              <button
                className="hidden ml-2 p-2 rounded hover:bg-gray-100 focus:outline-none"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex flex-row items-center space-x-2 sm:space-x-4 min-w-0">
              <button
                onClick={openProfile}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-0 font-medium"
                title="Manage Profile"
              >
                <User className="w-4 h-4 shrink-0" />
                <span className="truncate max-w-[80px] sm:max-w-[140px] md:max-w-[200px]">{displayName}</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>

        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-6 transition-colors dark:bg-gray-950 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <BottomNav />

      {isProfileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Manage Profile</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email Address</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="profileName" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  id="profileName"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {updateError && (
                <p className="text-xs text-red-600 dark:text-red-400">{updateError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  disabled={updateLoading}
                  className="flex-1 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading || !profileName.trim()}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors flex items-center justify-center font-medium"
                >
                  {updateLoading ? 'Saving...' : 'Save Name'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
