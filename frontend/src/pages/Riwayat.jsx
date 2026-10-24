import { useState } from 'react';
import { errMsg } from '../api';
import api from '../api';
import { useOrders } from '../hooks/useOrders.js';
import PesananCard from '../components/PesananCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Riwayat() {
  const { orders, loading, error, reload } = useOrders();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(error);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 6000); };

  const handleBayar = async (order, metode) => {
    try {
      await api.post(`/orders/${order.id}/bayar`, { metode_pembayaran: metode });
      showMsg(`Pembayaran pesanan #${order.nomor_antrean} berhasil! Penjual telah menerima notifikasi.`);
      reload();
    } catch (e) {
      setErr(errMsg(e));
      throw e; // agar ModalBayar bisa handle error juga
    }
  };

  const handleKonfirmasiTerima = async (order) => {
    if (!confirm(`Konfirmasi bahwa Anda telah menerima pesanan #${order.nomor_antrean} dari ${order.kios_nama}?`)) return;
    setErr('');
    try {
      await api.post(`/orders/${order.id}/konfirmasi-terima`);
      showMsg(`Pesanan #${order.nomor_antrean} berhasil dikonfirmasi diterima. Terima kasih!`);
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <>
      <h1>Pesanan Saya</h1>
      {msg && <div className="alert-success">{msg}</div>}
      {(err || error) && <div className="error">{err || error}</div>}

      {loading
        ? <LoadingSpinner text="Memuat pesanan..." />
        : !orders.length
          ? <p className="muted">Belum ada pesanan.</p>
          : orders.map((o) => (
              <PesananCard
                key={o.id}
                order={o}
                onBayar={handleBayar}
                onKonfirmasiTerima={handleKonfirmasiTerima}
              />
            ))
      }
    </>
  );
}
