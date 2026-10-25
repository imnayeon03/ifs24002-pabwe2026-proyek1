import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

/**
 * KEAMANAN SESI: token JWT disimpan di localStorage.
 *
 * Risiko : skrip apa pun yang berjalan di halaman (mis. lewat serangan XSS atau
 *          dependensi yang disusupi) dapat membaca token ini. Berbeda dengan
 *          cookie `HttpOnly`, localStorage tidak dilindungi dari JavaScript.
 * Mitigasi yang sudah ada di front-end:
 *   - React meng-escape semua teks; tidak ada `dangerouslySetInnerHTML` di proyek ini.
 *   - Interceptor 401 (api.js) menghapus sesi begitu server menolak token.
 *   - Token diharapkan berumur pendek (diatur oleh back-end).
 * Pilihan yang lebih aman: back-end mengirim token lewat cookie `HttpOnly; Secure;
 * SameSite`, sehingga front-end tidak perlu menyimpannya sama sekali. Itu butuh
 * perubahan di back-end (set-cookie + CORS credentials), jadi belum dilakukan di sini.
 * Alasan tetap memakai localStorage: sesi harus terbaca sinkron di tab baru dan oleh
 * uji otomatis Puppeteer yang memeriksa localStorage.
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

  const login = useCallback((token, u) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      console.error('Gagal menyimpan token ke localStorage:', err);
    }
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('Gagal membersihkan localStorage:', err);
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
