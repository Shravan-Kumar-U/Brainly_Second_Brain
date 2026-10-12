let deferredPrompt = null;
const listeners = new Set();
const emit = () => listeners.forEach((listener) => listener());

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); // keep it, so we can show our own button instead of the browser's
  deferredPrompt = event;
  emit();
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  emit();
});

export const installPrompt = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot: () => deferredPrompt,

  async open() {
    if (!deferredPrompt) return 'unavailable';

    const event = deferredPrompt;
    await event.prompt();
    const { outcome } = await event.userChoice;

    deferredPrompt = null; // the browser allows each prompt to be used only once
    emit();
    return outcome;
  },
};