import { useCallback, useEffect, useRef, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import api from './api';
import Login from './pages/Login.jsx';
import Katalog from './pages/Katalog.jsx';
import Keranjang from './pages/Keranjang.jsx';
import Riwayat from './pages/Riwayat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profil from './pages/Profil.jsx'; // BARU
import Notifikasi from './pages/Notifikasi.jsx'; // BARU
import NotifikasiDropdown from './components/NotifikasiDropdown.jsx';

export default function App() {
  const { user, logout } = useAuth();
  const [cart, setCart] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [toast, setToast] = useState(null);
  const lastNotifIdRef = useRef(null);

  const add = (m) => setCart((c) => {
    const f = c.find((x) => x.menu.id === m.id);
    if (f) return c.map((x) => (x.menu.id === m.id ? { ...x, jumlah: Math.min(x.jumlah + 1, m.stok) } : x));
    return [...c, { menu: m, jumlah: 1 }];
  });

  const loadNotif = useCallback(() => {
    if (!user) return;
    api.get('/notifications')
      .then((r) => {
        const data = r.data || [];
        setNotifications(data);
        if (data.length > 0) {
          const newest = data[0];
          // Deteksi notifikasi baru untuk toast alert
          if (lastNotifIdRef.current !== null && newest.id > lastNotifIdRef.current && !newest.dibaca) {
            setToast({ judul: newest.judul, pesan: newest.pesan, tipe: newest.tipe });
            setTimeout(() => setToast(null), 5000);
          }
          lastNotifIdRef.current = newest.id;
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadNotif();
    const interval = setInterval(loadNotif, 5000);
    return () => clearInterval(interval);
  }, [user, loadNotif]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/baca-semua');
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: 1 })));
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/baca`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: 1 } : n)));
    } catch {}
  };

  const unreadCount = notifications.filter((n) => !n.dibaca).length;
  const guard = (role, el) => (!user ? <Navigate to="/auth/login" /> : user.role !== role ? <Navigate to="/" /> : el);
  // BARU: halaman yang bisa dibuka semua user yang sudah login
  const guardAny = (el) => (!user ? <Navigate to="/auth/login" /> : el);

  return (
    <>
      <header className="nav">
        <Link to="/" className="brand">Del<b>Food</b></Link>
        <nav>
          {user?.role === 'penjual' ? <Link to="/dashboard">Dashboard</Link> : (<>
            <Link to="/">Menu</Link>
            {user && <Link to="/keranjang">Keranjang ({cart.reduce((s, x) => s + x.jumlah, 0)})</Link>}
            {user && <Link to="/riwayat">Pesanan Saya</Link>}
          </>)}

          {/* BARU: link Profil dan Notifikasi untuk semua user login */}
          {user && <Link to="/notifikasi">Notifikasi</Link>}
          {user && <Link to="/profil">Profil</Link>}

          {user && (
            <div className="notif-wrapper">
              <button
                type="button"
                className={`btn-notif ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setShowNotif(!showNotif)}
                title="Notifikasi"
              >
                🔔 {unreadCount > 0 && <span className="notif-count-badge">{unreadCount}</span>}
              </button>
              <NotifikasiDropdown
                isOpen={showNotif}
                onClose={() => setShowNotif(false)}
                notifications={notifications}
                onMarkAllRead={markAllRead}
                onMarkRead={markRead}
              />
            </div>
          )}

          {user ? <button id="btn-logout" onClick={logout}>Keluar ({user.nama})</button> : <Link to="/auth/login" id="btn-login">Masuk</Link>}
        </nav>
      </header>

      {toast && (
        <div className="toast-notification" onClick={() => setToast(null)}>
          <div className="toast-icon">
            {toast.tipe === 'pembayaran' ? '💳' : toast.tipe === 'pengiriman' ? '🚚' : toast.tipe === 'penerimaan' ? '✅' : '🔔'}
          </div>
          <div className="toast-body">
            <b>{toast.judul}</b>
            <p>{toast.pesan}</p>
          </div>
          <button className="toast-close">✕</button>
        </div>
      )}

      <main>
        <Routes>
          <Route path="/" element={user?.role === 'penjual' ? <Navigate to="/dashboard" /> : <Katalog onAdd={add} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/auth/register" element={<Login />} />
          <Route path="/keranjang" element={guard('mahasiswa', <Keranjang cart={cart} setCart={setCart} />)} />
          <Route path="/riwayat" element={guard('mahasiswa', <Riwayat />)} />
          <Route path="/dashboard" element={guard('penjual', <Dashboard />)} />
          {/* BARU */}
          <Route path="/profil" element={guardAny(<Profil />)} />
          <Route path="/notifikasi" element={guardAny(<Notifikasi />)} />
        </Routes>
      </main>
    </>
  );
}
