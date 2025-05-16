import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA }    from 'vite-plugin-pwa';

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [
    sveltekit(),
    VitePWA({
      filename: 'sw.js',
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'Spelling Tutor',
        short_name: 'Spelling',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0d6efd',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst'
          },
          {
            urlPattern: ({ request }) =>
              ['script','style','image','font'].includes(request.destination),
            handler: 'CacheFirst'
          }
        ]
      }
    })
  ]
};

export default config;
