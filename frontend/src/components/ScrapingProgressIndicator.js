// ScrapingProgressIndicator.js - Real-time scraping progress component
import React, { useState, useEffect } from 'react';

const ScrapingProgressIndicator = ({ sessionId, onComplete }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/scraping/${sessionId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
          
          // If completed, call onComplete callback
          if (data.status === 'completed' && onComplete) {
            onComplete(data);
          }
          
          // If still processing, continue polling
          if (['initiated', 'scraping_amazon', 'scraping_flipkart', 'processing'].includes(data.status)) {
            setTimeout(fetchStatus, 2000); // Poll every 2 seconds
          }
        }
      } catch (error) {
        console.error('Error fetching scraping status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [sessionId, onComplete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Initializing scraper...</span>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusMessage = () => {
    switch (status.status) {
      case 'initiated':
        return 'Starting scraping process...';
      case 'scraping_amazon':
        return 'Scraping Amazon products...';
      case 'scraping_flipkart':
        return 'Scraping Flipkart products...';
      case 'processing':
        return 'Processing and analyzing results...';
      case 'completed':
        return 'Scraping completed successfully!';
      case 'failed':
        return 'Scraping failed. Please try again.';
      default:
        return 'Unknown status';
    }
  };

  const getProgressPercentage = () => {
    switch (status.status) {
      case 'initiated': return 10;
      case 'scraping_amazon': return 30;
      case 'scraping_flipkart': return 60;
      case 'processing': return 85;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'amazon':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-orange-600 font-medium">Amazon</span>
          </div>
        );
      case 'flipkart':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-600 font-medium">Flipkart</span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">AI Processing</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Scraping Progress</h3>
        {getSourceIcon(status.current_source)}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${ 
            status.status === 'failed' ? 'bg-red-500' : 'bg-blue-600'
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>

      {/* Status Message */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{getStatusMessage()}</span>
        <span className="text-sm font-medium text-gray-900">
          {getProgressPercentage()}%
        </span>
      </div>

      {/* Product Counts */}
      {(status.amazon_products > 0 || status.flipkart_products > 0) && (
        <div className="mt-4 flex space-x-4 text-sm">
          {status.amazon_products > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Amazon: {status.amazon_products} products</span>
            </div>
          )}
          {status.flipkart_products > 0 && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Flipkart: {status.flipkart_products} products</span>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {status.status === 'failed' && status.error_message && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{status.error_message}</p>
        </div>
      )}

      {/* Success Summary */}
      {status.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">
            Successfully found {status.products_found} products from {status.amazon_products + status.flipkart_products > 0 ? 'Amazon and Flipkart' : 'available sources'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ScrapingProgressIndicator;