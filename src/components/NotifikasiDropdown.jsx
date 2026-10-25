import PropTypes from 'prop-types';
import { getNotifIcon } from '../utils/notifications';

export default function NotifikasiDropdown({ isOpen, onClose, notifications, onMarkAllRead, onMarkRead }) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((notification) => !notification.dibaca).length;

  return (
    <section className="notif-dropdown" aria-label="Daftar Notifikasi">
      <div className="notif-header">
        <div>
          <b>Notifikasi</b>
          {unreadCount > 0 && <span className="notif-badge-pill">{unreadCount} baru</span>}
        </div>
        <div className="notif-actions">
          {unreadCount > 0 && (
            <button type="button" className="btn-link" onClick={onMarkAllRead}>Tandai semua dibaca</button>
          )}
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Tutup notifikasi">✕</button>
        </div>
      </div>

      <div className="notif-list">
        {notifications.length === 0 ? (
          <p className="notif-empty muted">Belum ada notifikasi saat ini.</p>
        ) : (
          notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              className={`notif-item ${notification.dibaca ? 'read' : 'unread'}`}
              onClick={() => !notification.dibaca && onMarkRead(notification.id)}
            >
              <span className="notif-icon">{getNotifIcon(notification.tipe)}</span>
              <span className="notif-content">
                <span className="notif-title">{notification.judul}</span>
                <span className="notif-message">{notification.pesan}</span>
                <small className="notif-time muted">{notification.created_at}</small>
              </span>
              {!notification.dibaca && <span className="unread-dot" title="Belum dibaca" />}
            </button>
          ))
        )}
      </div>
    </section>
  );
}

NotifikasiDropdown.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      judul: PropTypes.string.isRequired,
      pesan: PropTypes.string.isRequired,
      tipe: PropTypes.string,
      dibaca: PropTypes.number,
      created_at: PropTypes.string,
    })
  ).isRequired,
  onMarkAllRead: PropTypes.func.isRequired,
  onMarkRead: PropTypes.func.isRequired,
};
