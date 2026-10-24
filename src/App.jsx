import { lazy, Suspense, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './auth.jsx';
import NavBar from './components/NavBar.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useNotifikasi } from './hooks/useNotifikasi.js';
import LoadingSpinner from './components/LoadingSpinner.jsx';
// Login & Katalog tetap eager: keduanya pintu masuk aplikasi, lazy tidak memberi manfaat.
import Login from './pages/Login.jsx';
import Katalog from './pages/Katalog.jsx';
// Halaman lain dimuat saat dibutuhkan (code splitting per route).
const Keranjang = lazy(() => import('./pages/Keranjang.jsx'));
const Riwayat = lazy(() => import('./pages/Riwayat.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Profil = lazy(() => import('./pages/Profil.jsx'));
const Notifikasi = lazy(() => import('./pages/Notifikasi.jsx'));

export default function App() {
  const { user, loading, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const { notifications, unreadCount, markRead, markAllRead } = useNotifikasi(user);

  const add = (m) => setCart((c) => {
    const f = c.find((x) => x.menu.id === m.id);
    if (f) return c.map((x) => (x.menu.id === m.id ? { ...x, jumlah: Math.min(x.jumlah + 1, m.stok) } : x));
    return [...c, { menu: m, jumlah: 1 }];
  });

  // Tunggu sampai localStorage selesai dibaca sebelum render guard
  if (loading) return <div id="app-loading" aria-busy="true" style={{ display: 'none' }} />;

  const guard = (role, el) => {
    if (user) {
      if (user.role === role) return el;
      return <Navigate to="/" />;
    }
    return <Navigate to="/auth/login" />;
  };

  const guardAny = (el) => {
    if (user) return el;
    return <Navigate to="/auth/login" />;
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4500 }} />

      <NavBar
        user={user}
        onLogout={logout}
        unreadCount={unreadCount}
        showNotif={showNotif}
        setShowNotif={setShowNotif}
        notifications={notifications}
        onMarkRead={markRead}
        onMarkAllRead={markAllRead}
      />

      <main>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner text="Memuat halaman..." />}>
            <Routes>
              <Route path="/" element={user?.role === 'penjual' ? <Navigate to="/dashboard" /> : <Katalog onAdd={add} cart={cart} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/register" element={<Login />} />
              <Route path="/auth/register" element={<Login />} />
              <Route path="/keranjang" element={guard('mahasiswa', <Keranjang cart={cart} setCart={setCart} />)} />
              <Route path="/riwayat" element={guard('mahasiswa', <Riwayat />)} />
              <Route path="/dashboard" element={guard('penjual', <Dashboard />)} />
              <Route path="/profil" element={guardAny(<Profil />)} />
              <Route path="/notifikasi" element={guardAny(<Notifikasi />)} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
    </>
  );
}
