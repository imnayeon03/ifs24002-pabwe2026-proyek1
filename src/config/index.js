/**
 * Konfigurasi terpusat aplikasi DelFood.
 * Memisahkan dan memvalidasi environment variable agar lebih aman dan mudah dikelola.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  appName: import.meta.env.VITE_APP_NAME || 'DelFood',
  pollInterval: Number(import.meta.env.VITE_POLL_INTERVAL) || 5000,
  isDev: Boolean(import.meta.env.DEV),
  isProd: Boolean(import.meta.env.PROD),
};
