import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';

/**
 * Custom hook untuk alur checkout pesanan dari keranjang.
 * Memisahkan logika API & navigasi dari halaman Keranjang.jsx.
 */
export function useCheckout(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const nav = useNavigate();

  const checkout = async ({ cart, jam, metode, statusBayar = 'Sudah Dibayar' }) => {
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        jam_ambil: jam,
        metode_pembayaran: metode,
        status_pembayaran: statusBayar,
        items: cart.map((x) => ({ menu_id: x.menu.id, jumlah: x.jumlah })),
      });
      toast.success(statusBayar === 'Sudah Dibayar' ? 'Pesanan berhasil dibuat & dibayar!' : 'Pesanan berhasil dibuat!');
      if (onSuccess) onSuccess();
      nav('/riwayat');
      return true;
    } catch (e) {
      const msg = errMsg(e);
      setError(msg);
      toast.error(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}
