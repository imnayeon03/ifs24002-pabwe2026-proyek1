import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg, rupiah } from '../api';
import ModalBayar from '../components/ModalBayar.jsx';

export default function Keranjang({ cart, setCart }) {
  const [jam, setJam] = useState('12:00');
  const [metode, setMetode] = useState('QRIS');
  const [showModal, setShowModal] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const total = cart.reduce((s, x) => s + x.menu.harga * x.jumlah, 0);

  const ubah = (id, d) => setCart(cart.map((x) => (x.menu.id === id ? { ...x, jumlah: Math.max(1, Math.min(x.menu.stok, x.jumlah + d)) } : x)));

  async function checkout(statusBayar = 'Sudah Dibayar', metodeDipilih = metode) {
    setErr('');
    setLoading(true);
    try {
      await api.post('/orders', {
        jam_ambil: jam,
        metode_pembayaran: metodeDipilih,
        status_pembayaran: statusBayar,
        items: cart.map((x) => ({ menu_id: x.menu.id, jumlah: x.jumlah }))
      });
      setCart([]);
      setShowModal(false);
      nav('/riwayat');
    } catch (e) {
      setErr(errMsg(e));
      setLoading(false);
      throw e;
    }
  }

  if (!cart.length) return <p className="muted">Keranjang kosong.</p>;

  return (
    <div className="card narrow">
      <h2>Keranjang</h2>
      {cart.map((x) => (
        <div className="row" key={x.menu.id}>
          <span>{x.menu.nama} <small className="muted">({x.menu.kios_nama})</small></span>
          <span>
            <button type="button" onClick={() => ubah(x.menu.id, -1)}>−</button> {x.jumlah} <button type="button" onClick={() => ubah(x.menu.id, 1)}>+</button>
            {' '}{rupiah(x.menu.harga * x.jumlah)}
            <button type="button" onClick={() => setCart(cart.filter((c) => c.menu.id !== x.menu.id))}>✕</button>
          </span>
        </div>
      ))}

      <label>Jam Pengambilan
        <input type="time" value={jam} onChange={(e) => setJam(e.target.value)} required />
      </label>

      <label>Metode Pembayaran
        <select value={metode} onChange={(e) => setMetode(e.target.value)}>
          <option value="QRIS">QRIS (GoPay, OVO, Dana, BCA Mobile)</option>
          <option value="Transfer Bank BCA">Transfer Bank (BCA VA)</option>
          <option value="Transfer Bank Mandiri">Transfer Bank (Mandiri VA)</option>
          <option value="GoPay / OVO / Dana">E-Wallet (GoPay / OVO / Dana)</option>
          <option value="Tunai">Tunai di Tempat</option>
        </select>
      </label>

      <p className="price">Total: {rupiah(total)}</p>
      <p className="muted small">
        Setelah pembayaran, penjual akan langsung menerima notifikasi pembayaran dan mempersiapkan pesanan Anda.
      </p>

      {err && <p className="error">{err}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          className="primary"
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          💳 Bayar & Buat Pesanan
        </button>
        <button
          type="button"
          onClick={() => checkout('Belum Dibayar', 'Tunai')}
          disabled={loading}
        >
          Pesan Dulu (Bayar Nanti)
        </button>
      </div>

      <ModalBayar
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        total={total}
        onConfirm={(metodeDipilih) => checkout('Sudah Dibayar', metodeDipilih)}
      />
    </div>
  );
}
