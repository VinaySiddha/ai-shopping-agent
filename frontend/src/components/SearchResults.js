// src/components/SearchResults.js
import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';
import { LoadingSpinner, LoadingPulse } from './LoadingSpinner';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

export function SearchResults({ 
  results, 
  isLoading, 
  error, 
  searchStatus, 
  queryId 
}) {
  // Show loading state
  if (isLoading || (queryId && searchStatus?.status === 'pending')) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-elegant p-8 text-center"
      >
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          AI is analyzing your request...
        </h3>
        <p className="text-gray-600 mb-6">
          Our intelligent agents are searching multiple sources and comparing products for you
        </p>
        
        {/* Search Progress Steps */}
        <div className="max-w-md mx-auto">
          <div className="space-y-3">
            {[
              'Understanding your requirements',
              'Searching multiple marketplaces', 
              'Analyzing product specifications',
              'Ranking best matches'
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
                className="flex items-center text-sm text-gray-600"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity, delay: index * 0.5 }}
                  className="w-2 h-2 bg-primary-500 rounded-full mr-3"
                />
                {step}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Show error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-2xl shadow-elegant p-8 text-center"
      >
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Search Failed
        </h3>
        <p className="text-gray-600 mb-4">
          {error}
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // Show search status for async queries
  if (queryId && searchStatus) {
    if (searchStatus.status === 'failed') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-elegant p-8 text-center"
        >
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search Failed
          </h3>
          <p className="text-gray-600">
            {searchStatus.error_detail || 'Something went wrong with your search.'}
          </p>
        </motion.div>
      );
    }

    if (searchStatus.status === 'completed' && searchStatus.product_results) {
      const products = searchStatus.product_results
        .sort((a, b) => (a.position_in_results || 0) - (b.position_in_results || 0))
        .map(r => ({
          product_name: r.product_name,
          image_url: r.image_url,
          current_price: r.current_price,
          summary: r.summary,
          key_specifications: r.key_specifications || [],
          product_url: r.product_url
        }));

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Success Header */}
          <div className="bg-white rounded-2xl shadow-elegant p-6 text-center">
            <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Found {products.length} Perfect Matches!
            </h2>
            <p className="text-gray-600">
              Our AI analyzed hundreds of products to find these top recommendations
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <ProductCard 
                key={`${product.product_url}-${index}`}
                product={product} 
                index={index} 
              />
            ))}
          </div>
        </motion.div>
      );
    }
  }

  // Show results if available directly
  if (results && results.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-elegant p-6 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Found {results.length} Perfect Matches!
          </h2>
          <p className="text-gray-600">
            Our AI analyzed hundreds of products to find these top recommendations
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product, index) => (
            <ProductCard 
              key={`${product.product_url}-${index}`}
              product={product} 
              index={index} 
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Empty state - no search initiated yet
  return null;
}