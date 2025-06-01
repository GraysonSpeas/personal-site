import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind()],
  vite: {
    server: {
      proxy: {
        '/auth': 'http://127.0.0.1:8787', // still useful for local dev
      },
    },
  },
});