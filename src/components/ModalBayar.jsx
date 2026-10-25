import { useState } from 'react';
import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { DEFAULT_METODE, PAYMENT_METHODS, getJenisMetode } from '../config/paymentMethods.js';
import Modal from './Modal.jsx';
import QrisCode from './QrisCode.jsx';

/**
 * Komponen presentasional untuk Modal Pembayaran.
 * Bertanggung jawab hanya pada UI pemilihan metode pembayaran & tampilan QRIS/VA.
 */
export default function ModalBayar({ isOpen, onClose, total, orderNo, onConfirm, loading = false }) {
  const [metode, setMetode] = useState(DEFAULT_METODE);

  const jenis = getJenisMetode(metode);
  const title = `Pembayaran Pesanan${orderNo ? ` #${orderNo}` : ''}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(metode);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="payment-summary">
            <span className="muted">Total yang harus dibayar:</span>
            <div className="price-large">{rupiah(total)}</div>
          </div>

          <div>
            <label htmlFor="modal-select-metode">Pilih Metode Pembayaran:</label>
            <select
              id="modal-select-metode"
              aria-label="Pilih Metode Pembayaran"
              value={metode}
              onChange={(event) => setMetode(event.target.value)}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>{method.label}</option>
              ))}
            </select>
          </div>

          {jenis === 'qris' && (
            <div className="qris-card">
              <div className="qris-header">
                <b>QRIS Standar Pembayaran Nasional</b>
                <span className="tag">DelFood QuickPay</span>
              </div>
              <div className="qr-box">
                <QrisCode />
              </div>
              <p className="muted small text-center">Scan menggunakan BCA Mobile, GoPay, OVO, Dana, ShopeePay, atau m-Banking lain</p>
            </div>
          )}

          {jenis === 'transfer' && (
            <div className="bank-card">
              <b>Nomor Virtual Account {metode}:</b>
              <div className="va-number">8801 1124 0029 9010</div>
              <p className="muted small">Atas Nama: <b>DELFOOD KANTIN IT DEL</b></p>
              <p className="small">Pesanan akan otomatis terverifikasi setelah konfirmasi.</p>
            </div>
          )}

          {jenis === 'ewallet' && (
            <div className="bank-card">
              <b>Nomor E-Wallet:</b>
              <div className="va-number">0812-3456-7890</div>
              <p className="muted small">Atas Nama: <b>DELFOOD PAYMENT</b></p>
            </div>
          )}

          {jenis === 'tunai' && (
            <div className="bank-card">
              <b>Pembayaran Tunai di Lokasi Kios</b>
              <p className="small muted">Silakan serahkan uang pas saat mengambil pesanan.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} disabled={loading}>Batal</button>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Memproses...' : '✅ Konfirmasi Sudah Membayar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

ModalBayar.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  total: PropTypes.number.isRequired,
  orderNo: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
