// src/components/Wishlist.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartIcon, 
  TrashIcon, 
  StarIcon,
  ShoppingCartIcon,
  ShareIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Wishlist({ isOpen, onClose }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && user) {
      fetchWishlistItems();
    }
  }, [isOpen, user]);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wishlist', {
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'demo_token'}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'demo_token'}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        toast.success('Removed from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    }
  };

  const shareWishlist = async () => {
    try {
      const wishlistText = wishlistItems
        .map(item => `${item.name} - ${item.current_price} (${item.source})`)
        .join('\n');
      
      if (navigator.share) {
        await navigator.share({
          title: 'My Shopping Wishlist',
          text: wishlistText,
        });
      } else {
        await navigator.clipboard.writeText(wishlistText);
        toast.success('Wishlist copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing wishlist:', error);
      toast.error('Failed to share wishlist');
    }
  };

  const openProductUrl = (url) => {
    if (url && url !== 'N/A') {
      window.open(url, '_blank');
    } else {
      toast.error('Product URL not available');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HeartSolidIcon className="h-8 w-8" />
              <h2 className="text-2xl font-bold">My Wishlist</h2>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm">
                {wishlistItems.length} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={shareWishlist}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Share Wishlist"
              >
                <ShareIcon className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-600">Loading your wishlist...</span>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="text-center py-12">
              <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500">Start adding products you love!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image_url || '/placeholder-product.png'}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg bg-gray-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">
                          {item.name}
                        </h3>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-green-600">
                            {item.current_price}
                          </span>
                          {item.original_price && item.original_price !== item.current_price && (
                            <span className="text-sm text-gray-500 line-through">
                              {item.original_price}
                            </span>
                          )}
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {item.source}
                          </span>
                        </div>

                        {item.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{item.rating}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openProductUrl(item.product_url)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                            disabled={!item.product_url || item.product_url === 'N/A'}
                          >
                            <ShoppingCartIcon className="h-4 w-4" />
                            Buy Now
                          </button>
                          
                          <button
                            onClick={() => openProductUrl(item.product_url)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={!item.product_url || item.product_url === 'N/A'}
                          >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                            View
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from wishlist"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Hook to manage wishlist operations
export function useWishlist() {
  const { user } = useAuth();

  const addToWishlist = async (product) => {
    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'demo_token'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: product.name,
          current_price: product.current_price,
          original_price: product.original_price,
          image_url: product.image_url,
          product_url: product.product_url,
          source: product.source,
          rating: product.rating,
          product_data: product
        })
      });

      if (response.ok) {
        toast.success('Added to wishlist! ❤️');
        return true;
      } else {
        throw new Error('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'demo_token'}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Removed from wishlist');
        return true;
      } else {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = async (productName) => {
    try {
      const response = await fetch(`/api/wishlist/check?name=${encodeURIComponent(productName)}`, {
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'demo_token'}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.exists;
      }
      return false;
    } catch (error) {
      console.error('Error checking wishlist:', error);
      return false;
    }
  };

  return {
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };
}