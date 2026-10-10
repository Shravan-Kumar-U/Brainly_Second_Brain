import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { itemsApi } from '@/api/items.api';
import { useToast } from './useToast';

const POLL_MS = 3000;
const FRESH_MS = 60_000;

export const itemKeys = {
  all: ['items'],
  list: (params) => ['items', 'list', params],
  infinite: (params) => ['items', 'infinite', params],
  tags: ['items', 'tags'],
};

// True only for items saved in the last minute whose details are still loading.
// Older "pending" items (saved before Phase 4) will never complete, so we don't wait for them.
export const isEnriching = (item) =>
  item.metadataStatus === 'pending' && Date.now() - new Date(item.createdAt).getTime() < FRESH_MS;

export function useItemList(params) {
  return useQuery({
    queryKey: itemKeys.list(params),
    queryFn: () => itemsApi.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) => (query.state.data?.items.some(isEnriching) ? POLL_MS : false),
  });
}

export function useInfiniteItems(params) {
  return useInfiniteQuery({
    queryKey: itemKeys.infinite(params),
    queryFn: ({ pageParam }) => itemsApi.list({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.hasNext ? last.meta.page + 1 : undefined),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) => page.items.some(isEnriching)) ? POLL_MS : false,
  });
}

export function useTags() {
  return useQuery({
    queryKey: itemKeys.tags,
    queryFn: itemsApi.tags,
    staleTime: 60_000,
  });
}

export function useLinkPreview(url) {
  return useQuery({
    queryKey: ['preview', url],
    queryFn: () => itemsApi.preview(url),
    enabled: Boolean(url),
    staleTime: 10 * 60_000,
    retry: false,
  });
}

function useItemMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // The Add page shows errors inline, so no error toast here
  return useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success('Saved to Brainly');
    },
  });
}

export function useItemActions() {
  return {
    complete: useItemMutation((id) => itemsApi.complete(id), 'Marked as done'),
    snooze: useItemMutation(({ id, minutes }) => itemsApi.snooze(id, minutes), 'Snoozed'),
    update: useItemMutation(({ id, data }) => itemsApi.update(id, data), 'Reminder updated'),
    archive: useItemMutation((id) => itemsApi.archive(id), 'Archived'),
    restore: useItemMutation((id) => itemsApi.restore(id), 'Moved back to your inbox'),
    remove: useItemMutation((id) => itemsApi.remove(id), 'Deleted'),
    refresh: useItemMutation((id) => itemsApi.refreshMetadata(id), 'Details refreshed'),
  };
}