// src/components/ShoppingAgent.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProductSearch } from '../hooks/useProductSearch';
import { useSearchStatus } from '../hooks/useSearchStatus';
import { SearchForm } from './SearchForm';
import { SearchResults } from './SearchResults';
import toast from 'react-hot-toast';

export function ShoppingAgent() {
  const [currentSearch, setCurrentSearch] = useState('');
  const [queryId, setQueryId] = useState(null);
  const [results, setResults] = useState([]);

  const searchMutation = useProductSearch();
  const { data: searchStatus } = useSearchStatus(queryId);

  const handleSearch = async ({ prompt, num_products }) => {
    setCurrentSearch(prompt);
    setResults([]);
    setQueryId(null);

    try {
      const response = await searchMutation.mutateAsync({ 
        prompt, 
        num_products 
      });

      if (response.query_id) {
        setQueryId(response.query_id);
        toast.success('Search started! AI is analyzing your request...');
      } else if (response.results?.length) {
        setResults(response.results);
        toast.success(`Found ${response.results.length} products!`);
      } else {
        toast.error('No products found. Try a different search.');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error(error.response?.data?.detail || 'Search failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <SearchForm
          onSearch={handleSearch}
          isLoading={searchMutation.isPending}
          currentSearch={currentSearch}
        />

        <SearchResults
          results={results}
          isLoading={searchMutation.isPending}
          error={searchMutation.error?.response?.data?.detail || searchMutation.error?.message}
          searchStatus={searchStatus}
          queryId={queryId}
        />
      </div>
    </div>
  );
}