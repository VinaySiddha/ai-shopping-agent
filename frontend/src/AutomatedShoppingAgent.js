import React, { useState, useEffect } from 'react';
import axios from 'axios'; // npm install axios

// Embedded CSS for animations and media queries
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  /* Responsive adjustments for smaller screens (mimicking Tailwind's sm breakpoint) */
  @media (max-width: 640px) {
    .main-container {
      padding: 1rem; /* p-4 */
    }
    .content-wrapper {
      padding: 1.5rem; /* p-6 */
    }
    .heading-primary {
      font-size: 1.875rem; /* text-3xl */
      margin-bottom: 1.5rem; /* mb-6 */
    }
    .input-label {
      font-size: 1rem; /* text-base */
    }
    .action-panel {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem; /* space-y-4 */
    }
    .action-button {
      width: 100%;
    }
    .product-card {
      flex-direction: column;
      padding: 1rem;
    }
    .product-image-wrapper {
      width: 100%;
      height: 12rem; /* h-48 */
      margin-bottom: 1rem;
      margin-right: 0;
    }
    .product-name {
      font-size: 1.25rem; /* text-xl */
    }
    .product-price {
      font-size: 1.125rem; /* text-lg */
    }
  }

  /* Responsive adjustments for medium screens (mimicking Tailwind's md breakpoint) */
  @media (min-width: 641px) and (max-width: 768px) {
    .content-wrapper {
      padding: 2rem; /* p-8 */
    }
    .heading-primary {
      font-size: 2.25rem; /* text-4xl */
    }
    .action-panel {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1rem; /* sm:space-x-4 */
    }
  }

  /* Specific hover effects */
  .action-button:hover {
    background-color: #2563eb; /* hover:bg-blue-700 */
    transform: scale(1.05); /* hover:scale-105 */
  }
  .product-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* hover:shadow-lg */
  }
  .view-product-button:hover {
    background-color: #15803d; /* hover:bg-green-700 */
  }
