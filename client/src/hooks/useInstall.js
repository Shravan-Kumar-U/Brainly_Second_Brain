import { useSyncExternalStore } from 'react';

import { installPrompt } from '@/lib/installPrompt';
import { isIos, isStandalone } from '@/lib/platform';

export function useInstall() {
  const event = useSyncExternalStore(installPrompt.subscribe, installPrompt.getSnapshot, () => null);
  const standalone = isStandalone();

  return {
    canInstall: Boolean(event) && !standalone,
    // iPhones can't show an install prompt, so we explain the manual steps
    showIosGuide: isIos() && !standalone,
    install: installPrompt.open,
  };
}