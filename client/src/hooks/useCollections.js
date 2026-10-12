import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { collectionsApi } from '@/api/collections.api';
import { useToast } from './useToast';

// Under ['items', ...] on purpose: every item mutation already refreshes ['items'],
// so collection counts stay correct with no extra code.
export const collectionKeys = { list: ['items', 'collections'] };

export function useCollections() {
  return useQuery({
    queryKey: collectionKeys.list,
    queryFn: collectionsApi.list,
    staleTime: 30_000,
  });
}

function useCollectionMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      if (successMessage) toast.success(successMessage);
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCollectionActions() {
  return {
    create: useCollectionMutation(collectionsApi.create, 'Collection created'),
    update: useCollectionMutation(({ id, data }) => collectionsApi.update(id, data), 'Collection updated'),
    remove: useCollectionMutation(collectionsApi.remove, 'Collection deleted'),
    share: useCollectionMutation(collectionsApi.enableShare, 'Share link ready'),
    regenerate: useCollectionMutation(
      collectionsApi.regenerateShare,
      'New link created. The old one no longer works'
    ),
    unshare: useCollectionMutation(collectionsApi.disableShare, 'Sharing stopped'),
  };
}