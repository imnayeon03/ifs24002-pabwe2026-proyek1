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
            items: cart.map((item) => ({ menu_id: item.menu.id, jumlah: item.jumlah })),
          }),
        {
          success: statusBayar === 'Sudah Dibayar' ? 'Pesanan berhasil dibuat & dibayar!' : 'Pesanan berhasil dibuat!',
          rethrow: true,
        }
      );
    } catch (requestError) {
      setError(errMsg(requestError));
      throw requestError;
    }
    onSuccess?.();
    nav('/riwayat');
    return true;
  };

  return { checkout, loading, error };
}
