import { useState } from 'react';
import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { useEscapeKey } from '../hooks/useEscapeKey.js';

/**
 * Komponen presentasional untuk Modal Pembayaran.
 * Bertanggung jawab hanya pada UI pemilihan metode pembayaran & tampilan QRIS/VA.
 */
export default function ModalBayar({ isOpen, onClose, total, orderNo, onConfirm, loading = false }) {
  const [metode, setMetode] = useState('QRIS');

  useEscapeKey(onClose, isOpen);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(metode);
  };

  return (
    <div className="modal-overlay">
      <button type="button" className="modal-backdrop" aria-label="Tutup dialog" tabIndex={-1} onClick={onClose} />
      <dialog open className="modal-content">
        <div className="modal-header">
          <h3>Pembayaran Pesanan {orderNo ? `#${orderNo}` : ''}</h3>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

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
                onChange={(e) => setMetode(e.target.value)}
              >
                <option value="QRIS">QRIS (Semua E-Wallet & Bank)</option>
                <option value="Transfer Bank BCA">Transfer Bank (BCA VA)</option>
                <option value="Transfer Bank Mandiri">Transfer Bank (Mandiri VA)</option>
                <option value="GoPay / OVO / Dana">E-Wallet (GoPay / OVO / Dana)</option>
                <option value="Tunai">Tunai di Tempat</option>
              </select>
            </div>

            {metode === 'QRIS' && (
              <div className="qris-card">
                <div className="qris-header">
                  <b>QRIS Standar Pembayaran Nasional</b>
                  <span className="tag">DelFood QuickPay</span>
                </div>
                <div className="qr-box">
                  <svg viewBox="0 0 160 160" width="150" height="150" className="qr-svg">
                    <rect width="160" height="160" fill="#ffffff" rx="10" />
                    <rect x="15" y="15" width="40" height="40" fill="#14206b" rx="4" />
                    <rect x="23" y="23" width="24" height="24" fill="#ffffff" rx="2" />
                    <rect x="29" y="29" width="12" height="12" fill="#14206b" rx="1" />
                    <rect x="105" y="15" width="40" height="40" fill="#14206b" rx="4" />
                    <rect x="113" y="23" width="24" height="24" fill="#ffffff" rx="2" />
                    <rect x="119" y="29" width="12" height="12" fill="#14206b" rx="1" />
                    <rect x="15" y="105" width="40" height="40" fill="#14206b" rx="4" />
                    <rect x="23" y="113" width="24" height="24" fill="#ffffff" rx="2" />
                    <rect x="29" y="119" width="12" height="12" fill="#14206b" rx="1" />
                    <rect x="65" y="20" width="8" height="8" fill="#2d4de0" />
                    <rect x="80" y="20" width="8" height="8" fill="#14206b" />
                    <rect x="65" y="35" width="12" height="8" fill="#6d3fd1" />
                    <rect x="85" y="35" width="8" height="12" fill="#2d4de0" />
                    <rect x="20" y="65" width="8" height="12" fill="#2d4de0" />
                    <rect x="35" y="65" width="12" height="8" fill="#14206b" />
                    <rect x="55" y="60" width="10" height="10" fill="#6d3fd1" />
                    <rect x="70" y="55" width="16" height="16" fill="#14206b" rx="2" />
                    <rect x="95" y="65" width="8" height="12" fill="#2d4de0" />
                    <rect x="110" y="60" width="12" height="10" fill="#14206b" />
                    <rect x="130" y="65" width="10" height="10" fill="#6d3fd1" />
                    <rect x="65" y="80" width="10" height="8" fill="#2d4de0" />
                    <rect x="85" y="80" width="12" height="10" fill="#14206b" />
                    <rect x="65" y="105" width="10" height="12" fill="#6d3fd1" />
                    <rect x="85" y="100" width="8" height="10" fill="#2d4de0" />
                    <rect x="105" y="90" width="12" height="8" fill="#14206b" />
                    <rect x="125" y="85" width="8" height="12" fill="#2d4de0" />
                    <rect x="65" y="125" width="8" height="12" fill="#14206b" />
                    <rect x="80" y="120" width="12" height="8" fill="#6d3fd1" />
                    <rect x="100" y="115" width="14" height="10" fill="#2d4de0" />
                    <rect x="125" y="110" width="15" height="12" fill="#14206b" />
                    <rect x="105" y="130" width="12" height="12" fill="#6d3fd1" />
                    <rect x="125" y="130" width="10" height="10" fill="#2d4de0" />
                  </svg>
                </div>
                <p className="muted small text-center">Scan menggunakan BCA Mobile, GoPay, OVO, Dana, ShopeePay, atau m-Banking lain</p>
              </div>
            )}

            {metode.includes('Transfer') && (
              <div className="bank-card">
                <b>Nomor Virtual Account {metode}:</b>
                <div className="va-number">8801 1124 0029 9010</div>
                <p className="muted small">Atas Nama: <b>DELFOOD KANTIN IT DEL</b></p>
                <p className="small">Pesanan akan otomatis terverifikasi setelah konfirmasi.</p>
              </div>
            )}

            {metode.includes('GoPay') && (
              <div className="bank-card">
                <b>Nomor E-Wallet:</b>
                <div className="va-number">0812-3456-7890</div>
                <p className="muted small">Atas Nama: <b>DELFOOD PAYMENT</b></p>
              </div>
            )}

            {metode === 'Tunai' && (
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
      </dialog>
    </div>
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
