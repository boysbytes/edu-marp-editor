import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  // Security: Removed client-side environment variable exposure
  // API keys should never be exposed to the client-side code
  // If API functionality is needed, implement server-side endpoints
});
