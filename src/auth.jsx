import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

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
