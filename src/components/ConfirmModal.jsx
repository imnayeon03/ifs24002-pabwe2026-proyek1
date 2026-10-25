import PropTypes from 'prop-types';
import Modal from './Modal.jsx';

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
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="modal-body confirm-body">
        <p>{message}</p>
      </div>
      <div className="modal-footer">
        <button type="button" onClick={onCancel}>{cancelText}</button>
        <button type="button" className={isDanger ? 'btn-danger' : 'primary'} onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </Modal>
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
