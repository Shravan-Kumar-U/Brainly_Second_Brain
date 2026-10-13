import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { windowsApi } from '@/api/windows.api';
import { useToast } from './useToast';

export function useWatchWindows() {
  return useQuery({ queryKey: ['windows', 'list'], queryFn: windowsApi.list, staleTime: 60_000 });
}

// Suggestions depend on the current time, so they are kept fresh for only a short while
export function useWindowSuggestions(minutes) {
  return useQuery({
    queryKey: ['windows', 'suggest', minutes ?? 'any'],
    queryFn: () => windowsApi.suggest(minutes),
    staleTime: 30_000,
    retry: false,
  });
}

function useWindowMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['windows'] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useWindowActions() {
  return {
    create: useWindowMutation(windowsApi.create, 'Watch window added'),
    update: useWindowMutation(({ id, data }) => windowsApi.update(id, data), 'Watch window updated'),
    remove: useWindowMutation(windowsApi.remove, 'Watch window deleted'),
  };
}