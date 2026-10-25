import { useState } from 'react';
import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { useForm, validators } from '../hooks/useForm.js';
import { useCheckout } from '../hooks/useCheckout.js';
import ModalBayar from '../components/ModalBayar.jsx';
import { DEFAULT_METODE, METODE_TUNAI, PAYMENT_METHODS } from '../config/paymentMethods.js';

const checkoutValidators = {
  jam: validators.required('Jam pengambilan'),
};

export default function Keranjang({ cart, setCart }) {
  const [showModal, setShowModal] = useState(false);
  const { checkout, loading } = useCheckout(() => setCart([]));

  const { values: form, errors, set: setField, validate } = useForm(
    { jam: '12:00', metode: DEFAULT_METODE },
    checkoutValidators
  );

  const total = cart.reduce((sum, item) => sum + item.menu.harga * item.jumlah, 0);

  const ubahJumlah = (menuId, delta) => {
    setCart(
      cart.map((item) =>
        item.menu.id === menuId
          ? { ...item, jumlah: Math.max(1, Math.min(item.menu.stok, item.jumlah + delta)) }
          : item
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
      metode: METODE_TUNAI,
      statusBayar: 'Belum Dibayar',
    });
  };

  if (cart.length === 0) return (
    <section>
      <h1>Keranjang</h1>
      <p className="muted">Keranjang kosong.</p>
    </section>
  );

  return (
    <div className="card narrow">
      <h1>Keranjang Belanja</h1>
      {cart.map((item) => (
        <div className="row" key={item.menu.id}>
          <span>
            {item.menu.nama} <small className="muted">({item.menu.kios_nama})</small>
          </span>
          <span>
            <button type="button" onClick={() => ubahJumlah(item.menu.id, -1)}>-</button>{' '}
            {item.jumlah}{' '}
            <button type="button" onClick={() => ubahJumlah(item.menu.id, 1)}>+</button>{' '}
            {rupiah(item.menu.harga * item.jumlah)}{' '}
            <button
              type="button"
              onClick={() => setCart(cart.filter((cartItem) => cartItem.menu.id !== item.menu.id))}
              title="Hapus item"
            >
              ✕
            </button>
          </span>
        </div>
      ))}

      <div>
        <label htmlFor="jam_ambil">Jam Pengambilan</label>
        <input
          id="jam_ambil"
          name="jam_ambil"
          type="time"
          value={form.jam}
          onChange={setField('jam')}
          required
          aria-invalid={!!errors.jam}
        />
        {errors.jam && <p className="error small">{errors.jam}</p>}
      </div>

      <div>
        <label htmlFor="metode_pembayaran">Metode Pembayaran</label>
        <select
          id="metode_pembayaran"
          name="metode_pembayaran"
          aria-label="Metode Pembayaran"
          value={form.metode}
          onChange={setField('metode')}
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>{method.label}</option>
          ))}
        </select>
      </div>

      <p className="price">Total: {rupiah(total)}</p>
      <p className="muted small">
        Setelah pembayaran, penjual akan langsung menerima notifikasi pembayaran dan mempersiapkan pesanan Anda.
      </p>

      <div className="cart-actions">
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

Keranjang.propTypes = {
  cart: PropTypes.arrayOf(
    PropTypes.shape({
      menu: PropTypes.shape({
        id: PropTypes.number.isRequired,
        nama: PropTypes.string.isRequired,
        harga: PropTypes.number.isRequired,
        stok: PropTypes.number.isRequired,
        kios_nama: PropTypes.string,
      }).isRequired,
      jumlah: PropTypes.number.isRequired,
    })
  ).isRequired,
  setCart: PropTypes.func.isRequired,
};
