import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import cloudflare from '@astrojs/cloudflare' // ✅

export default defineConfig({
  output: 'server', // ✅ required for SSR on Cloudflare
  adapter: cloudflare(), // ✅ set the adapter
  integrations: [react(), tailwind()],
  vite: {
    server: {
      proxy: {
        '/auth': 'http://127.0.0.1:8787', // API proxy
      },
    },
  },
})