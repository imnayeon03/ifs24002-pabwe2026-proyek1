import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});
export const errMsg = (e) => e?.response?.data?.error || 'Terjadi kesalahan, coba lagi';
export const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');
export default api;
