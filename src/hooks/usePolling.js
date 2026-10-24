import { useEffect, useRef } from 'react';

/**
 * Custom hook untuk polling data secara berkala dengan penanganan cleanup yang aman saat unmount.
 * Mencegah memory leak dan eksekusi callback async setelah komponen dilepas.
 * @param {Function} fn - Callback yang dijalankan setiap interval
 * @param {number} intervalMs - Interval dalam milidetik (default 5000)
 * @param {boolean} enabled - Apakah polling aktif (default true)
 */
export function usePolling(fn, intervalMs = 5000, enabled = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    if (!enabled) return undefined;
    let isMounted = true;

    const executeSafe = async () => {
      if (!isMounted) return;
      try {
        await fnRef.current();
      } catch (err) {
        // Log debug error callback polling agar tidak ditelan secara diam-diam
        console.debug('[usePolling] Callback error handled:', err);
      }
    };

    // Jalankan segera sekali di awal
    executeSafe();

    // Atur interval
    const timerId = setInterval(() => {
      if (isMounted) {
        executeSafe();
      }
    }, intervalMs);

    // Cleanup menyeluruh saat unmount atau parameter berubah
    return () => {
      isMounted = false;
      clearInterval(timerId);
    };
  }, [intervalMs, enabled]);
}
