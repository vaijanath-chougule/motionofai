import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Manual chunking keeps the heavy 3D + animation libs out of the initial bundle
// so the hero paints fast (Lighthouse) while Three.js loads on demand.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
            if (id.includes('gsap')) return 'gsap-vendor';
            if (id.includes('lenis')) return 'lenis-vendor';
            if (id.includes('react-router')) return 'router-vendor';
            if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
          }
        },
      },
    },
  },
  server: {
    host: true,
  },
});
