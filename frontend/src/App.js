// src/App.js
import React, { useState, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { supabase } from './supabaseClient';
import MaterialAuth from './components/MaterialAuth';
import { FilteredShoppingAgent } from './components/FilteredShoppingAgent';
import { Header } from './components/Header';
import { SearchHistory } from './components/SearchHistory';
import { Wishlist } from './components/Wishlist';
import { FeedbackSystem } from './components/FeedbackSystem';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Create Material-UI theme with dark glass effect
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#4de0ff',
      dark: '#0099cc',
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9999',
      dark: '#cc5555',
    },
    background: {
      default: '#05070a',
      paper: 'rgba(255, 255, 255, 0.05)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Cabinet Grotesk", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #05070a 0%, #0a0f1c 50%, #05070a 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 32px',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(30px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4de0ff 0%, #00d4ff 100%)',
            boxShadow: '0 12px 40px rgba(0, 212, 255, 0.4)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backdropFilter: 'blur(20px)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            '&.Mui-focused': {
              border: '1px solid #00d4ff',
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

function AppContent() {
  const [currentView, setCurrentView] = useState('search'); // 'search', 'history', 'recommendations', 'wishlist'
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  
  // Use AuthContext for session management
  const { session, loading, user, demoMode } = useAuth();

  // Remove the demo mode useEffect since it's now handled in AuthContext

  const handleShowHistory = () => {
    setCurrentView('history');
  };

  const handleShowWishlist = () => {
    setShowWishlist(true);
  };

  const handleShowRecommendations = () => {
    setCurrentView('recommendations');
  };

  const handleShowFeedback = (searchResults, searchQuery, searchId) => {
    setFeedbackData({ searchResults, searchQuery, searchId });
    setShowFeedback(true);
  };

  const handleBackToSearch = () => {
    setCurrentView('search');
    setSelectedSearch(null);
  };

  const handleSelectSearch = (searchData) => {
    setSelectedSearch(searchData);
    setCurrentView('search');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #05070a 0%, #0a0f1c 50%, #05070a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '3px solid rgba(0, 212, 255, 0.3)',
          borderTop: '3px solid #00d4ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!session && !demoMode) {
    return (
      <>
        <MaterialAuth />
        
        {/* Demo Mode Option */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => {
              localStorage.setItem('demoMode', 'true');
              window.location.reload(); // Reload to trigger AuthContext demo mode
            }}
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '50px',
              fontSize: '14px',
              fontWeight: '600',
              boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)',
              border: 'none',
              cursor: 'pointer',
              backdropFilter: 'blur(20px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 40px rgba(255, 107, 107, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(255, 107, 107, 0.3)';
            }}
          >
            Try Demo Mode
          </button>
        </div>
        
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #05070a 0%, #0a0f1c 50%, #05070a 100%)',
        color: 'white'
      }}>
        <Header 
          user={user || { email: 'demo@example.com' }}
          onShowHistory={handleShowHistory}
          onShowWishlist={handleShowWishlist}
          onShowRecommendations={handleShowRecommendations}
        />
        
        <div className="container mx-auto px-4 py-8">
          {currentView === 'search' && (
            <FilteredShoppingAgent 
              selectedSearch={selectedSearch}
              onBackToSearch={handleBackToSearch}
            />
          )}
          
          {currentView === 'history' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToSearch}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#00d4ff',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ← Back to Search
                </button>
              </div>
              <SearchHistory onSelectSearch={handleSelectSearch} />
            </div>
          )}
          
          {currentView === 'recommendations' && (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToSearch}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#00d4ff',
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(0, 212, 255, 0.1)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ← Back to Search
                </button>
              </div>
              <SearchHistory onSelectSearch={handleSelectSearch} />
            </div>
          )}
        </div>

        {/* Wishlist Modal */}
        <Wishlist 
          isOpen={showWishlist}
          onClose={() => setShowWishlist(false)}
        />

        {/* Feedback Modal */}
        {feedbackData && (
          <FeedbackSystem
            isOpen={showFeedback}
            onClose={() => {
              setShowFeedback(false);
              setFeedbackData(null);
            }}
            searchResults={feedbackData.searchResults}
            searchQuery={feedbackData.searchQuery}
            searchId={feedbackData.searchId}
          />
        )}
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
