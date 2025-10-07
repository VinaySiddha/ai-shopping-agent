// src/hooks/useSearchStatus.js
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useSearchStatus(queryId, enabled = true) {
  return useQuery({
    queryKey: ['search-status', queryId],
    queryFn: async () => {
      if (!queryId) return null;
      const { data } = await api.get(`/api/search/${queryId}`);
      return data;
    },
    enabled: !!queryId && enabled,
    refetchInterval: (data) => {
      // Stop polling if completed, failed, or no data
      if (!data || data.status === 'completed' || data.status === 'failed') {
        return false;
      }
      return 2500; // Poll every 2.5 seconds while pending
    },
    refetchIntervalInBackground: false,
    staleTime: 0, // Always consider data stale for real-time updates
  });
}