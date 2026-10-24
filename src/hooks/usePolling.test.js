import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePolling } from './usePolling';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('usePolling', () => {
  it('menjalankan callback segera lalu setiap interval', async () => {
    const fn = vi.fn();
    renderHook(() => usePolling(fn, 1000));
    expect(fn).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('tidak berjalan saat enabled = false', async () => {
    const fn = vi.fn();
    renderHook(() => usePolling(fn, 1000, false));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(fn).not.toHaveBeenCalled();
  });

  it('berhenti setelah unmount', async () => {
    const fn = vi.fn();
    const { unmount } = renderHook(() => usePolling(fn, 1000));
    unmount();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('tidak berhenti walau callback melempar asynchronous error', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('jaringan putus'));
    renderHook(() => usePolling(fn, 1000));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('menangkap synchronous error yang dilempar callback tanpa crash', () => {
    const errorFn = vi.fn(() => {
      throw new Error('sync error test');
    });
    expect(() => renderHook(() => usePolling(errorFn, 1000))).not.toThrow();
    expect(errorFn).toHaveBeenCalledTimes(1);
  });

  it('aman saat unmount ketika async callback masih pending', async () => {
    let resolvePromise;
    const slowFn = vi.fn(() => new Promise((resolve) => { resolvePromise = resolve; }));

    const { unmount } = renderHook(() => usePolling(slowFn, 1000));
    expect(slowFn).toHaveBeenCalledTimes(1);

    unmount();
    if (resolvePromise) resolvePromise();
  });

  it('selalu memakai versi callback terbaru tanpa mereset timer', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ fn }) => usePolling(fn, 1000), {
      initialProps: { fn: first },
    });
    rerender({ fn: second });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });
});
