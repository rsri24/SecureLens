import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/scan': 'http://localhost:3000',
      '/usage': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/me': 'http://localhost:3000',
    },
  },
});
