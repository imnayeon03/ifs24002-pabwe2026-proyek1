/**
 * Toast notifikasi — muncul di pojok layar saat ada notifikasi baru.
 */
export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const icon =
    toast.tipe === 'pembayaran' ? '💳' :
    toast.tipe === 'pengiriman' ? '🚚' :
    toast.tipe === 'penerimaan' ? '✅' : '🔔';

  return (
    <div className="toast-notification" onClick={onClose} role="alert" aria-live="assertive">
      <div className="toast-icon" aria-hidden="true">{icon}</div>
      <div className="toast-body">
        <b>{toast.judul}</b>
        <p>{toast.pesan}</p>
      </div>
      <button
        className="toast-close"
        aria-label="Tutup notifikasi"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        ✕
      </button>
    </div>
  );
}
