/**
 * Konfigurasi terpusat aplikasi DelFood.
 * Memisahkan dan memvalidasi environment variable agar lebih aman dan mudah dikelola.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  appName: import.meta.env.VITE_APP_NAME || 'DelFood',
  pollInterval: Number(import.meta.env.VITE_POLL_INTERVAL) || 5000,
  // true  : sesi memakai cookie HttpOnly dari back-end (token tidak disimpan di JavaScript).
  // false : sesi memakai token JWT di localStorage (default). Lihat komentar di auth.jsx.
  useCookieAuth: import.meta.env.VITE_USE_COOKIE_AUTH === 'true',
  isDev: Boolean(import.meta.env.DEV),
  isProd: Boolean(import.meta.env.PROD),
};
