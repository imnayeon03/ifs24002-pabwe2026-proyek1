import api from '../api';
import { usePollingResource } from './usePollingResource';

const fetchOrders = () => api.get('/orders').then((response) => response.data);

/**
 * Daftar pesanan dengan polling berkala (dipakai Riwayat & Dashboard).
 * @param {number} intervalMs - Interval polling (default 5000ms)
 */
export function useOrders(intervalMs = 5000) {
  const { data, loading, error, reload } = usePollingResource(fetchOrders, { intervalMs });
  return { orders: data, loading, error, reload };
}
