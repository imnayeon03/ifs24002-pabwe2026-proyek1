import axios from 'axios';
import toast from 'react-hot-toast';
import { config } from './config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
});

// Request Interceptor: Lampirkan JWT token jika tersedia
api.interceptors.request.use((reqConfig) => {
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
      const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      // Jika bukan saat mencoba login/register, berarti sesi token telah habis
      if (!isAuthAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda telah berakhir. Silakan masuk kembali.');

        // Redirect ke login jika bukan di halaman login
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 800);
        }
      }
    }
    return Promise.reject(error);
  }
);

export const errMsg = (e) => e?.response?.data?.error || 'Terjadi kesalahan, coba lagi';
export const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

export default api;
