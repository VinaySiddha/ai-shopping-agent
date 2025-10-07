// src/components/FilteredShoppingAgent.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  Button,
  Divider
} from '@mui/material';
import { 
  TrendingUp, 
  ShoppingCart, 
  Search, 
  FilterList,
  Analytics,
  Favorite,
  Compare,
  Insights,
  LocalOffer
} from '@mui/icons-material';
import { ProductFilters } from './ProductFilters';
import { ProductResults } from './ProductResults';
import { EnhancedLoadingStates } from './EnhancedLoadingStates';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useProductSearch } from '../hooks/useProductSearch';
import toast from 'react-hot-toast';

export function FilteredShoppingAgent() {
  const [filters, setFilters] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState('');
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    avgPrice: 0,
    favoriteProducts: 0,
    savedFilters: 0
  });
  
  const {
    data: searchResults,
    isLoading,
    error,
    searchProducts,
    currentStage,
    progress
  } = useProductSearch();

  // Mock analytics data
  const analyticsData = [
    {
      title: 'Total Searches',
      value: '1,247',
      change: '+25%',
      trend: 'up',
      icon: <Search />,
      color: '#00d4ff'
    },
    {
      title: 'Products Found',
      value: '15,432',
      change: '+12%',
      trend: 'up',
      icon: <ShoppingCart />,
      color: '#4caf50'
    },
    {
      title: 'Avg. Rating',
      value: '4.2/5',
      change: '+5%',
      trend: 'up',
      icon: <TrendingUp />,
      color: '#ff9800'
    },
    {
      title: 'Saved Items',
      value: '89',
      change: '-3%',
      trend: 'down',
      icon: <Favorite />,
      color: '#e91e63'
    }
  ];

  const generateSmartQuery = (filters) => {
    const { category, budget, brands, useCase } = filters;
    
    let query = '';
    
    if (category) {
      query += category;
      
      if (useCase) {
        query += ` for ${useCase.toLowerCase()}`;
      }
      
      if (brands && brands.length > 0) {
        if (brands.length === 1) {
          query += ` from ${brands[0]}`;
        } else {
          query += ` from brands like ${brands.slice(0, 2).join(' or ')}`;
        }
      }
      
      if (budget && budget.min !== undefined && budget.max !== undefined) {
        if (budget.max >= 10000) {
          query += ` under $${budget.min.toLocaleString()}`;
        } else {
          query += ` between $${budget.min.toLocaleString()} and $${budget.max.toLocaleString()}`;
        }
      }
    }
    
    return query || 'popular products';
  };

  const handleSearch = async () => {
    if (!filters.category) {
      toast.error('Please select a product category first');
      return;
    }

    const query = generateSmartQuery(filters);
    setGeneratedQuery(query);
    setShowResults(true);
    
    try {
      await searchProducts({
        query,
        filters: {
          category: filters.category,
          min_price: filters.budget?.min,
          max_price: filters.budget?.max,
          brands: filters.brands,
          use_case: filters.useCase
        }
      });
      
      toast.success('Search completed successfully!');
    } catch (err) {
      toast.error('Search failed. Please try again.');
      console.error('Search error:', err);
    }
  };

  const handleNewSearch = () => {
    setShowResults(false);
    setFilters({});
    setGeneratedQuery('');
  };

  const canSearch = filters.category && (
    filters.budget || 
    (filters.brands && filters.brands.length > 0) || 
    filters.useCase
  );

  if (!showResults) {
    return (
      <div style={{ 
        background: 'linear-gradient(135deg, #05070a 0%, #0a0f1c 50%, #05070a 100%)',
        minHeight: '100vh',
        position: 'relative'
      }}>
        {/* Background Elements */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(0, 212, 255, 0.03) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }}
        />

        <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
              Shopping Analytics Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Discover insights and find the perfect products with AI-powered search
            </Typography>
          </Box>

          {/* Analytics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {analyticsData.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      backdropFilter: 'blur(20px)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                      }
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Avatar sx={{ 
                          background: `${item.color}20`, 
                          color: item.color,
                          width: 48,
                          height: 48
                        }}>
                          {item.icon}
                        </Avatar>
                        <Chip 
                          label={item.change}
                          size="small"
                          sx={{
                            background: item.trend === 'up' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                            color: item.trend === 'up' ? '#4caf50' : '#f44336',
                            border: `1px solid ${item.trend === 'up' ? '#4caf50' : '#f44336'}30`
                          }}
                        />
                      </Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        {item.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {item.title}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Main Content Grid */}
          <Grid container spacing={3}>
            {/* Search Configuration Panel */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    height: 'fit-content'
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FilterList sx={{ color: '#00d4ff', mr: 1 }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Search Configuration
                      </Typography>
                    </Box>
                    
                    <ProductFilters
                      onFiltersChange={setFilters}
                      isLoading={isLoading}
                    />
                    
                    <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
                    
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSearch}
                      disabled={!canSearch}
                      startIcon={<Search />}
                      sx={{
                        background: canSearch 
                          ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                          : 'rgba(255,255,255,0.1)',
                        color: canSearch ? 'white' : 'rgba(255,255,255,0.5)',
                        fontWeight: 'bold',
                        py: 1.5,
                        '&:hover': {
                          background: canSearch 
                            ? 'linear-gradient(135deg, #4de0ff 0%, #00d4ff 100%)'
                            : 'rgba(255,255,255,0.1)',
                        }
                      }}
                    >
                      {isLoading ? 'Searching...' : 'Start Search'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Insights and Quick Actions */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                {/* Quick Actions */}
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <Card
                      sx={{
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        mb: 2
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                          Quick Actions
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            { icon: <Analytics />, label: 'Price Trends', color: '#00d4ff' },
                            { icon: <Compare />, label: 'Compare Products', color: '#4caf50' },
                            { icon: <LocalOffer />, label: 'Best Deals', color: '#ff9800' },
                            { icon: <Insights />, label: 'AI Insights', color: '#e91e63' }
                          ].map((action, index) => (
                            <Grid item xs={6} sm={3} key={index}>
                              <Button
                                fullWidth
                                variant="outlined"
                                startIcon={action.icon}
                                sx={{
                                  color: action.color,
                                  borderColor: `${action.color}30`,
                                  background: `${action.color}10`,
                                  '&:hover': {
                                    borderColor: action.color,
                                    background: `${action.color}20`,
                                  },
                                  py: 1
                                }}
                              >
                                {action.label}
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>

                {/* Search Progress */}
                {isLoading && (
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card
                        sx={{
                          backdropFilter: 'blur(20px)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <CardContent>
                          <EnhancedLoadingStates currentStage={currentStage} progress={progress} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                )}

                {/* Recent Searches or Recommendations */}
                <Grid item xs={12}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    <Card
                      sx={{
                        backdropFilter: 'blur(20px)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                          Popular Categories
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {['Laptops', 'Smartphones', 'Headphones', 'Watches', 'Cameras', 'Shoes'].map((category, index) => (
                            <Chip
                              key={index}
                              label={category}
                              onClick={() => setFilters(prev => ({ ...prev, category: category.toLowerCase() }))}
                              sx={{
                                background: 'rgba(0, 212, 255, 0.1)',
                                color: '#00d4ff',
                                border: '1px solid rgba(0, 212, 255, 0.3)',
                                '&:hover': {
                                  background: 'rgba(0, 212, 255, 0.2)',
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </div>
  if (showResults) {
    return (
      <div className="min-h-screen" style={{ 
        background: 'linear-gradient(135deg, #05070a 0%, #0a0f1c 50%, #05070a 100%)',
        position: 'relative'
      }}>
        {/* Background Elements */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 50%, rgba(0, 212, 255, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(0, 212, 255, 0.03) 0%, transparent 50%)
            `,
            pointerEvents: 'none'
          }}
        />
        
        <div className="flex relative z-10">
          {/* Left Sidebar - Search Options */}
          <div 
            className="w-80 min-h-screen border-r"
            style={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div 
              className="p-6 border-b"
              style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div className="flex items-center mb-4">
                <SparklesIcon className="w-6 h-6 mr-2" style={{ color: '#00d4ff' }} />
                <h2 className="text-lg font-semibold text-white">Search Options</h2>
              </div>
              <button
                onClick={handleNewSearch}
                className="w-full px-4 py-2 rounded-lg transition-all text-sm font-medium text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                New Search
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Current Query</h3>
                <p 
                  className="text-sm p-3 rounded-lg text-gray-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  "{generatedQuery}"
                </p>
              </div>
              
              <ProductFilters
                onFiltersChange={setFilters}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Right Content - Products */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Search Results</h1>
              <p className="text-gray-300">
                AI-powered product recommendations based on your criteria
              </p>
            </div>

            {/* Enhanced Loading States */}
            {isLoading && (
              <div className="mb-8">
                <EnhancedLoadingStates currentStage={currentStage} progress={progress} />
              </div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-6 mb-8"
                style={{
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                <h3 className="text-lg font-semibold text-red-300 mb-2">Search Error</h3>
                <p className="text-red-200">{error}</p>
                <button
                  onClick={handleSearch}
                  className="mt-4 px-4 py-2 rounded-lg transition-colors text-white font-medium"
                  style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)',
                    boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)'
                  }}
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Product Results */}
            {searchResults && !isLoading && (
              <ProductResults results={searchResults} />
            )}
          </div>
        </div>
      </div>
    );
  }