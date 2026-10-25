import { useEffect } from 'react';

/**
 * Memanggil `onEscape` saat tombol Escape ditekan selama `enabled` bernilai true.
 * Dipakai modal; listener dipasang di document (bukan di elemen non-interaktif)
 * supaya tetap accessible dan tidak melanggar aturan a11y SonarQube.
 *
 * @param {() => void} onEscape - Callback saat Escape ditekan
 * @param {boolean} [enabled=true] - Aktifkan/nonaktifkan listener
 */
export function useEscapeKey(onEscape, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, enabled]);
}
