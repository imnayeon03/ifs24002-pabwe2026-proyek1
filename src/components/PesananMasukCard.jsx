import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { DEFAULT_METODE } from '../config/paymentMethods.js';

const STATUS = ['Diterima', 'Dimasak', 'Siap', 'Dikirim', 'Selesai'];

/**
 * Komponen Presentasional: Kartu Pesanan Masuk untuk Penjual
 */
export default function PesananMasukCard({ order, onUbahStatus, onKonfirmasiKirimClick }) {
  const isPaid = order.status_pembayaran === 'Sudah Dibayar';

  return (
    <div className="card">
      <div className="row">
        <div>
          <b>#{order.nomor_antrean} · {order.pemesan} · ambil {order.jam_ambil}</b>
          <div className="order-badges">
            <span className={`status ${order.status}`}>{order.status}</span>
            <span className={`badge-payment ${isPaid ? 'paid' : 'unpaid'}`}>
              {isPaid ? `✅ Sudah Dibayar (${order.metode_pembayaran || DEFAULT_METODE})` : '⏳ Belum Dibayar'}
            </span>
          </div>
        </div>
        <div className="price">{rupiah(order.total)}</div>
      </div>

      <p className="muted small">
        Dipesan: {order.created_at}
        {order.waktu_bayar && <span> · Dibayar: {order.waktu_bayar}</span>}
        {order.waktu_kirim && <span> · Dikirim: {order.waktu_kirim}</span>}
        {order.waktu_selesai && <span> · Diterima: {order.waktu_selesai}</span>}
      </p>

      <ul>
        {(order.items || []).map((item) => (
          <li key={item.menu_id}>{item.jumlah}× {item.nama} ({rupiah(item.harga)})</li>
        ))}
      </ul>

      <div className="seller-order-footer">
        <div className="status-button-group">
          <span className="small muted">Ubah status: </span>
          {STATUS.map((statusOption) => (
            <button
              key={statusOption}
              type="button"
              disabled={statusOption === order.status}
              className={statusOption === order.status ? 'active-status-btn' : ''}
              onClick={() => onUbahStatus(order.id, statusOption)}
            >
              {statusOption}
            </button>
          ))}
        </div>

        {order.status !== 'Dikirim' && order.status !== 'Selesai' && (
          <button type="button" className="btn-kirim" onClick={() => onKonfirmasiKirimClick(order)}>
            🚚 Konfirmasi Sudah Mengirim Pesanan
          </button>
        )}
        {order.status === 'Dikirim' && (
          <div className="delivery-waiting-note">
            🚚 <b>Pesanan Sedang Dikirim</b> · Menunggu {order.pemesan} konfirmasi diterima.
          </div>
        )}
        {order.status === 'Selesai' && (
          <div className="delivery-done-note">
            ✅ <b>Pesanan Selesai</b> · {order.pemesan} telah konfirmasi pesanan diterima.
          </div>
        )}
      </div>
    </div>
  );
}

PesananMasukCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nomor_antrean: PropTypes.number.isRequired,
    pemesan: PropTypes.string,
    jam_ambil: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    status_pembayaran: PropTypes.string.isRequired,
    metode_pembayaran: PropTypes.string,
    total: PropTypes.number.isRequired,
    created_at: PropTypes.string,
    waktu_bayar: PropTypes.string,
    waktu_kirim: PropTypes.string,
    waktu_selesai: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        menu_id: PropTypes.number.isRequired,
        nama: PropTypes.string.isRequired,
        harga: PropTypes.number.isRequired,
        jumlah: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
  onUbahStatus: PropTypes.func.isRequired,
  onKonfirmasiKirimClick: PropTypes.func.isRequired,
};
