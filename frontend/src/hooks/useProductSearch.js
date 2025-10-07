import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export function useProductSearch() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStage, setCurrentStage] = useState('');
  const [progress, setProgress] = useState(0);
  const [queryId, setQueryId] = useState(null);

  const searchProducts = useCallback(async (searchRequest) => {
    setIsLoading(true);
    setError(null);
    setCurrentStage('Initializing search...');
    setProgress(0);
    setData(null);

    try {
      // Check for demo mode
      const isDemoMode = localStorage.getItem('demoMode') === 'true';
      
      let authToken = null;
      if (!isDemoMode) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Authentication required');
        }
        authToken = session.access_token;
      }

      // Start the search
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch('http://localhost:8000/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          // Ignore JSON parsing errors
        }
        
        // If auth fails, try demo mode
        if (response.status === 401 && !isDemoMode) {
          localStorage.setItem('demoMode', 'true');
          throw new Error('Authentication failed. Please refresh and try demo mode.');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Search initiated:', result);
      const searchQueryId = result.query_id;
      setQueryId(searchQueryId);

      // Poll for status updates
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max
      
      const pollStatus = async () => {
        try {
          const statusHeaders = {};
          if (authToken) {
            statusHeaders['Authorization'] = `Bearer ${authToken}`;
          }

          const statusResponse = await fetch(
            `http://localhost:8000/api/search/${searchQueryId}/status`,
            { headers: statusHeaders }
          );

          if (!statusResponse.ok) {
            throw new Error('Failed to get search status');
          }

          const status = await statusResponse.json();
          console.log('Search status:', status);
          
          // Update current stage and progress
          setCurrentStage(status.current_stage || 'Processing...');
          setProgress(status.progress || 0);

          if (status.status === 'completed') {
            // Get the results
            const resultsHeaders = {};
            if (authToken) {
              resultsHeaders['Authorization'] = `Bearer ${authToken}`;
            }

            const resultsResponse = await fetch(
              `http://localhost:8000/api/search/${searchQueryId}/results`,
              { headers: resultsHeaders }
            );

            if (!resultsResponse.ok) {
              throw new Error('Failed to get search results');
            }

            const resultsData = await resultsResponse.json();
            console.log('Search results received:', resultsData);
            setData(resultsData);
            setIsLoading(false);
            setCurrentStage('Search completed');
            setProgress(100);
            return;
          } else if (status.status === 'failed') {
            throw new Error(status.error_message || 'Search failed');
          } else if (status.status === 'processing' || status.status === 'pending') {
            // Continue polling
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollStatus, 2000); // Poll every 2 seconds
            } else {
              throw new Error('Search timeout - please try again');
            }
          }
        } catch (pollError) {
          setError(pollError.message);
          setIsLoading(false);
        }
      };

      // Start polling
      setTimeout(pollStatus, 1000); // Start polling after 1 second

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      setCurrentStage('');
    }
  }, []);

  const searchProductsLegacy = useCallback(async (prompt, numProducts = 5) => {
    setIsLoading(true);
    setError(null);
    setCurrentStage('Searching products...');
    setData(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:8000/api/search/legacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt,
          num_products: numProducts,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Convert legacy format to new format
      const convertedResult = {
        query_id: 'legacy',
        results: result.results?.map(product => ({
          name: product.product_name,
          price: product.current_price,
          image_url: product.image_url,
          source_url: product.product_url,
          specifications: product.key_specifications,
        })) || [],
        total_found: result.results?.length || 0,
        search_timestamp: new Date().toISOString(),
      };

      setData(convertedResult);
      setCurrentStage('Completed');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    data,
    isLoading,
    error,
    currentStage,
    progress,
    queryId,
    searchProducts,
    searchProductsLegacy,
  };
}