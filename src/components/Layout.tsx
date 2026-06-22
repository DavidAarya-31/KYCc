import { Outlet, Link, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Home, LogOut, User, TrendingUp, Moon, Sun } from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
              </div>
              <button
                className="md:hidden ml-2 p-2 rounded hover:bg-gray-100 focus:outline-none"
                onClick={() => setMobileNavOpen((v) => !v)}
                aria-label="Open navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div className="flex flex-row items-center space-x-2 sm:space-x-4 min-w-0">
              <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 min-w-0">
                <User className="w-4 h-4" />
                <span className="truncate max-w-[80px] sm:max-w-[140px] md:max-w-[200px]">{user?.email}</span>
              </div>
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
          {mobileNavOpen && (
            <div className="md:hidden mt-2 pb-2">
              <div className="flex flex-col space-y-2">
                <NavLink
                  to="/"
                  className={({ isActive }) => isActive ? 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors'}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/cards"
                  className={({ isActive }) => isActive ? 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors'}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Cards</span>
                </NavLink>
                <NavLink
                  to="/finances"
                  className={({ isActive }) => isActive ? 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800' : 'flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors'}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Finances</span>
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 transition-colors dark:bg-gray-950 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
