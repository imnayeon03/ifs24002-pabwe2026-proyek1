import PropTypes from 'prop-types';

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
  if (!isOpen) return null;

  return (
    <dialog
      open
      className="modal-overlay"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-content" style={{ maxWidth: '400px' }}>
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
      </div>
    </dialog>
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
