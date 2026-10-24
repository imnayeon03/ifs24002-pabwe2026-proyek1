import { Link } from 'react-router-dom';
import NotifikasiDropdown from './NotifikasiDropdown.jsx';

/**
 * NavBar — komponen header yang dipecah dari App.jsx
 * agar App.jsx lebih ringkas dan mudah dirawat.
 */
export default function NavBar({
  user,
  onLogout,
  unreadCount,
  showNotif,
  setShowNotif,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) {
  return (
    <header className="nav">
      <Link to="/" className="brand">Del<b>Food</b></Link>
      <nav>
        {user?.role === 'penjual' ? (
          <Link to="/dashboard">Dashboard</Link>
        ) : (
          <>
            <Link to="/">Menu</Link>
            {user && <Link to="/keranjang">Keranjang</Link>}
            {user && <Link to="/riwayat">Pesanan Saya</Link>}
          </>
        )}

        {user && <Link to="/notifikasi">Notifikasi</Link>}
        {user && <Link to="/profil">Profil</Link>}

        {user && (
          <div className="notif-wrapper">
            <button
              type="button"
              className={`btn-notif ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => setShowNotif((v) => !v)}
              title="Notifikasi"
              aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
              aria-expanded={showNotif}
            >
              🔔 {unreadCount > 0 && (
                <span className="notif-count-badge">{unreadCount}</span>
              )}
            </button>
            <NotifikasiDropdown
              isOpen={showNotif}
              onClose={() => setShowNotif(false)}
              notifications={notifications}
              onMarkAllRead={onMarkAllRead}
              onMarkRead={onMarkRead}
            />
          </div>
        )}

        {user ? (
          <button id="btn-logout" onClick={onLogout}>
            Keluar ({user.nama})
          </button>
        ) : (
          <Link to="/auth/login" id="btn-login">Masuk</Link>
        )}
      </nav>
    </header>
  );
}
