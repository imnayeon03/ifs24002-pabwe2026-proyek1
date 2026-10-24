import { useState } from 'react';
import { rupiah } from '../api';
import { useForm, validators } from '../hooks/useForm.js';
import { useCheckout } from '../hooks/useCheckout.js';
import ModalBayar from '../components/ModalBayar.jsx';

const checkoutValidators = {
  jam: validators.required('Jam pengambilan'),
};

export default function Keranjang({ cart, setCart }) {
  const [showModal, setShowModal] = useState(false);
  const { checkout, loading } = useCheckout(() => setCart([]));

  const { values: form, errors, set: setField, validate } = useForm(
    { jam: '12:00', metode: 'QRIS' },
    checkoutValidators
  );

  const total = cart.reduce((s, x) => s + x.menu.harga * x.jumlah, 0);

  const ubah = (id, d) => {
    setCart(
      cart.map((x) =>
        x.menu.id === id
          ? { ...x, jumlah: Math.max(1, Math.min(x.menu.stok, x.jumlah + d)) }
          : x
      )
    );
  };

  const handleBayarModalConfirm = async (metodeDipilih) => {
    if (!validate()) return;
    try {
      await checkout({
        cart,
        jam: form.jam,
        metode: metodeDipilih,
        statusBayar: 'Sudah Dibayar',
      });
      setShowModal(false);
    } catch {
      // toast ditangani oleh useCheckout
    }
  };

  const handlePesanDulu = async () => {
    if (!validate()) return;
    await checkout({
      cart,
      jam: form.jam,
      metode: 'Tunai',
      statusBayar: 'Belum Dibayar',
    });
  };

  if (!cart.length) return <p className="muted">Keranjang kosong.</p>;

  return (
    <div className="card narrow">
      <h2>Keranjang</h2>
      {cart.map((x) => (
        <div className="row" key={x.menu.id}>
          <span>
            {x.menu.nama} <small className="muted">({x.menu.kios_nama})</small>
          </span>
          <span>
            <button type="button" onClick={() => ubah(x.menu.id, -1)}>-</button>{' '}
            {x.jumlah}{' '}
            <button type="button" onClick={() => ubah(x.menu.id, 1)}>+</button>{' '}
            {rupiah(x.menu.harga * x.jumlah)}{' '}
            <button
              type="button"
              onClick={() => setCart(cart.filter((c) => c.menu.id !== x.menu.id))}
              title="Hapus item"
            >
              ✕
            </button>
          </span>
        </div>
      ))}

      <div>
        <label htmlFor="jam_ambil">Jam Pengambilan
          <input
            id="jam_ambil"
            name="jam_ambil"
            type="time"
            value={form.jam}
            onChange={setField('jam')}
            required
            aria-invalid={!!errors.jam}
          />
        </label>
        {errors.jam && <p className="error small">{errors.jam}</p>}
      </div>

      <label htmlFor="metode_pembayaran">Metode Pembayaran
        <select
          id="metode_pembayaran"
          name="metode_pembayaran"
          value={form.metode}
          onChange={setField('metode')}
        >
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        <button
          type="button"
          className="primary"
          onClick={() => {
            if (validate()) setShowModal(true);
          }}
          disabled={loading}
        >
          {loading ? 'Memproses...' : '💳 Bayar & Buat Pesanan'}
        </button>
        <button
          type="button"
          onClick={handlePesanDulu}
          disabled={loading}
        >
          Pesan Dulu (Bayar Nanti)
        </button>
      </div>

      <ModalBayar
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        total={total}
        onConfirm={handleBayarModalConfirm}
        loading={loading}
      />
    </div>
  );
}
