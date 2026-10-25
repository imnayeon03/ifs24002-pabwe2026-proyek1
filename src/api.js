import axios from 'axios';
import toast from 'react-hot-toast';
import { config } from './config';
import { hardRedirect } from './utils/navigation';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/logout'];

const api = axios.create({
  baseURL: config.apiBaseUrl,
});

// Request Interceptor: Lampirkan JWT token (atau kirim cookie sesi pada mode cookie HttpOnly)
api.interceptors.request.use((reqConfig) => {
  if (config.useCookieAuth) {
    // Mode cookie HttpOnly: browser mengirim cookie sesi sendiri, tidak ada token di JavaScript.
    reqConfig.withCredentials = true;
    return reqConfig;
  }
  const token = localStorage.getItem('token');
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

// Response Interceptor: Tangani error global secara terpusat (misal 401 Unauthorized / Token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthAttempt = AUTH_ENDPOINTS.some((endpoint) => requestUrl.includes(endpoint));

      // Jika bukan saat mencoba login/register/logout, berarti sesi token telah habis
      if (!isAuthAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda telah berakhir. Silakan masuk kembali.');

        // Redirect ke login jika bukan di halaman login
        if (globalThis.window !== undefined && !globalThis.location.pathname.includes('/login')) {
          setTimeout(() => hardRedirect('/auth/login'), 800);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const errMsg = (error) => error?.response?.data?.error || 'Terjadi kesalahan, coba lagi';
export const rupiah = (amount) => 'Rp' + Number(amount).toLocaleString('id-ID');

export default api;
