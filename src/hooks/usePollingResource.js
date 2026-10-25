import { useCallback, useEffect, useRef, useState } from 'react';
import { errMsg } from '../api';
import { usePolling } from './usePolling';

const EMPTY = [];

/**
 * Fetch + polling + state (data/loading/error) dalam satu hook.
 * Menggantikan blok `usePolling` + `api.get().then().catch()` yang sebelumnya
 * diulang di useOrders, useMenu, dan useNotifikasi.
 *
 * @param {() => Promise<any>} fetcher - fungsi yang mengembalikan data
 * @param {Object} [options]
 * @param {number} [options.intervalMs=5000]
 * @param {boolean} [options.enabled=true]
 * @param {(data:any) => void} [options.onData] - dipanggil setiap data baru diterima
 */
export function usePollingResource(fetcher, { intervalMs = 5000, enabled = true, onData } = {}) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState('');

  const fetcherRef = useRef(fetcher);
  const onDataRef = useRef(onData);

  useEffect(() => {
    fetcherRef.current = fetcher;
    onDataRef.current = onData;
  }, [fetcher, onData]);

  const load = useCallback(async () => {
    try {
      const result = (await fetcherRef.current()) ?? EMPTY;
      setData(result);
      setError('');
      onDataRef.current?.(result);
    } catch (requestError) {
      setError(errMsg(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  usePolling(load, intervalMs, enabled);

  return { data, setData, loading, error, reload: load };
}
