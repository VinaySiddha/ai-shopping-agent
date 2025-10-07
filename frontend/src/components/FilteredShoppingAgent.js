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
  LocalOffer,
  Lightbulb,
  AutoAwesome,
  Speed,
  SavingsRounded,
  Security
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

  // Dashboard view (before search)
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

        <Box sx={{ 
          p: 3, 
          position: 'relative', 
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          minHeight: '100vh'
        }}>
          {/* Hero Introduction Section */}
          <Box sx={{ mb: 8, textAlign: 'center', maxWidth: '800px' }}>
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                boxShadow: '0 20px 60px rgba(0, 212, 255, 0.3)',
                mb: 4
              }}>
                <SparklesIcon style={{ width: 40, height: 40, color: 'white' }} />
              </Box>
              <Typography variant="h2" sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                mb: 3,
                background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                AI Shopping Assistant
              </Typography>
              <Typography variant="h5" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 4,
                lineHeight: 1.6
              }}>
                Discover perfect products with intelligent search powered by advanced AI algorithms
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.6)', 
                fontSize: '1.1rem',
                lineHeight: 1.8,
                mb: 4
              }}>
                Experience the future of online shopping with personalized recommendations, 
                smart filtering, and real-time price comparisons across thousands of products.
              </Typography>
              
              {/* Feature Highlights */}
              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                {[
                  { icon: '🤖', text: 'AI-Powered' },
                  { icon: '⚡', text: 'Real-time Results' },
                  { icon: '💡', text: 'Smart Recommendations' },
                  { icon: '🔍', text: 'Advanced Filters' }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Chip
                      icon={<span style={{ fontSize: '1.2rem' }}>{feature.icon}</span>}
                      label={feature.text}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        fontSize: '0.9rem',
                        py: 2,
                        px: 1,
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.15)',
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* Analytics Cards */}
          <Box sx={{ width: '100%', maxWidth: '1200px', mb: 8 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                textAlign: 'center', 
                mb: 6
              }}>
                Platform Analytics & Insights
              </Typography>
            </motion.div>
            <Grid container spacing={4} justifyContent="center">
              {analyticsData.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  >
                    <Card
                      sx={{
                        backdropFilter: 'blur(30px)',
                        background: `linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02))`,
                        border: `2px solid ${item.color}30`,
                        borderRadius: 4,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          background: `linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))`,
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 60px ${item.color}40`,
                          border: `2px solid ${item.color}60`,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '3px',
                          background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`,
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                          <Avatar sx={{ 
                            background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`, 
                            color: item.color,
                            width: 56,
                            height: 56,
                            boxShadow: `0 8px 24px ${item.color}30`
                          }}>
                            {item.icon}
                          </Avatar>
                          <Chip 
                            label={item.change}
                            size="medium"
                            sx={{
                              background: item.trend === 'up' 
                                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(76, 175, 80, 0.1))' 
                                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.3), rgba(244, 67, 54, 0.1))',
                              color: item.trend === 'up' ? '#4caf50' : '#f44336',
                              border: `1px solid ${item.trend === 'up' ? '#4caf50' : '#f44336'}50`,
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        <Typography variant="h4" sx={{ 
                          color: 'white', 
                          fontWeight: 'bold', 
                          mb: 1,
                          background: `linear-gradient(135deg, white, ${item.color})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          {item.value}
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          color: 'rgba(255,255,255,0.8)',
                          fontWeight: 500
                        }}>
                          {item.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Main Content Grid */}
          <Box sx={{ width: '100%', maxWidth: '1400px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 'bold', 
                textAlign: 'center', 
                mb: 2
              }}>
                Start Your Smart Search Journey
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.7)', 
                textAlign: 'center', 
                mb: 6,
                fontSize: '1.1rem'
              }}>
                Configure your preferences and let our AI find the perfect products for you
              </Typography>
            </motion.div>

            <Grid container spacing={4} justifyContent="center">
              {/* Search Configuration Panel */}
              <Grid item xs={12} lg={7}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  <Card
                    sx={{
                      backdropFilter: 'blur(30px)',
                      background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                      border: '2px solid rgba(0, 212, 255, 0.3)',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
                        <Box sx={{
                          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                          borderRadius: '50%',
                          p: 1.5,
                          mr: 2,
                          boxShadow: '0 8px 24px rgba(0, 212, 255, 0.3)'
                        }}>
                          <FilterList sx={{ color: 'white', fontSize: 28 }} />
                        </Box>
                        <Typography variant="h5" sx={{ 
                          color: 'white', 
                          fontWeight: 'bold',
                          background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          Search Configuration
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 4 }}>
                        <ProductFilters
                          onFiltersChange={setFilters}
                          isLoading={isLoading}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.2)' }} />
                      
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSearch}
                        disabled={!canSearch}
                        startIcon={<Search sx={{ fontSize: 24 }} />}
                        sx={{
                          background: canSearch 
                            ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                            : 'rgba(255,255,255,0.1)',
                          color: canSearch ? 'white' : 'rgba(255,255,255,0.5)',
                          fontWeight: 'bold',
                          py: 2,
                          fontSize: '1.2rem',
                          borderRadius: 3,
                          textTransform: 'none',
                          boxShadow: canSearch ? '0 8px 32px rgba(0, 212, 255, 0.4)' : 'none',
                          '&:hover': {
                            background: canSearch 
                              ? 'linear-gradient(135deg, #4de0ff 0%, #00d4ff 100%)'
                              : 'rgba(255,255,255,0.1)',
                            boxShadow: canSearch ? '0 12px 40px rgba(0, 212, 255, 0.5)' : 'none',
                            transform: canSearch ? 'translateY(-2px)' : 'none',
                          },
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {isLoading ? 'Searching...' : 'Start AI Search'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              {/* Insights and Quick Actions */}
              <Grid item xs={12} lg={5}>
                <Grid container spacing={3}>
                  {/* Quick Actions */}
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 1.2 }}
                    >
                      <Card
                        sx={{
                          backdropFilter: 'blur(30px)',
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: 4,
                          mb: 3
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ 
                            color: 'white', 
                            fontWeight: 'bold', 
                            mb: 3, 
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Insights sx={{ mr: 1, color: '#00d4ff' }} />
                            Quick Actions
                          </Typography>
                          <Grid container spacing={2}>
                            {[
                              { icon: <Analytics />, label: 'Price Trends', color: '#00d4ff' },
                              { icon: <Compare />, label: 'Compare', color: '#4caf50' },
                              { icon: <LocalOffer />, label: 'Best Deals', color: '#ff9800' },
                              { icon: <Favorite />, label: 'Wishlist', color: '#e91e63' }
                            ].map((action, index) => (
                              <Grid item xs={6} key={index}>
                                <Button
                                  fullWidth
                                  variant="outlined"
                                  startIcon={action.icon}
                                  sx={{
                                    color: action.color,
                                    borderColor: `${action.color}40`,
                                    background: `linear-gradient(135deg, ${action.color}15, ${action.color}05)`,
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 2,
                                    py: 1.5,
                                    fontSize: '0.9rem',
                                    fontWeight: 600,
                                    '&:hover': {
                                      borderColor: `${action.color}80`,
                                      background: `linear-gradient(135deg, ${action.color}25, ${action.color}10)`,
                                      transform: 'translateY(-2px)',
                                      boxShadow: `0 8px 25px ${action.color}30`,
                                    },
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

                  {/* Popular Categories */}
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
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                            Popular Categories
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
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
                  {/* Search Tips */}
                  <Grid item xs={12}>
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 1.4 }}
                    >
                      <Card
                        sx={{
                          backdropFilter: 'blur(30px)',
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: 4
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="h6" sx={{ 
                            color: 'white', 
                            fontWeight: 'bold', 
                            mb: 3, 
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Lightbulb sx={{ mr: 1, color: '#ffc107' }} />
                            Smart Search Tips
                          </Typography>
                          <Box>
                            {[
                              { tip: 'Use specific keywords for better results', icon: '🎯' },
                              { tip: 'Set price range to filter deals', icon: '💰' },
                              { tip: 'Choose categories for focused search', icon: '📂' },
                              { tip: 'AI will compare prices automatically', icon: '🤖' }
                            ].map((item, index) => (
                              <Box 
                                key={index} 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.05))',
                                    border: '1px solid rgba(0, 212, 255, 0.2)',
                                    transform: 'translateX(5px)'
                                  }
                                }}
                              >
                                <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>
                                  {item.icon}
                                </Typography>
                                <Typography sx={{ 
                                  color: 'rgba(255,255,255,0.85)', 
                                  fontSize: '0.95rem',
                                  fontWeight: 500
                                }}>
                                  {item.tip}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              <Box sx={{ mt: 8, mb: 6 }}>
                <Typography variant="h4" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  mb: 2,
                  background: 'linear-gradient(135deg, #ffffff 0%, #00d4ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Why Choose Our AI Shopping Agent?
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  textAlign: 'center', 
                  mb: 6,
                  fontSize: '1.1rem'
                }}>
                  Experience the future of online shopping with intelligent automation
                </Typography>

                <Grid container spacing={4}>
                  {[
                    {
                      icon: <AutoAwesome sx={{ fontSize: 40 }} />,
                      title: 'AI-Powered Search',
                      description: 'Our advanced AI understands your needs and finds the perfect products across multiple stores',
                      color: '#00d4ff',
                      gradient: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                    },
                    {
                      icon: <Speed sx={{ fontSize: 40 }} />,
                      title: 'Lightning Fast',
                      description: 'Get instant results from thousands of products in seconds, not hours of browsing',
                      color: '#4caf50',
                      gradient: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                    },
                    {
                      icon: <SavingsRounded sx={{ fontSize: 40 }} />,
                      title: 'Best Deals',
                      description: 'Automatically compares prices and finds the best deals to save you money',
                      color: '#ff9800',
                      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                    },
                    {
                      icon: <Security sx={{ fontSize: 40 }} />,
                      title: 'Secure & Reliable',
                      description: 'Your data is protected with enterprise-grade security and privacy measures',
                      color: '#e91e63',
                      gradient: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)'
                    }
                  ].map((feature, index) => (
                    <Grid item xs={12} sm={6} lg={3} key={index}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                        whileHover={{ y: -10, scale: 1.02 }}
                      >
                        <Card
                          sx={{
                            backdropFilter: 'blur(30px)',
                            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                            border: `2px solid ${feature.color}30`,
                            borderRadius: 4,
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              border: `2px solid ${feature.color}80`,
                              boxShadow: `0 20px 50px ${feature.color}20`,
                              '& .feature-icon': {
                                transform: 'rotate(10deg) scale(1.1)',
                              }
                            }
                          }}
                        >
                          <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Box 
                              className="feature-icon"
                              sx={{
                                background: feature.gradient,
                                borderRadius: '50%',
                                width: 80,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px auto',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: `0 8px 32px ${feature.color}40`
                              }}
                            >
                              {React.cloneElement(feature.icon, { 
                                sx: { color: 'white', fontSize: 40 }
                              })}
                            </Box>
                            <Typography variant="h6" sx={{ 
                              color: 'white', 
                              fontWeight: 'bold', 
                              mb: 2
                            }}>
                              {feature.title}
                            </Typography>
                            <Typography sx={{ 
                              color: 'rgba(255,255,255,0.7)', 
                              fontSize: '0.95rem',
                              lineHeight: 1.6
                            }}>
                              {feature.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          </Box>
        </Box>
      </div>
    );
  }

  // Results view (after search) - Full page layout
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
      
      <Box sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        {/* Header with Back Button */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 4,
          maxWidth: '1200px',
          mx: 'auto'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              onClick={handleNewSearch}
              startIcon={<SparklesIcon style={{ width: 20, height: 20 }} />}
              sx={{
                color: '#00d4ff',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                backdropFilter: 'blur(10px)',
                mr: 3,
                '&:hover': {
                  background: 'rgba(0, 212, 255, 0.2)',
                }
              }}
            >
              New Search
            </Button>
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                Search Results
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                AI-powered product recommendations based on your criteria
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Search Query Display */}
        <Box sx={{ 
          maxWidth: '1200px', 
          mx: 'auto', 
          mb: 4 
        }}>
          <Card
            sx={{
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                Current Search Query
              </Typography>
              <Typography variant="body1" sx={{ color: '#00d4ff', fontStyle: 'italic' }}>
                "{generatedQuery}"
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Content Area */}
        <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {/* Enhanced Loading States */}
          {isLoading && (
            <Box sx={{ mb: 4 }}>
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
            </Box>
          )}

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                sx={{
                  backdropFilter: 'blur(20px)',
                  background: 'rgba(255, 107, 107, 0.1)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  mb: 4
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#ff6b6b', fontWeight: 'bold', mb: 2 }}>
                    Search Error
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 107, 107, 0.8)', mb: 3 }}>
                    {error}
                  </Typography>
                  <Button
                    onClick={handleSearch}
                    variant="contained"
                    sx={{
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #cc5555 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #ff8a8a 0%, #ff6b6b 100%)',
                      }
                    }}
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Product Results */}
          {searchResults && !isLoading && (
            <ProductResults results={searchResults} />
          )}
        </Box>
      </Box>
    </div>
  );
}