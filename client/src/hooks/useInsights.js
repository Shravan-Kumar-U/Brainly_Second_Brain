import { useQuery } from '@tanstack/react-query';

import { insightsApi } from '@/api/insights.api';

// Lives under ['items', ...] on purpose: every item mutation already invalidates
// ['items'], so these numbers refresh themselves after Done, Archive, Delete, etc.
export function useInsights() {
  return useQuery({
    queryKey: ['items', 'insights'],
    queryFn: insightsApi.get,
    staleTime: 15_000,
  });
}