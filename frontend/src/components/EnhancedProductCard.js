// Enhanced ProductCard component with wishlist, feedback, and URL functionality
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLinkIcon, 
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useWishlist } from './Wishlist';
import { QuickFeedback } from './FeedbackSystem';
import toast from 'react-hot-toast';

const ProductCard = ({ product, scrapingStatus, onOpenUrl, onFeedback }) => {
  const [loading, setLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(true);
  const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist } = useWishlist();

  useEffect(() => {
    checkProductInWishlist();
  }, [product.name]);

  const checkProductInWishlist = async () => {
    try {
      const inWishlist = await checkWishlist(product.name);
      setIsInWishlist(inWishlist);
    } catch (error) {
      console.error('Error checking wishlist:', error);
    } finally {
      setCheckingWishlist(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (isInWishlist) {
      const success = await removeFromWishlist(product.name);
      if (success) {
        setIsInWishlist(false);
      }
    } else {
      const success = await addToWishlist(product);
      if (success) {
        setIsInWishlist(true);
      }
    }
  };

  const handleOpenProduct = async (url, source) => {
    if (!url || url === 'N/A') {
      toast.error('Product URL not available');
      return;
    }

    setLoading(true);
    try {
      // Track click event
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: product.name,
          source: source,
          url: url
        })
      });

      // Open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error tracking click:', error);
      // Still open the URL even if tracking fails
      window.open(url, '_blank', 'noopener,noreferrer');
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source) => {
    switch (source?.toLowerCase()) {
      case 'amazon': return 'bg-orange-500';
      case 'flipkart': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      {/* Product Image */}
      <div className="relative">
        <img 
          src={product.image_url || '/placeholder-product.png'} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            e.target.src = '/placeholder-product.png';
          }}
        />
        
        {/* Source Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-white text-xs font-bold ${getSourceColor(product.source)}`}>
          {product.source || 'Unknown'}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          disabled={checkingWishlist}
          className="absolute top-2 left-2 p-2 bg-white bg-opacity-90 rounded-full shadow-md hover:bg-opacity-100 transition-all"
        >
          {checkingWishlist ? (
            <div className="animate-spin h-5 w-5 border-2 border-pink-500 border-t-transparent rounded-full"></div>
          ) : isInWishlist ? (
            <HeartSolidIcon className="h-5 w-5 text-pink-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400 hover:text-pink-500" />
          )}
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
          {product.name}
        </h3>
        
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mt-2">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        )}
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-600">
              {product.current_price || 'N/A'}
            </span>
            {product.original_price && product.original_price !== product.current_price && (
              <span className="text-sm text-gray-500 line-through">
                {product.original_price}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => handleOpenProduct(product.product_url, product.source)}
            disabled={loading || !product.product_url || product.product_url === 'N/A'}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4" />
                Buy Now
              </>
            )}
          </button>
          
          <button
            onClick={() => handleOpenProduct(product.product_url, product.source)}
            disabled={loading || !product.product_url || product.product_url === 'N/A'}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <ExternalLinkIcon className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Quick Feedback */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <QuickFeedback 
            product={product} 
            onFeedback={(feedback) => onFeedback && onFeedback(feedback)} 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;