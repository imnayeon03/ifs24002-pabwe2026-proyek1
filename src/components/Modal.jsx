import { useId } from 'react';
import PropTypes from 'prop-types';
import { useEscapeKey } from '../hooks/useEscapeKey.js';
import { useFocusTrap } from '../hooks/useFocusTrap.js';

/**
 * Modal dasar yang dipakai ulang oleh ModalBayar dan ConfirmModal.
 *
 * Menangani semua hal yang sama di setiap dialog: overlay + backdrop yang bisa
 * diklik, tombol tutup, tombol Escape, jebakan fokus, dan atribut ARIA
 * (`aria-modal`, `aria-labelledby`). Isi dialog diberikan lewat `children`.
 */
export default function Modal({ isOpen, onClose, title, size = 'md', children }) {
  const titleId = useId();
  const dialogRef = useFocusTrap(isOpen);

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <button type="button" className="modal-backdrop" aria-label="Tutup dialog" tabIndex={-1} onClick={onClose} />
      <dialog
        open
        className={`modal-content modal-${size}`}
        ref={dialogRef}
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-header">
          <h3 id={titleId}>{title}</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>
        {children}
      </dialog>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['md', 'sm']),
  children: PropTypes.node.isRequired,
};
