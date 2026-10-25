import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { DEFAULT_METODE } from '../config/paymentMethods.js';

/**
 * Komponen presentasional murni untuk menampilkan satu kartu pesanan.
 * Tidak menyimpan state bisnis atau memanggil API secara langsung.
 */
export default function PesananCard({ order, onBayar, onKonfirmasiTerima }) {
  const isPaid = order.status_pembayaran === 'Sudah Dibayar';

  return (
    <div className="card">
      <div className="row">
        <div>
          <b>{order.kios_nama} · Antrean #{order.nomor_antrean}</b>
          <div className="order-badges">
            <span className={`status ${order.status}`}>{order.status}</span>
            <span className={`badge-payment ${isPaid ? 'paid' : 'unpaid'}`}>
              {isPaid
                ? `✅ Lunas (${order.metode_pembayaran || DEFAULT_METODE})`
                : '⏳ Belum Dibayar'}
            </span>
          </div>
        </div>
        <div className="price">{rupiah(order.total)}</div>
      </div>

      <p className="muted small">
        Ambil pukul {order.jam_ambil} · Dipesan pada {order.created_at}
        {order.waktu_kirim && <span> · Dikirim pada {order.waktu_kirim}</span>}
        {order.waktu_selesai && <span> · Selesai pada {order.waktu_selesai}</span>}
      </p>

      <ul>
        {(order.items || []).map((item) => (
          <li key={item.menu_id}>{item.jumlah}× {item.nama} ({rupiah(item.harga)})</li>
        ))}
      </ul>

      {/* Belum dibayar → aksi bayar */}
      {!isPaid && (
        <div className="action-box payment-action">
          <span>Pesanan ini belum dibayar. Silakan lakukan pembayaran agar penjual segera memproses pesanan Anda.</span>
          <button type="button" className="primary" onClick={() => onBayar?.(order)}>
            💳 Bayar Sekarang
          </button>
        </div>
      )}

      {/* Sedang dikirim → aksi konfirmasi terima */}
      {order.status === 'Dikirim' && (
        <div className="action-box delivery-action">
          <div className="delivery-info">
            <b>🚚 Pesanan Anda sedang dikirim oleh penjual!</b>
            <p className="small muted">
              Silakan periksa makanan/minuman yang Anda terima. Jika sudah sesuai, klik tombol konfirmasi.
            </p>
          </div>
          <button type="button" className="btn-terima" onClick={() => onKonfirmasiTerima?.(order)}>
            ✅ Konfirmasi Sudah Menerima Pesanan
          </button>
        </div>
      )}

      {order.status === 'Selesai' && (
        <div className="status-finished-note">
          ✅ Pesanan telah selesai dan Anda konfirmasi diterima.
        </div>
      )}
    </div>
  );
}

PesananCard.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.number.isRequired,
    kios_nama: PropTypes.string,
    nomor_antrean: PropTypes.number.isRequired,
    jam_ambil: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    status_pembayaran: PropTypes.string.isRequired,
    metode_pembayaran: PropTypes.string,
    total: PropTypes.number.isRequired,
    created_at: PropTypes.string,
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
  onBayar: PropTypes.func,
  onKonfirmasiTerima: PropTypes.func,
};
