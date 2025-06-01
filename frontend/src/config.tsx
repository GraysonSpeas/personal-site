export const API_BASE = import.meta.env.DEV
  ? '/auth' // Proxy in dev (Vite will forward this to your worker)
  : 'https://0a03f05b-auth-worker.rfspeas.workers.dev/'; // Replace with your live Worker URL