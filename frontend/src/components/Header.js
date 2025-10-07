// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export function Header({ onShowHistory, onShowRecommendations, onShowWishlist, user }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    if (user) {
      setUserProfile({
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        avatar_url: user.user_metadata?.avatar_url
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      
      if (isDemoMode) {
        localStorage.removeItem('demoMode');
        window.location.reload();
      } else {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.error('Logout error:', error);
    }
  };

  const isDemoMode = localStorage.getItem('demoMode') === 'true';

  return (
    <header 
      className="shadow-sm border-b sticky top-0 z-50"
      style={{
        backdropFilter: 'blur(20px)',
        background: 'rgba(5, 7, 10, 0.9)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  boxShadow: '0 4px 16px rgba(0, 212, 255, 0.3)'
                }}
              >
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">
                AI Shopping Assistant
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={onShowHistory}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all text-gray-300 hover:text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <ClockIcon className="w-4 h-4 mr-2" />
              Search History
            </button>
            
            <button
              onClick={onShowWishlist}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all text-gray-300 hover:text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 107, 107, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <HeartIcon className="w-4 h-4 mr-2" />
              Wishlist
            </button>
            
            <button
              onClick={onShowRecommendations}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all text-gray-300 hover:text-white"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Recommendations
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg transition-all"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-gray-300" />
              )}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">
                  {isDemoMode ? 'Demo User' : userProfile?.display_name || 'User'}
                </p>
                <p className="text-xs text-gray-300">
                  {isDemoMode ? 'demo@example.com' : userProfile?.email}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg py-2 z-50"
                  style={{
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(5, 7, 10, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-sm font-medium text-white">
                      {isDemoMode ? 'Demo User' : userProfile?.display_name || 'User'}
                    </p>
                    <p className="text-xs text-gray-300">
                      {isDemoMode ? 'demo@example.com' : userProfile?.email}
                    </p>
                    {isDemoMode && (
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1"
                        style={{
                          background: 'rgba(255, 193, 7, 0.2)',
                          color: '#ffab00',
                          border: '1px solid rgba(255, 193, 7, 0.3)'
                        }}
                      >
                        Demo Mode
                      </span>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onShowHistory && onShowHistory();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm transition-colors text-gray-300 hover:text-white"
                      style={{
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <ClockIcon className="w-4 h-4 mr-3" style={{ color: '#00d4ff' }} />
                      Search History
                    </button>
                    
                    <button
                      onClick={() => {
                        onShowRecommendations && onShowRecommendations();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm transition-colors text-gray-300 hover:text-white"
                      style={{
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <ChartBarIcon className="w-4 h-4 mr-3" style={{ color: '#00d4ff' }} />
                      Recommendations
                    </button>

                    <hr className="my-1" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        toast.info('Profile settings coming soon!');
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm transition-colors text-gray-300 hover:text-white"
                      style={{
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-3" style={{ color: '#00d4ff' }} />
                      Settings
                    </button>
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm transition-colors text-red-300 hover:text-red-200"
                      style={{
                        background: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 107, 107, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'transparent';
                      }}
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                      {isDemoMode ? 'Exit Demo' : 'Sign Out'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}