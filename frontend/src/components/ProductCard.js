// src/components/ProductCard.js
import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export function ProductCard({ product, index }) {
  const {
    product_name,
    image_url,
    current_price,
    summary,
    key_specifications = [],
    product_url
  } = product;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-elegant hover:shadow-elegant-lg transition-all duration-300 overflow-hidden group"
    >
      {/* Product Image */}
      <div className="relative h-64 bg-gray-50 overflow-hidden">
        <img
          src={image_url || '/api/placeholder/300/200'}
          alt={product_name}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/200';
          }}
        />
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
            #{index + 1}
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product_name}
        </h3>
        
        {/* Price */}
        <div className="mb-4">
          <span className="text-3xl font-bold text-primary-600">
            ${typeof current_price === 'number' ? current_price.toLocaleString() : current_price || 'N/A'}
          </span>
        </div>

        {/* Summary */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {summary}
        </p>

        {/* Key Specifications */}
        {key_specifications.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
            <div className="space-y-1">
              {key_specifications.slice(0, 4).map((spec, i) => (
                <div key={i} className="flex items-center text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                  {spec}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <motion.a
          href={product_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          View Product
          <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-2 opacity-70 group-hover:opacity-100 transition-opacity" />
        </motion.a>
      </div>
    </motion.div>
  );
}