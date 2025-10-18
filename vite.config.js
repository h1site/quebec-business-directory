import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    commonjsOptions: {
      include: [/react-helmet-async/, /node_modules/]
    }
  },
  optimizeDeps: {
    include: ['react-helmet-async']
  }
});
