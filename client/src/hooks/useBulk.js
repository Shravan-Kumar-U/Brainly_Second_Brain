import { useMutation, useQueryClient } from '@tanstack/react-query';

import { bulkApi } from '@/api/bulk.api';
import { useToast } from './useToast';

const plural = (count) => `${count} item${count === 1 ? '' : 's'}`;

const MESSAGES = {
  complete: (n) => `${plural(n)} marked as done`,
  archive: (n) => `${plural(n)} archived`,
  restore: (n) => `${plural(n)} moved back to your inbox`,
  delete: (n) => `${plural(n)} deleted`,
  schedule: (n) => `${plural(n)} rescheduled`,
  tag: (n) => `Tags added to ${plural(n)}`,
  move: (n) => `${plural(n)} moved`,
};

export function useBulkAction() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: bulkApi.run,
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['items'] });

      if (result.modified === 0) toast.info('Nothing needed changing');
      else toast.success(MESSAGES[variables.action](result.modified));
    },
    onError: (error) => toast.error(error.message),
  });
}