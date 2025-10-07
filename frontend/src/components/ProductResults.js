// src/components/ProductResults.js
import React from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon, 
  ShoppingCartIcon, 
  ExternalLinkIcon,
  HeartIcon,
  ShareIcon 
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export function ProductResults({ results }) {
  if (!results || !results.results || results.results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
      </motion.div>
    );
  }

  const renderRating = (rating, ratingNumeric) => {
    if (ratingNumeric) {
      const stars = Math.round(ratingNumeric);
      return (
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <StarIconSolid
              key={i}
              className={`w-4 h-4 ${
                i < stars ? 'text-yellow-400' : 'text-gray-200'
              }`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">
            {ratingNumeric.toFixed(1)}
          </span>
        </div>
      );
    }
    
    if (rating) {
      return (
        <div className="flex items-center">
          <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
          <span className="text-sm text-gray-600">{rating}</span>
        </div>
      );
    }
    
    return null;
  };

  const formatPrice = (price, priceNumeric) => {
    if (priceNumeric) {
      return `$${priceNumeric.toLocaleString()}`;
    }
    return price || 'Price not available';
  };

  const getMatchScoreColor = (score) => {
    if (score >= 0.8) return 'bg-green-100 text-green-800';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Found {results.total_found} Products
        </h2>
        {results.search_strategy && (
          <p className="text-gray-600">
            Strategy: {results.search_strategy}
          </p>
        )}
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.results.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Product Image */}
            {product.image_url && product.image_url !== 'N/A' && (
              <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="p-6">
              {/* Match Score Badge */}
              {product.match_score !== undefined && (
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(
                      product.match_score
                    )}`}
                  >
                    {Math.round(product.match_score * 100)}% match
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                {product.name}
              </h3>

              {/* Brand */}
              {product.brand && (
                <p className="text-sm text-gray-500 mb-2">by {product.brand}</p>
              )}

              {/* Rating */}
              {(product.rating || product.rating_numeric) && (
                <div className="mb-3">
                  {renderRating(product.rating, product.rating_numeric)}
                </div>
              )}

              {/* Price */}
              <div className="text-2xl font-bold text-primary-600 mb-4">
                {formatPrice(product.price, product.price_numeric)}
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Key Features:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pros and Cons */}
              {product.pros_cons && (
                <div className="mb-4 space-y-2">
                  {product.pros_cons.pros && product.pros_cons.pros.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-green-700 mb-1">Pros:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {product.pros_cons.pros.slice(0, 2).map((pro, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-1">+</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.pros_cons.cons && product.pros_cons.cons.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium text-red-700 mb-1">Cons:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {product.pros_cons.cons.slice(0, 2).map((con, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 mr-1">-</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {product.source_url && product.source_url !== 'N/A' && product.source_url.trim() !== '' && (
                  <a
                    href={product.source_url.startsWith('http') ? product.source_url : `https://${product.source_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-primary-600 text-white text-center py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center"
                    onClick={() => {
                      // Track click for analytics
                      console.log('Product clicked:', product.name);
                    }}
                  >
                    <ShoppingCartIcon className="w-4 h-4 mr-1" />
                    Buy Now
                  </a>
                )}
                
                {(!product.source_url || product.source_url === 'N/A' || product.source_url.trim() === '') && (
                  <div className="flex-1 bg-gray-300 text-gray-500 text-center py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center cursor-not-allowed">
                    <ShoppingCartIcon className="w-4 h-4 mr-1" />
                    URL Not Available
                  </div>
                )}
                
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                </button>
                
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShareIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Availability */}
              {product.availability && (
                <div className="mt-3 text-xs text-gray-500">
                  {product.availability}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison Summary */}
      {results.comparison_summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            AI Comparison Summary
          </h3>
          <p className="text-blue-800">{results.comparison_summary}</p>
        </motion.div>
      )}

      {/* Recommendation */}
      {results.recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-green-50 border border-green-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            AI Recommendation
          </h3>
          <p className="text-green-800">{results.recommendation}</p>
        </motion.div>
      )}
    </div>
  );
}