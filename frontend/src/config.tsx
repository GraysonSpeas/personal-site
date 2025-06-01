export const API_BASE = import.meta.env.DEV
  ? '/auth' // Vite dev proxy target (only in dev)
  : 'https://auth-worker.speas.org/auth'; // Your deployed Worker backend