import { useState } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';

/**
 * Custom hook untuk aksi-aksi pesanan (bayar, kirim, terima, ubah status).
 * Memisahkan pemanggilan API pesanan dari komponen presentasional.
 */
export function useOrderActions(onSuccess) {
  const [loadingAction, setLoadingAction] = useState(false);

  const bayarOrder = async (orderId, orderNo, metode) => {
    setLoadingAction(true);
    try {
      await api.post(`/orders/${orderId}/bayar`, { metode_pembayaran: metode });
      toast.success(`Pembayaran #${orderNo} berhasil! Penjual telah menerima notifikasi.`);
      if (onSuccess) onSuccess();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      throw e;
    } finally {
      setLoadingAction(false);
    }
  };

  const konfirmasiKirim = async (orderId, orderNo) => {
    setLoadingAction(true);
    try {
      await api.post(`/orders/${orderId}/kirim`);
      toast.success(`Pesanan #${orderNo} berhasil dikonfirmasi sudah dikirim!`);
      if (onSuccess) onSuccess();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setLoadingAction(false);
    }
  };

  const konfirmasiTerima = async (orderId, orderNo) => {
    setLoadingAction(true);
    try {
      await api.post(`/orders/${orderId}/konfirmasi-terima`);
      toast.success(`Pesanan #${orderNo} berhasil dikonfirmasi diterima. Terima kasih!`);
      if (onSuccess) onSuccess();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setLoadingAction(false);
    }
  };

  const ubahStatus = async (orderId, status) => {
    setLoadingAction(true);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Status pesanan diubah ke "${status}"`);
      if (onSuccess) onSuccess();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setLoadingAction(false);
    }
  };

  return {
    loadingAction,
    bayarOrder,
    konfirmasiKirim,
    konfirmasiTerima,
    ubahStatus,
  };
}
