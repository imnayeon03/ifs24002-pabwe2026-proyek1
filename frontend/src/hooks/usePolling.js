import { useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook untuk polling data dengan interval tertentu.
 * @param {Function} fn - Fungsi yang dipanggil saat polling (harus stabil/tidak berubah)
 * @param {number} intervalMs - Interval polling dalam ms (default 5000)
 * @param {boolean} enabled - Aktifkan/nonaktifkan polling (default true)
 */
export function usePolling(fn, intervalMs = 5000, enabled = true) {
  const fnRef = useRef(fn);
  fnRef.current = fn; // selalu pakai versi terbaru tanpa perlu re-subscribe

  useEffect(() => {
    if (!enabled) return;
    // Panggil sekali langsung
    fnRef.current();
    const t = setInterval(() => fnRef.current(), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs, enabled]);
}
