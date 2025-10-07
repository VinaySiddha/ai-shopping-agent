// src/components/SearchForm.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from './LoadingSpinner';

const SUGGESTED_SEARCHES = [
  "Gaming laptop under $1500 with RTX 4060",
  "Best running shoes for marathon training",
  "Organic skincare routine for sensitive skin",
  "Ergonomic office chair under $300",
  "Healthy dog food for senior dogs",
  "Coffee books for home brewing beginners",
  "Yoga mat for daily practice",
  "Wireless earbuds for workouts",
  "Car phone mount with wireless charging",
  "Indoor plants for low light apartments"
];

export function SearchForm({ onSearch, isLoading, currentSearch }) {
  const [prompt, setPrompt] = useState(currentSearch || '');
  const [numProducts, setNumProducts] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSearch({ prompt: prompt.trim(), num_products: numProducts });
    }
  };

  const handleSuggestedSearch = (suggestion) => {
    setPrompt(suggestion);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-elegant p-8 mb-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full mb-4"
        >
          <SparklesIcon className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          AI Shopping Assistant
        </h1>
        <p className="text-lg text-gray-600">
          Describe what you're looking for and let our AI find the perfect products
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Search Input */}
        <div className="relative">
          <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
            What are you shopping for?
          </label>
          <div className="relative">
            <textarea
              id="search"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Gaming laptop under $1500 with at least 16GB RAM and RTX 4060..."
              className="w-full px-4 py-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none transition-all duration-200"
              rows="3"
              required
            />
            <MagnifyingGlassIcon className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Number of Products */}
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="numProducts" className="block text-sm font-semibold text-gray-700 mb-2">
              Number of products to find:
            </label>
            <select
              id="numProducts"
              value={numProducts}
              onChange={(e) => setNumProducts(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                Searching...
              </div>
            ) : (
              <div className="flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Find Products
              </div>
            )}
          </motion.button>
        </div>
      </form>

      {/* Suggested Searches */}
      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-100"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Try these searches:</h3>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_SEARCHES.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestedSearch(suggestion)}
                className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600 rounded-full transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}