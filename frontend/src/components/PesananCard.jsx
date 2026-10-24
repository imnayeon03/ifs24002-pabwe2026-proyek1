import { rupiah } from '../api';
import ModalBayar from './ModalBayar.jsx';
import { useState } from 'react';

/**
 * PesananCard — komponen reusable untuk menampilkan satu kartu pesanan.
 * Dipakai di Riwayat.jsx (mahasiswa) dengan aksi bayar & konfirmasi terima.
 */
export default function PesananCard({ order: o, onBayar, onKonfirmasiTerima }) {
  const [showModalBayar, setShowModalBayar] = useState(false);

  const handleBayar = async (metode) => {
    await onBayar(o, metode);
    setShowModalBayar(false);
  };

  return (
    <div className="card" key={o.id}>
      <div className="row">
        <div>
          <b>{o.kios_nama} · Antrean #{o.nomor_antrean}</b>
          <div className="order-badges">
            <span className={`status ${o.status}`}>{o.status}</span>
            <span className={`badge-payment ${o.status_pembayaran === 'Sudah Dibayar' ? 'paid' : 'unpaid'}`}>
              {o.status_pembayaran === 'Sudah Dibayar'
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

      {/* Belum dibayar → tombol bayar */}
      {o.status_pembayaran !== 'Sudah Dibayar' && (
        <div className="action-box payment-action">
          <span>Pesanan ini belum dibayar. Silakan lakukan pembayaran agar penjual segera memproses pesanan Anda.</span>
          <button type="button" className="primary" onClick={() => setShowModalBayar(true)}>
            💳 Bayar Sekarang
          </button>
        </div>
      )}

      {/* Sedang dikirim → konfirmasi terima */}
      {o.status === 'Dikirim' && (
        <div className="action-box delivery-action">
          <div className="delivery-info">
            <b>🚚 Pesanan Anda sedang dikirim oleh penjual!</b>
            <p className="small muted">
              Silakan periksa makanan/minuman yang Anda terima. Jika sudah sesuai, klik tombol konfirmasi.
            </p>
          </div>
          <button type="button" className="btn-terima" onClick={() => onKonfirmasiTerima(o)}>
            ✅ Konfirmasi Sudah Menerima Pesanan
          </button>
        </div>
      )}

      {o.status === 'Selesai' && (
        <div className="status-finished-note">
          ✅ Pesanan telah selesai dan Anda konfirmasi diterima.
        </div>
      )}

      {showModalBayar && (
        <ModalBayar
          isOpen={showModalBayar}
          onClose={() => setShowModalBayar(false)}
          total={o.total}
          orderNo={o.nomor_antrean}
          onConfirm={handleBayar}
        />
      )}
    </div>
  );
}
