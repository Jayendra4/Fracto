/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'bundle-report.html',
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('swiper')) return 'swiper';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('gsap')) return 'gsap';
            if (id.includes('firebase')) return 'firebase';
            if (id.includes('recharts')) return 'recharts';
            if (id.includes('react-google-maps')) return 'google-maps';
            return 'vendor';
          }
        },
      },
    },
  },

  define: {
    __VITE_FIREBASE_API_KEY__: JSON.stringify(
      process.env.VITE_FIREBASE_API_KEY
    ),
    __VITE_FIREBASE_AUTH_DOMAIN__: JSON.stringify(
      process.env.VITE_FIREBASE_AUTH_DOMAIN
    ),
    __VITE_FIREBASE_PROJECT_ID__: JSON.stringify(
      process.env.VITE_FIREBASE_PROJECT_ID
    ),
    __VITE_FIREBASE_MESSAGING_SENDER_ID__: JSON.stringify(
      process.env.VITE_FIREBASE_MESSAGING_SENDER_ID
    ),
    __VITE_FIREBASE_APP_ID__: JSON.stringify(process.env.VITE_FIREBASE_APP_ID),
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
  },
});
