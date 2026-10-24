import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, rupiah } from '../api';
import ModalBayar from '../components/ModalBayar.jsx';

export default function Riwayat() {
  const [orders, setOrders] = useState([]);
  const [payOrder, setPayOrder] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    api.get('/orders')
      .then((r) => setOrders(r.data))
      .catch((e) => setErr(errMsg(e)));
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function handleBayarOrder(metode) {
    if (!payOrder) return;
    try {
      await api.post(`/orders/${payOrder.id}/bayar`, { metode_pembayaran: metode });
      setMsg(`Pembayaran pesanan #${payOrder.nomor_antrean} berhasil! Penjual telah menerima notifikasi.`);
      setPayOrder(null);
      load();
      setTimeout(() => setMsg(''), 6000);
    } catch (e) {
      throw new Error(errMsg(e));
    }
  }

  async function konfirmasiTerima(order) {
    if (!confirm(`Konfirmasi bahwa Anda telah menerima pesanan #${order.nomor_antrean} dari ${order.kios_nama}?`)) return;
    setErr('');
    try {
      await api.post(`/orders/${order.id}/konfirmasi-terima`);
      setMsg(`Pesanan #${order.nomor_antrean} berhasil dikonfirmasi diterima. Terima kasih!`);
      load();
      setTimeout(() => setMsg(''), 6000);
    } catch (e) {
      setErr(errMsg(e));
    }
  }

  return (
    <>
      <h1>Pesanan Saya</h1>
      {msg && <div className="alert-success">{msg}</div>}
      {err && <div className="error">{err}</div>}
      {!orders.length && <p className="muted">Belum ada pesanan.</p>}

      {orders.map((o) => (
        <div className="card" key={o.id}>
          <div className="row">
            <div>
              <b>{o.kios_nama} · Antrean #{o.nomor_antrean}</b>
              <div className="order-badges">
                <span className={`status ${o.status}`}>{o.status}</span>
                <span className={`badge-payment ${o.status_pembayaran === 'Sudah Dibayar' ? 'paid' : 'unpaid'}`}>
                  {o.status_pembayaran === 'Sudah Dibayar' ? `✓ Lunas (${o.metode_pembayaran || 'QRIS'})` : '⚠️ Belum Dibayar'}
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
            {o.items.map((i) => (
              <li key={i.menu_id}>{i.jumlah}× {i.nama} ({rupiah(i.harga)})</li>
            ))}
          </ul>

          {/* Jika belum dibayar, berikan tombol bayar */}
          {o.status_pembayaran !== 'Sudah Dibayar' && (
            <div className="action-box payment-action">
              <span>Pesanan ini belum dibayar. Silakan lakukan pembayaran agar penjual segera memproses pesanan Anda.</span>
              <button type="button" className="primary" onClick={() => setPayOrder(o)}>
                💳 Bayar Sekarang
              </button>
            </div>
          )}

          {/* Jika sedang dikirim, berikan opsi konfirmasi sudah menerima pesanan */}
          {o.status === 'Dikirim' && (
            <div className="action-box delivery-action">
              <div className="delivery-info">
                <b>🚚 Pesanan Anda sedang dikirim oleh penjual!</b>
                <p className="small muted">
                  Silakan periksa makanan/minuman yang Anda terima. Jika sudah sesuai, klik tombol konfirmasi di bawah ini.
                </p>
              </div>
              <button
                type="button"
                className="btn-terima"
                onClick={() => konfirmasiTerima(o)}
              >
                ✅ Konfirmasi Sudah Menerima Pesanan
              </button>
            </div>
          )}

          {o.status === 'Selesai' && (
            <div className="status-finished-note">
              ✓ Pesanan telah selesai dan Anda konfirmasi diterima.
            </div>
          )}
        </div>
      ))}

      {payOrder && (
        <ModalBayar
          isOpen={!!payOrder}
          onClose={() => setPayOrder(null)}
          total={payOrder.total}
          orderNo={payOrder.nomor_antrean}
          onConfirm={handleBayarOrder}
        />
      )}
    </>
  );
}
