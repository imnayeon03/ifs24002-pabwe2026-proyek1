import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { useEscapeKey } from './useEscapeKey.js';

describe('useEscapeKey', () => {
  it('memanggil callback saat Escape ditekan', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it('mengabaikan tombol lain', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape));
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('tidak memasang listener saat enabled = false', () => {
    const onEscape = vi.fn();
    renderHook(() => useEscapeKey(onEscape, false));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });

  it('melepas listener saat unmount', () => {
    const onEscape = vi.fn();
    const { unmount } = renderHook(() => useEscapeKey(onEscape));
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onEscape).not.toHaveBeenCalled();
  });
});
