import { rupiah } from '../api';

/**
 * Komponen presentasional murni untuk menampilkan satu kartu pesanan.
 * Tidak menyimpan state bisnis atau memanggil API secara langsung.
 */
export default function PesananCard({ order: o, onBayar, onKonfirmasiTerima }) {
  const isPaid = o.status_pembayaran === 'Sudah Dibayar';

  return (
    <div className="card" key={o.id}>
      <div className="row">
        <div>
          <b>{o.kios_nama} · Antrean #{o.nomor_antrean}</b>
          <div className="order-badges">
            <span className={`status ${o.status}`}>{o.status}</span>
            <span className={`badge-payment ${isPaid ? 'paid' : 'unpaid'}`}>
              {isPaid
                ? `✅ Lunas (${o.metode_pembayaran || 'QRIS'})`
                : '⏳ Belum Dibayar'}
            </span>
          </div>
        </div>
        <div className="price">{rupiah(o.total)}</div>
      </div>

      <p className="muted small">
        Ambil pukul {o.jam_ambil} · Dipesan pada {o.created_at}
        {o.waktu_kirim && <span> · Dikirim pada {o.waktu_kirim}</span>}
        {o.waktu_selesai && <span> · Selesai pada {o.waktu_selesai}</span>}
      </p>

      <ul>
        {(o.items || []).map((i) => (
          <li key={i.menu_id}>{i.jumlah}× {i.nama} ({rupiah(i.harga)})</li>
        ))}
      </ul>

      {/* Belum dibayar → aksi bayar */}
      {!isPaid && (
        <div className="action-box payment-action">
          <span>Pesanan ini belum dibayar. Silakan lakukan pembayaran agar penjual segera memproses pesanan Anda.</span>
          <button type="button" className="primary" onClick={() => onBayar && onBayar(o)}>
            💳 Bayar Sekarang
          </button>
        </div>
      )}

      {/* Sedang dikirim → aksi konfirmasi terima */}
      {o.status === 'Dikirim' && (
        <div className="action-box delivery-action">
          <div className="delivery-info">
            <b>🚚 Pesanan Anda sedang dikirim oleh penjual!</b>
            <p className="small muted">
              Silakan periksa makanan/minuman yang Anda terima. Jika sudah sesuai, klik tombol konfirmasi.
            </p>
          </div>
          <button type="button" className="btn-terima" onClick={() => onKonfirmasiTerima && onKonfirmasiTerima(o)}>
            ✅ Konfirmasi Sudah Menerima Pesanan
          </button>
        </div>
      )}

      {o.status === 'Selesai' && (
        <div className="status-finished-note">
          ✅ Pesanan telah selesai dan Anda konfirmasi diterima.
        </div>
      )}
    </div>
  );
}
