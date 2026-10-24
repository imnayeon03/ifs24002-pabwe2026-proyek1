import PropTypes from 'prop-types';

export default function NotifikasiDropdown({ isOpen, onClose, notifications, onMarkAllRead, onMarkRead }) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  const getIcon = (tipe) => {
    switch (tipe) {
      case 'pembayaran': return '💳';
      case 'pengiriman': return '🚚';
      case 'penerimaan': return '✅';
      default: return '🔔';
    }
  };

  return (
    <div className="notif-dropdown" role="region" aria-label="Daftar Notifikasi">
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
        {!notifications.length ? (
          <p className="notif-empty muted">Belum ada notifikasi saat ini.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`notif-item ${n.dibaca ? 'read' : 'unread'}`}
              onClick={() => !n.dibaca && onMarkRead(n.id)}
            >
              <div className="notif-icon">{getIcon(n.tipe)}</div>
              <div className="notif-content">
                <div className="notif-title">{n.judul}</div>
                <div className="notif-message">{n.pesan}</div>
                <small className="notif-time muted">{n.created_at}</small>
              </div>
              {!n.dibaca && <span className="unread-dot" title="Belum dibaca" />}
            </div>
          ))
        )}
      </div>
    </div>
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
