import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-72.png', 'icon-96.png', 'icon-128.png', 'icon-144.png', 'icon-152.png', 'icon-192.png', 'icon-384.png', 'icon-512.png', 'screenshot-1.png', 'screenshot-2.png'],
      manifest: {
        name: 'Pueblo Click',
        short_name: 'PuebloClick',
        description: 'Mandaditos rápidos y confiables en Juigalpa, Chontales',
        theme_color: '#FF6B35',
        background_color: '#F9FAFB',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        categories: ['lifestyle', 'productivity', 'transport'],
        dir: 'ltr',
        icons: [
          { src: 'icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        screenshots: [
          {
            src: 'screenshot-1.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Pantalla de inicio'
          },
          {
            src: 'screenshot-2.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Mis órdenes'
          }
        ],
        shortcuts: [
          {
            name: 'Mis Órdenes',
            short_name: 'Órdenes',
            description: 'Ver mis órdenes activas',
            url: '/client/orders',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }]
          },
          {
            name: 'Nuevo Mandado',
            short_name: 'Nuevo',
            description: 'Crear un nuevo mandado',
            url: '/client/create-order',
            icons: [{ src: 'icon-96.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pueblo-click-backend\.onrender\.com\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/cdn-icons-png\.flaticon\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://pueblo-click-backend.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['react-icons'],
          maps: ['leaflet', 'react-leaflet']
        }
      }
    }
  }
});