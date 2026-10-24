import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAsyncAction } from './useAsyncAction';

/**
 * Alur checkout pesanan dari keranjang.
 */
export function useCheckout(onSuccess) {
  const { loading, run } = useAsyncAction();
  const [error, setError] = useState('');
  const nav = useNavigate();

  const checkout = async ({ cart, jam, metode, statusBayar = 'Sudah Dibayar' }) => {
    setError('');
    try {
      await run(
        () =>
          api.post('/orders', {
            jam_ambil: jam,
            metode_pembayaran: metode,
            status_pembayaran: statusBayar,
            items: cart.map((x) => ({ menu_id: x.menu.id, jumlah: x.jumlah })),
          }),
        {
          success: statusBayar === 'Sudah Dibayar' ? 'Pesanan berhasil dibuat & dibayar!' : 'Pesanan berhasil dibuat!',
          rethrow: true,
        }
      );
    } catch (e) {
      setError(errMsg(e));
      throw e;
    }
    onSuccess?.();
    nav('/riwayat');
    return true;
  };

  return { checkout, loading, error };
}
