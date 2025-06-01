// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    mode: 'advanced', // ✅ disables the SESSION warning
  }),
  integrations: [react(), tailwind()],
  vite: {
    server: {
      proxy: {
        '/auth': 'http://127.0.0.1:8787', // ✅ Worker proxy
      },
    },
  },
});