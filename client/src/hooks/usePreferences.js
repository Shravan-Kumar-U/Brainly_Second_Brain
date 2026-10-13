import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { preferencesApi } from '@/api/preferences.api';
import { useToast } from './useToast';

export function usePreferences() {
  return useQuery({ queryKey: ['preferences'], queryFn: preferencesApi.get, staleTime: 60_000 });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: preferencesApi.update,
    onSuccess: (preferences, variables) => {
      queryClient.setQueryData(['preferences'], preferences);

      // A new timezone changes what "today" means for Insights and for watch windows
      if (variables.timezone) {
        queryClient.invalidateQueries({ queryKey: ['items'] });
        queryClient.invalidateQueries({ queryKey: ['windows'] });
      }
      toast.success('Saved');
    },
    onError: (error) => toast.error(error.message),
  });
}