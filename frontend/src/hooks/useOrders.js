import { useCallback, useState } from 'react';
import api, { errMsg } from '../api';
import { usePolling } from './usePolling';

/**
 * Custom hook untuk fetch & polling daftar pesanan.
 * Menggantikan logika polling yang duplikat di Riwayat.jsx & Dashboard.jsx.
 * @param {number} intervalMs - Interval polling (default 5000ms)
 */
export function useOrders(intervalMs = 5000) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(() => {
    api.get('/orders')
      .then((r) => {
        setOrders(r.data || []);
        setError('');
      })
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, []);

  usePolling(fetchOrders, intervalMs);

  return { orders, loading, error, reload: fetchOrders };
}
