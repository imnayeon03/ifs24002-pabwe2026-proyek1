import { useEffect, useRef } from 'react';

const FOCUSABLE = ['a[href]', 'button', 'input', 'select', 'textarea', '[tabindex]']
  .map((selector) => `${selector}:not([disabled]):not([tabindex="-1"])`)
  .join(',');

/**
 * Menjaga fokus keyboard tetap di dalam dialog selama `enabled` bernilai true.
 *
 * - Saat aktif: fokus dipindah ke elemen interaktif pertama di dalam dialog
 *   (atau ke dialog itu sendiri bila tidak ada, sehingga dialog harus punya tabIndex={-1}).
 * - Tab dan Shift+Tab berputar di dalam dialog, tidak keluar ke halaman di belakangnya.
 * - Saat nonaktif atau unmount: fokus dikembalikan ke elemen yang memicu dialog.
 *
 * Pasang ref yang dikembalikan pada elemen dialog; elemen itu sudah ada di DOM
 * setiap kali `enabled` bernilai true.
 *
 * @param {boolean} [enabled=true]
 * @returns {import('react').RefObject<HTMLElement|null>}
 */
export function useFocusTrap(enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const node = ref.current;
    const previouslyFocused = document.activeElement;
    const getFocusable = () => Array.from(node.querySelectorAll(FOCUSABLE));

    (getFocusable()[0] ?? node).focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }

      const edge = e.shiftKey ? items[0] : items.at(-1);
      const wrapTo = e.shiftKey ? items.at(-1) : items[0];
      const active = document.activeElement;

      if (active === edge || !node.contains(active)) {
        e.preventDefault();
        wrapTo.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.focus();
    };
  }, [enabled]);

  return ref;
}
