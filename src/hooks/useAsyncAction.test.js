import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useAsyncAction } from './useAsyncAction';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api', () => ({
  errMsg: (e) => e?.response?.data?.error || 'Terjadi kesalahan, coba lagi',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAsyncAction', () => {
  it('menampilkan toast sukses dan mengembalikan true', async () => {
    const { result } = renderHook(() => useAsyncAction());
    let ok;
    await act(async () => {
      ok = await result.current.run(async () => {}, { success: 'Berhasil' });
    });
    expect(ok).toBe(true);
    expect(toast.success).toHaveBeenCalledWith('Berhasil');
    expect(result.current.loading).toBe(false);
  });

  it('tidak menampilkan toast sukses jika pesan tidak diberikan', async () => {
    const { result } = renderHook(() => useAsyncAction());
    await act(async () => {
      await result.current.run(async () => {});
    });
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('menampilkan toast error dan mengembalikan false saat gagal', async () => {
    const { result } = renderHook(() => useAsyncAction());
    let ok;
    await act(async () => {
      ok = await result.current.run(async () => {
        throw { response: { data: { error: 'Stok habis' } } };
      });
    });
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Stok habis');
    expect(result.current.loading).toBe(false);
  });

  it('melempar ulang error jika rethrow = true (tetap menampilkan toast)', async () => {
    const { result } = renderHook(() => useAsyncAction());
    const boom = new Error('gagal');
    let caught;
    await act(async () => {
      try {
        await result.current.run(async () => { throw boom; }, { rethrow: true });
      } catch (e) {
        caught = e;
      }
    });
    expect(caught).toBe(boom);
    expect(toast.error).toHaveBeenCalledWith('Terjadi kesalahan, coba lagi');
  });

  it('loading bernilai true selama aksi berjalan', async () => {
    let resolveAction;
    const pending = new Promise((resolve) => { resolveAction = resolve; });
    const { result } = renderHook(() => useAsyncAction());

    let promise;
    act(() => {
      promise = result.current.run(() => pending);
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveAction();
      await promise;
    });
    expect(result.current.loading).toBe(false);
  });
});
