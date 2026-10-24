import PropTypes from 'prop-types';
import { getNotifIcon } from '../utils/notifications';

/**
 * Toast notifikasi presentasional.
 */
export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div className="toast-notification" onClick={onClose} role="alert" aria-live="assertive">
      <div className="toast-icon" aria-hidden="true">{getNotifIcon(toast.tipe)}</div>
      <div className="toast-body">
        <b>{toast.judul}</b>
        <p>{toast.pesan}</p>
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label="Tutup notifikasi"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        ✕
      </button>
    </div>
  );
}

ToastNotification.propTypes = {
  toast: PropTypes.shape({
    judul: PropTypes.string.isRequired,
    pesan: PropTypes.string.isRequired,
    tipe: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};
