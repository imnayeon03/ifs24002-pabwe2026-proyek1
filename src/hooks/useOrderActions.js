import api from '../api';
import { useAsyncAction } from './useAsyncAction';

/**
 * Aksi-aksi pesanan (bayar, kirim, terima, ubah status).
 * Semua aksi berbagi satu pola lewat useAsyncAction + helper `exec`.
 */
export function useOrderActions(onSuccess) {
  const { loading: loadingAction, run } = useAsyncAction();

  const exec = async (request, success, options) => {
    const ok = await run(request, { success, ...options });
    if (ok) onSuccess?.();
    return ok;
  };

  // rethrow: true agar pemanggil (modal bayar) tahu pembayaran gagal dan tidak menutup modal
  const bayarOrder = (orderId, orderNo, metode) =>
    exec(
      () => api.post(`/orders/${orderId}/bayar`, { metode_pembayaran: metode }),
      `Pembayaran #${orderNo} berhasil! Penjual telah menerima notifikasi.`,
      { rethrow: true }
    );

  const konfirmasiKirim = (orderId, orderNo) =>
    exec(
      () => api.post(`/orders/${orderId}/kirim`),
      `Pesanan #${orderNo} berhasil dikonfirmasi sudah dikirim!`
    );

  const konfirmasiTerima = (orderId, orderNo) =>
    exec(
      () => api.post(`/orders/${orderId}/konfirmasi-terima`),
      `Pesanan #${orderNo} berhasil dikonfirmasi diterima. Terima kasih!`
    );

  const ubahStatus = (orderId, status) =>
    exec(
      () => api.patch(`/orders/${orderId}/status`, { status }),
      `Status pesanan diubah ke "${status}"`
    );

  return { loadingAction, bayarOrder, konfirmasiKirim, konfirmasiTerima, ubahStatus };
}
