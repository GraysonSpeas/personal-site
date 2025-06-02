export const API_BASE = import.meta.env.DEV
  ? '/api' // dev proxy (to local Worker)
  : 'https://auth-worker.speas.org'; // production Worker URL