import PropTypes from 'prop-types';
import { useEscapeKey } from '../hooks/useEscapeKey.js';

/**
 * Reusable modal konfirmasi untuk menggantikan window.confirm() bawaan browser.
 */
export default function ConfirmModal({
  isOpen,
  title = 'Konfirmasi',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDanger = false,
}) {
  useEscapeKey(onCancel, isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <button type="button" className="modal-backdrop" aria-label="Tutup dialog" tabIndex={-1} onClick={onCancel} />
      <dialog open className="modal-content" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button type="button" className="btn-close" onClick={onCancel}>✕</button>
        </div>
        <div className="modal-body" style={{ padding: '12px 0' }}>
          <p>{message}</p>
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onCancel}>{cancelText}</button>
          <button
            type="button"
            className={isDanger ? 'error' : 'primary'}
            style={isDanger ? { background: '#ef4444', color: '#fff', border: 'none' } : {}}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </dialog>
    </div>
  );
}

ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  isDanger: PropTypes.bool,
};
