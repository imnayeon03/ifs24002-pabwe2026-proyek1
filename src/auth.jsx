import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import api from './api';
import { config } from './config';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/**
 * KEAMANAN SESI
 *
 * Mode default: token JWT disimpan di localStorage.
 *   Risiko : skrip apa pun yang berjalan di halaman (mis. lewat XSS atau dependensi yang
 *            disusupi) dapat membaca token. localStorage tidak dilindungi dari JavaScript.
 *   Mitigasi di front-end: React meng-escape semua teks, tidak ada `dangerouslySetInnerHTML`,
 *            dan interceptor 401 (api.js) menghapus sesi begitu server menolak token.
 *
 * Mode cookie HttpOnly (opsional): set `VITE_USE_COOKIE_AUTH=true`.
 *   Token tidak pernah disimpan di JavaScript; browser mengirim cookie sesi sendiri
 *   (`withCredentials`). Hanya data profil non-rahasia yang disimpan di localStorage.
 *   Syarat di back-end: kirim `Set-Cookie: HttpOnly; Secure; SameSite`, sediakan
 *   `POST /auth/logout` yang menghapus cookie, dan izinkan CORS dengan credentials.
 *
 * Mode default dipertahankan karena sesi harus terbaca sinkron di tab baru dan oleh uji
 * otomatis Puppeteer yang memeriksa localStorage.
 */
export function AuthProvider({ children }) {
  // Inisialisasi sinkron dari localStorage agar render pertama di tab baru
  // langsung membaca user tanpa kedip/async delay yang memicu false redirect di Puppeteer
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading] = useState(false);

  const login = useCallback((token, userData) => {
    try {
      if (!config.useCookieAuth) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Gagal menyimpan token ke localStorage:', error);
    }
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    if (config.useCookieAuth) {
      // Cookie HttpOnly hanya bisa dihapus oleh server.
      api.post('/auth/logout').catch(() => {});
    }
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Gagal membersihkan localStorage:', error);
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
