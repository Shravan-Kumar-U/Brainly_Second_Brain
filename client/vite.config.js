import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest', // we write src/sw.js ourselves
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt', // the user decides when to update
      injectRegister: false, // registration happens in <PwaUpdatePrompt />
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ico}'],
      },
      manifest: {
        id: '/',
        name: 'Brainly',
        short_name: 'Brainly',
        description: 'Your second brain. Save now, remember later.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f6f7fb',
        theme_color: '#ffffff',
        categories: ['productivity', 'lifestyle'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        // Long-press the app icon on Android for these
        shortcuts: [
          {
            name: 'Save a link',
            short_name: 'Save',
            url: '/add',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'Library',
            url: '/library',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        // Puts Brainly in Android's Share menu
        share_target: {
          action: '/add',
          method: 'GET',
          params: { title: 'title', text: 'text', url: 'url' },
        },
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // strictPort: if a port is busy, fail loudly. The server's CORS list names these ports.
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
});