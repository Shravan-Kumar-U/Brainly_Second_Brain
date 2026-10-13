import { useCallback, useState } from 'react';

import { useToast } from './useToast';

const MAX_SELECTION = 100; // the server's limit per bulk request

export function useSelection() {
  const toast = useToast();
  const [selected, setSelected] = useState(() => new Set());

  const toggle = (id) => {
    if (!selected.has(id) && selected.size >= MAX_SELECTION) {
      toast.info(`You can select up to ${MAX_SELECTION} items at a time`);
      return;
    }

    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectMany = (ids) => {
    if (ids.length > MAX_SELECTION) toast.info(`Selected the first ${MAX_SELECTION} items`);
    setSelected(new Set(ids.slice(0, MAX_SELECTION)));
  };

  // Stable, and a no-op when already empty, so it is safe inside an effect
  const clear = useCallback(() => {
    setSelected((previous) => (previous.size === 0 ? previous : new Set()));
  }, []);

  return { selected, toggle, selectMany, clear };
}