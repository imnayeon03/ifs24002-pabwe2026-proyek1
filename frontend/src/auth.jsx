import { createContext, useContext, useState, useEffect } from 'react';

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // abaikan jika localStorage rusak
    }
  }, []);

  const login = (token, u) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      console.error('Gagal menyimpan token ke localStorage:', err);
    }
    setUser(u);
  };

  const logout = () => {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('Gagal membersihkan localStorage:', err);
    }
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}
