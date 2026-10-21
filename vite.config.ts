import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dashboard is a single-page app served from the repository root.
// Remotion has its own bundler (see remotion.config.ts) and never touches this config.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
  build: {
    outDir: 'dist',
    // Keep sourcemaps out of the public bundle that Cloudflare serves.
    sourcemap: false,
    target: 'es2022',
  },
});
