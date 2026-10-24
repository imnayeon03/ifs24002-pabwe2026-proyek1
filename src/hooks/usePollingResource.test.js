import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { usePollingResource } from './usePollingResource';

vi.mock('../api', () => ({
  errMsg: (e) => e?.response?.data?.error || 'Terjadi kesalahan, coba lagi',
}));

// interval panjang: yang diuji adalah pemanggilan pertama & reload manual
const OPTIONS = { intervalMs: 60_000 };

describe('usePollingResource', () => {
  it('memuat data lalu mematikan loading', async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1 }]);
    const { result } = renderHook(() => usePollingResource(fetcher, OPTIONS));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.error).toBe('');
  });

  it('mengisi error dari server dan tetap mematikan loading', async () => {
    const fetcher = vi.fn().mockRejectedValue({ response: { data: { error: 'Server error' } } });
    const { result } = renderHook(() => usePollingResource(fetcher, OPTIONS));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Server error');
    expect(result.current.data).toEqual([]);
  });

  it('memakai array kosong jika fetcher mengembalikan null', async () => {
    const fetcher = vi.fn().mockResolvedValue(null);
    const { result } = renderHook(() => usePollingResource(fetcher, OPTIONS));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual([]);
  });

  it('memanggil onData setiap data baru diterima', async () => {
    const onData = vi.fn();
    const fetcher = vi.fn().mockResolvedValue([{ id: 5 }]);
    renderHook(() => usePollingResource(fetcher, { ...OPTIONS, onData }));
    await waitFor(() => expect(onData).toHaveBeenCalledWith([{ id: 5 }]));
  });

  it('tidak memanggil fetcher saat enabled = false', () => {
    const fetcher = vi.fn().mockResolvedValue([]);
    const { result } = renderHook(() => usePollingResource(fetcher, { ...OPTIONS, enabled: false }));
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  it('reload mengambil ulang data', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce([{ id: 1 }]).mockResolvedValueOnce([{ id: 2 }]);
    const { result } = renderHook(() => usePollingResource(fetcher, OPTIONS));
    await waitFor(() => expect(result.current.data).toEqual([{ id: 1 }]));

    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.data).toEqual([{ id: 2 }]);
  });
});
