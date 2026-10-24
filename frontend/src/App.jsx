import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import NavBar from './components/NavBar.jsx';
import ToastNotification from './components/ToastNotification.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useNotifikasi } from './hooks/useNotifikasi.js';
import Login from './pages/Login.jsx';
import Katalog from './pages/Katalog.jsx';
import Keranjang from './pages/Keranjang.jsx';
import Riwayat from './pages/Riwayat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profil from './pages/Profil.jsx';
import Notifikasi from './pages/Notifikasi.jsx';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const { notifications, unreadCount, toast, setToast, markRead, markAllRead } = useNotifikasi(user);

  const add = (m) => setCart((c) => {
    const f = c.find((x) => x.menu.id === m.id);
    if (f) return c.map((x) => (x.menu.id === m.id ? { ...x, jumlah: Math.min(x.jumlah + 1, m.stok) } : x));
    return [...c, { menu: m, jumlah: 1 }];
  });

  // Tunggu sampai localStorage selesai dibaca sebelum render guard
  if (loading) return <div id="app-loading" aria-busy="true" style={{ display: 'none' }} />;

  const guard = (role, el) => (!user ? <Navigate to="/auth/login" /> : user.role !== role ? <Navigate to="/" /> : el);
  const guardAny = (el) => (!user ? <Navigate to="/auth/login" /> : el);

  return (
    <>
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

      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <main>
        <ErrorBoundary>
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
        </ErrorBoundary>
      </main>
    </>
  );
}
