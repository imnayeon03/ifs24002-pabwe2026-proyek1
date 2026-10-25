import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { DEFAULT_METODE } from '../config/paymentMethods.js';

const STATUS = ['Diterima', 'Dimasak', 'Siap', 'Dikirim', 'Selesai'];

/**
 * Komponen Presentasional: Kartu Pesanan Masuk untuk Penjual
 */
export default function PesananMasukCard({ order: o, onUbahStatus, onKonfirmasiKirimClick }) {
  const isPaid = o.status_pembayaran === 'Sudah Dibayar';

  return (
    <div className="card">
      <div className="row">
        <div>
          <b>#{o.nomor_antrean} · {o.pemesan} · ambil {o.jam_ambil}</b>
          <div className="order-badges">
            <span className={`status ${o.status}`}>{o.status}</span>
            <span className={`badge-payment ${isPaid ? 'paid' : 'unpaid'}`}>
              {isPaid ? `✅ Sudah Dibayar (${o.metode_pembayaran || DEFAULT_METODE})` : '⏳ Belum Dibayar'}
            </span>
          </div>
        </div>
        <div className="price">{rupiah(o.total)}</div>
      </div>

      <p className="muted small">
        Dipesan: {o.created_at}
        {o.waktu_bayar && <span> · Dibayar: {o.waktu_bayar}</span>}
        {o.waktu_kirim && <span> · Dikirim: {o.waktu_kirim}</span>}
        {o.waktu_selesai && <span> · Diterima: {o.waktu_selesai}</span>}
      </p>

      <ul>
        {(o.items || []).map((i) => (
          <li key={i.menu_id}>{i.jumlah}× {i.nama} ({rupiah(i.harga)})</li>
        ))}
      </ul>

      <div className="seller-order-footer">
        <div className="status-button-group">
          <span className="small muted">Ubah status: </span>
          {STATUS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={s === o.status}
              className={s === o.status ? 'active-status-btn' : ''}
              onClick={() => onUbahStatus(o.id, s)}
            >
              {s}
            </button>
          ))}
        </div>

        {o.status !== 'Dikirim' && o.status !== 'Selesai' && (
          <button type="button" className="btn-kirim" onClick={() => onKonfirmasiKirimClick(o)}>
            🚚 Konfirmasi Sudah Mengirim Pesanan
          </button>
        )}
        {o.status === 'Dikirim' && (
          <div className="delivery-waiting-note">
            🚚 <b>Pesanan Sedang Dikirim</b> · Menunggu {o.pemesan} konfirmasi diterima.
          </div>
        )}
        {o.status === 'Selesai' && (
          <div className="delivery-done-note">
            ✅ <b>Pesanan Selesai</b> · {o.pemesan} telah konfirmasi pesanan diterima.
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