`;

// --- Main React Component ---
const AutomatedShoppingAgent = ({ session }) => {
  const [productPrompt, setProductPrompt] = useState(
    "Looking for a 15-inch laptop with at least 16GB RAM, an i7 processor, and a budget of under $1500."
  );
  const [numberOfProducts, setNumberOfProducts] = useState(3);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = windowWidth <= 640;

  const handleSearch = async () => {
    // Basic validation to ensure the user is logged in
    if (!session || !session.access_token) {
      setError("Authentication failed. Please log in to perform a search.");
      return;
    }

    setLoading(true);
    setResults([]);
    setError(null);

    try {
      // Use a consistent backend URL variable
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      const response = await axios.post(
        `${backendUrl}/api/search`,
        {
          prompt: productPrompt,
          num_products: numberOfProducts,
        },
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.results && response.data.results.length > 0) {
        setResults(response.data.results);
      } else {
        // Handle case where no products are returned successfully
        setError("No products found matching your criteria. Try adjusting your request.");
      }
    } catch (err) {
      // More specific error handling for Axios errors
      const errorMessage = err.response?.data?.detail || err.message || "An unexpected error occurred.";
      console.error("Error during product search:", errorMessage);
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 5rem)',
      backgroundColor: '#f3f4f6',
      padding: '2rem',
      fontFamily: 'sans-serif'
    }} className="main-container">
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />

      <div style={{
        maxWidth: '64rem',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderRadius: '0.75rem',
        padding: '2rem'
      }} className="content-wrapper">
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: '800',
          color: '#111827',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }} className="heading-primary">
          Automated Shopping Agent
        </h1>

        {/* Input Section */}
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="productPrompt" style={{
            display: 'block',
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }} className="input-label">
            Tell me what you're looking for:
          </label>
          <textarea
            id="productPrompt"
            style={{
              width: '100%',
              padding: '1rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              outline: 'none',
              transition: 'all 0.2s ease-in-out',
              resize: 'vertical',
              minHeight: '120px',
              fontSize: '1rem',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
            placeholder="e.g., Looking for a 15-inch laptop with at least 16GB RAM, an i7 processor, and a budget of under $1500."
            value={productPrompt}
            onChange={(e) => setProductPrompt(e.target.value)}
            rows="4"
          ></textarea>
        </div>

        {/* Control Panel */}
        <div style={{
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: isSmallScreen ? 'stretch' : 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          gap: isSmallScreen ? '1rem' : '1rem'
        }} className="action-panel">
          <div style={{
            width: isSmallScreen ? '100%' : 'auto',
            flexGrow: isSmallScreen ? '0' : '1',
          }}>
            <label htmlFor="numProducts" style={{
              display: 'block',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Number of Top Products:
            </label>
            <select
              id="numProducts"
              style={{
                width: isSmallScreen ? '100%' : '8rem',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                outline: 'none',
                transition: 'all 0.2s ease-in-out',
                fontSize: '1rem',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
              value={numberOfProducts}
              onChange={(e) => setNumberOfProducts(parseInt(e.target.value, 10))}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            style={{
              width: isSmallScreen ? '100%' : 'auto',
              padding: '0.75rem 2rem',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontWeight: 'bold',
              fontSize: '1.125rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              outline: 'none',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease-in-out',
              opacity: loading ? '0.5' : '1',
            }}
            className="action-button"
            disabled={loading}
            onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = '#2563eb'; e.target.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = '#3b82f6'; e.target.style.transform = 'scale(1)'; }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg className="spinner" style={{
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.75rem',
                  height: '1.25rem',
                  width: '1.25rem',
                  color: '#ffffff',
                }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching for products...
              </span>
            ) : (
              'Find Best Products'
            )}
          </button>
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div style={{
            textAlign: 'center',
            color: '#2563eb',
            fontSize: '1.25rem',
            fontWeight: '500',
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#eff6ff',
            borderRadius: '0.5rem',
            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
          }}>
            Searching for products... This may take a moment.
          </div>
        )}

        {error && !loading && (
          <div style={{
            textAlign: 'center',
            color: '#ef4444',
            fontSize: '1.125rem',
            fontWeight: '500',
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#fee2e2',
            borderRadius: '0.5rem',
            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
          }}>
            Error: {error}
          </div>
        )}

        {/* Output Display */}
        {!loading && !error && results.length > 0 && (
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              Top {results.length} Products Found:
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {results.map((product) => (
                <div key={product.product_url} style={{
                  display: 'flex',
                  flexDirection: isSmallScreen ? 'column' : 'row',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease-in-out',
                  padding: isSmallScreen ? '1rem' : '1.5rem',
                }} className="product-card"
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)'}
                >
                  <div style={{
                    flexShrink: '0',
                    width: isSmallScreen ? '100%' : '12rem',
                    height: isSmallScreen ? '12rem' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '0.375rem',
                    overflow: 'hidden',
                    marginBottom: isSmallScreen ? '1rem' : '0',
                    marginRight: isSmallScreen ? '0' : '1.5rem',
                  }} className="product-image-wrapper">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={product.product_name}
                      style={{
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                        padding: '0.5rem',
                      }}
                    />
                  </div>
                  <div style={{ flexGrow: '1' }}>
                    <h3 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '0.5rem',
                    }} className="product-name">
                      {product.product_name}
                    </h3>
                    <p style={{
                      color: '#1d4ed8',
                      fontWeight: 'bold',
                      fontSize: '1.25rem',
                      marginBottom: '0.75rem',
                    }} className="product-price">
                      ${(product.current_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p style={{
                      color: '#374151',
                      fontSize: '1rem',
                      marginBottom: '1rem',
                      fontStyle: 'italic',
                    }}>
                      {product.summary}
                    </p>
                    {product.key_specifications && product.key_specifications.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{
                          fontWeight: '600',
                          color: '#1f2937',
                          marginBottom: '0.5rem',
                        }}>Key Specifications Matched:</h4>
                        <ul style={{
                          listStyleType: 'disc',
                          marginLeft: '1.25rem',
                          color: '#4b5563',
                          fontSize: '0.875rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          {product.key_specifications.map((spec, index) => (
                            <li key={index}>{spec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a
                      href={product.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '0.625rem 1.25rem',
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        fontWeight: '600',
                        borderRadius: '0.375rem',
                        outline: 'none',
                        border: 'none',
                        transition: 'all 0.2s ease-in-out',
                        fontSize: '1rem',
                        textDecoration: 'none',
                      }}
                      className="view-product-button"
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#15803d'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#16a34a'}
                    >
                      View Product
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!loading && !error && results.length === 0 && (
          <div style={{
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center',
            color: '#4b5563',
            fontSize: '1.125rem',
            padding: '1rem',
            backgroundColor: '#fffbeb',
            borderRadius: '0.5rem',
            boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)'
          }}>
            No products found matching your criteria. Try adjusting your request or budget.
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomatedShoppingAgent;