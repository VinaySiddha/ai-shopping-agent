// src/components/FeedbackSystem.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ShoppingBagIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function FeedbackSystem({ 
  isOpen, 
  onClose, 
  searchResults, 
  searchQuery,
  searchId 
}) {
  const [feedbackStep, setFeedbackStep] = useState('rating'); // rating, purchase, detailed
  const [overallRating, setOverallRating] = useState(0);
  const [purchaseStatus, setPurchaseStatus] = useState({});
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [helpfulResults, setHelpfulResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const resetFeedback = () => {
    setFeedbackStep('rating');
    setOverallRating(0);
    setPurchaseStatus({});
    setDetailedFeedback('');
    setHelpfulResults([]);
  };

  useEffect(() => {
    if (isOpen) {
      resetFeedback();
    }
  }, [isOpen]);

  const handleOverallRating = (rating) => {
    setOverallRating(rating);
    setFeedbackStep('purchase');
  };

  const handlePurchaseUpdate = (productId, status) => {
    setPurchaseStatus(prev => ({
      ...prev,
      [productId]: status
    }));
  };

  const handleResultHelpfulness = (productId, helpful) => {
    setHelpfulResults(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item => 
          item.productId === productId 
            ? { ...item, helpful } 
            : item
        );
      } else {
        return [...prev, { productId, helpful }];
      }
    });
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    
    try {
      const feedbackData = {
        searchId,
        searchQuery,
        overallRating,
        purchaseStatus,
        detailedFeedback,
        helpfulResults,
        timestamp: new Date().toISOString(),
        resultCount: searchResults.length
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token || 'demo_token'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        toast.success('Thank you for your feedback! 🎉');
        onClose();
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
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
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Share Your Experience</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-2">
            {['rating', 'purchase', 'detailed'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${
                  feedbackStep === step ? 'bg-white' : 
                  ['rating', 'purchase', 'detailed'].indexOf(feedbackStep) > index ? 'bg-white bg-opacity-70' : 'bg-white bg-opacity-30'
                }`} />
                {index < 2 && <div className="w-8 h-0.5 bg-white bg-opacity-30 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Overall Rating */}
            {feedbackStep === 'rating' && (
              <motion.div
                key="rating"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold mb-4">
                  How would you rate your search experience?
                </h3>
                <p className="text-gray-600 mb-8">
                  Query: "{searchQuery}"
                </p>
                
                <div className="flex justify-center gap-2 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleOverallRating(star)}
                      className="p-2 hover:scale-110 transition-transform"
                    >
                      {star <= overallRating ? (
                        <StarSolidIcon className="h-12 w-12 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-12 w-12 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  {overallRating > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      {overallRating === 1 ? 'Poor' :
                       overallRating === 2 ? 'Fair' :
                       overallRating === 3 ? 'Good' :
                       overallRating === 4 ? 'Very Good' : 'Excellent'}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Purchase Status */}
            {feedbackStep === 'purchase' && (
              <motion.div
                key="purchase"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Did you purchase any of these products?
                </h3>
                <p className="text-gray-600 mb-6">
                  This helps us improve our recommendations
                </p>

                <div className="space-y-4 mb-8">
                  {searchResults.slice(0, 5).map((product, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.image_url || '/placeholder-product.png'}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg bg-gray-200"
                          onError={(e) => {
                            e.target.src = '/placeholder-product.png';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.current_price}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePurchaseUpdate(index, 'purchased')}
                            className={`p-2 rounded-lg transition-colors ${
                              purchaseStatus[index] === 'purchased'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-200 text-gray-600 hover:bg-green-50'
                            }`}
                          >
                            <ShoppingBagIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePurchaseUpdate(index, 'interested')}
                            className={`p-2 rounded-lg transition-colors ${
                              purchaseStatus[index] === 'interested'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-gray-200 text-gray-600 hover:bg-yellow-50'
                            }`}
                          >
                            <HeartIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePurchaseUpdate(index, 'not_interested')}
                            className={`p-2 rounded-lg transition-colors ${
                              purchaseStatus[index] === 'not_interested'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-200 text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      {/* Result Helpfulness */}
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Was this result helpful?</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleResultHelpfulness(index, true)}
                              className={`p-1 rounded transition-colors ${
                                helpfulResults.find(r => r.productId === index)?.helpful === true
                                  ? 'bg-green-100 text-green-600'
                                  : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                              }`}
                            >
                              <HandThumbUpIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResultHelpfulness(index, false)}
                              className={`p-1 rounded transition-colors ${
                                helpfulResults.find(r => r.productId === index)?.helpful === false
                                  ? 'bg-red-100 text-red-600'
                                  : 'text-gray-400 hover:bg-red-50 hover:text-red-600'
                              }`}
                            >
                              <HandThumbDownIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setFeedbackStep('rating')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setFeedbackStep('detailed')}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Detailed Feedback */}
            {feedbackStep === 'detailed' && (
              <motion.div
                key="detailed"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="text-xl font-semibold mb-4">
                  Any additional feedback?
                </h3>
                <p className="text-gray-600 mb-6">
                  Help us improve by sharing your thoughts
                </p>

                <textarea
                  value={detailedFeedback}
                  onChange={(e) => setDetailedFeedback(e.target.value)}
                  placeholder="Tell us about your experience, suggestions for improvement, or any issues you encountered..."
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setFeedbackStep('purchase')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={submitting}
                  >
                    Back
                  </button>
                  <button
                    onClick={submitFeedback}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </div>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quick feedback component for individual products
export function QuickFeedback({ product, onFeedback }) {
  const [rating, setRating] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const submitQuickFeedback = () => {
    if (rating > 0) {
      onFeedback({
        productName: product.name,
        rating,
        timestamp: new Date().toISOString()
      });
      toast.success('Thank you for your feedback!');
      setShowForm(false);
      setRating(0);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowForm(!showForm)}
        className="text-sm text-gray-500 hover:text-blue-500 transition-colors"
      >
        Rate this result
      </button>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 min-w-[200px]"
        >
          <p className="text-sm font-medium mb-2">Rate this product:</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="hover:scale-110 transition-transform"
              >
                {star <= rating ? (
                  <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                ) : (
                  <StarIcon className="h-5 w-5 text-gray-300 hover:text-yellow-400" />
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitQuickFeedback}
              disabled={rating === 0}
              className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}