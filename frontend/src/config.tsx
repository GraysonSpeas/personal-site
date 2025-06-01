export const API_BASE = import.meta.env.DEV
  ? '/auth' // Proxy in dev (Vite will forward this to your worker)
  : 'https://auth-worker.rfspeas.workers.dev'; // Replace with your live Worker URL