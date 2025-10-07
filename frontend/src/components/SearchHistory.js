// src/components/SearchHistory.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon, 
  MagnifyingGlassIcon, 
  TrashIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export function SearchHistory({ onSelectSearch }) {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    fetchSearchHistory();
    fetchRecommendations();
  }, []);

  const fetchSearchHistory = async () => {
    try {
      setLoading(true);
      
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      let authToken = null;
      
      if (!isDemoMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setSearchHistory([]);
          setLoading(false);
          return;
        }
        authToken = session.access_token;
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('http://localhost:8000/api/user/search-history', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setSearchHistory(data.searches || []);
      } else {
        console.error('Failed to fetch search history');
        setSearchHistory([]);
      }
    } catch (error) {
      console.error('Error fetching search history:', error);
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      let authToken = null;
      
      if (!isDemoMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        authToken = session.access_token;
      }

      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('http://localhost:8000/api/user/recommendations', {
        headers
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    }
  };

  const handleSearchAgain = (search) => {
    if (onSelectSearch) {
      onSelectSearch({
        query: search.original_query || search.query_text,
        filters: search.applied_filters
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-primary-600" />
            Recent Searches
          </h3>
          <button
            onClick={fetchSearchHistory}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>

        {searchHistory.length === 0 ? (
          <div className="text-center py-8">
            <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No search history yet</p>
            <p className="text-sm text-gray-400">Your searches will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchHistory.map((search, index) => (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {search.original_query || search.query_text}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{formatDate(search.created_at)}</span>
                      {search.product_results && (
                        <span>{search.product_results.length} products found</span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        search.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {search.status}
                      </span>
                    </div>
                    
                    {search.applied_filters && Object.keys(search.applied_filters).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(search.applied_filters).map(([key, value]) => (
                          value && (
                            <span
                              key={key}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {key}: {Array.isArray(value) ? value.join(', ') : value}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleSearchAgain(search)}
                      className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Search again"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Product preview */}
                {search.product_results && search.product_results.length > 0 && (
                  <div className="mt-3 flex space-x-2 overflow-x-auto">
                    {search.product_results.slice(0, 3).map((product, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden"
                      >
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {search.product_results.length > 3 && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          +{search.product_results.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Recommendations */}
      {recommendations && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎯 Smart Recommendations
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Preferred Categories */}
            {recommendations.preferred_categories && recommendations.preferred_categories.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Your Favorite Categories</h4>
                <div className="space-y-1">
                  {recommendations.preferred_categories.slice(0, 3).map(([category, count]) => (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="text-gray-600">{category}</span>
                      <span className="text-purple-600 font-medium">{count} searches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Price Range */}
            {recommendations.average_price_range && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Your Price Range</h4>
                <div className="text-sm text-gray-600">
                  <p>Average: ${recommendations.average_price_range.avg?.toFixed(0) || 'N/A'}</p>
                  <p>Range: ${recommendations.average_price_range.min?.toFixed(0) || 0} - ${recommendations.average_price_range.max?.toFixed(0) || 0}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Suggested Searches */}
          {recommendations.suggested_searches && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">Suggested for You</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.suggested_searches.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectSearch && onSelectSearch({ query: suggestion })}
                    className="px-3 py-1 bg-white text-purple-700 rounded-full text-sm hover:bg-purple-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}