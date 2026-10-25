import { useNotificationList } from '../hooks/useNotificationList.js';

export default function Notifikasi() {
  const { notifications, error } = useNotificationList();

  return (
    <section>
      <h1>Notifikasi</h1>
      {error && <p className="error">{error}</p>}
      {!error && notifications.length === 0 && <p className="muted">Belum ada notifikasi.</p>}
      {notifications.map((notification) => (
        <div className="card" key={notification.id}>
          <b>{notification.judul}</b>
          <p>{notification.pesan}</p>
          <p className="muted small">{notification.created_at}</p>
        </div>
      ))}
    </section>
  );
}
