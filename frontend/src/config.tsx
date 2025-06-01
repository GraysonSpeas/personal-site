export const API_BASE = import.meta.env.DEV
  ? '/auth' // Proxy in dev (Vite will forward this to your worker)
  : 'auth-worker.speas.org'; // Replace with your live Worker URL