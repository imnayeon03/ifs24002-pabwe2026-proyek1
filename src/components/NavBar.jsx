import PropTypes from 'prop-types';
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
  const notifLabel = unreadCount > 0
    ? `Notifikasi, ${unreadCount} belum dibaca`
    : 'Notifikasi';

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
              aria-label={notifLabel}
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
          <button type="button" id="btn-logout" onClick={onLogout}>
            Keluar ({user.nama})
          </button>
        ) : (
          <Link to="/auth/login" id="btn-login">Masuk</Link>
        )}
      </nav>
    </header>
  );
}

NavBar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number,
    nama: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }),
  onLogout: PropTypes.func.isRequired,
  unreadCount: PropTypes.number.isRequired,
  showNotif: PropTypes.bool.isRequired,
  setShowNotif: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      judul: PropTypes.string.isRequired,
      pesan: PropTypes.string.isRequired,
      dibaca: PropTypes.number,
    })
  ).isRequired,
  onMarkRead: PropTypes.func.isRequired,
  onMarkAllRead: PropTypes.func.isRequired,
};
