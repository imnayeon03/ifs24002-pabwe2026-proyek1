import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import toast from 'react-hot-toast';
import api from '../api';
import { useOrderActions } from './useOrderActions';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api', () => ({
  default: { post: vi.fn(), patch: vi.fn() },
  errMsg: (e) => e?.response?.data?.error || 'Terjadi kesalahan, coba lagi',
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useOrderActions', () => {
  it('konfirmasiKirim memanggil endpoint kirim lalu onSuccess', async () => {
    api.post.mockResolvedValue({});
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useOrderActions(onSuccess));

    let ok;
    await act(async () => {
      ok = await result.current.konfirmasiKirim(7, 12);
    });

    expect(ok).toBe(true);
    expect(api.post).toHaveBeenCalledWith('/orders/7/kirim');
    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('konfirmasiTerima memanggil endpoint konfirmasi-terima', async () => {
    api.post.mockResolvedValue({});
    const { result } = renderHook(() => useOrderActions());
    await act(async () => {
      await result.current.konfirmasiTerima(3, 5);
    });
    expect(api.post).toHaveBeenCalledWith('/orders/3/konfirmasi-terima');
  });

  it('ubahStatus mengirim status baru lewat PATCH', async () => {
    api.patch.mockResolvedValue({});
    const { result } = renderHook(() => useOrderActions());
    await act(async () => {
      await result.current.ubahStatus(9, 'Diproses');
    });
    expect(api.patch).toHaveBeenCalledWith('/orders/9/status', { status: 'Diproses' });
  });

  it('aksi yang gagal mengembalikan false dan tidak memanggil onSuccess', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Tidak diizinkan' } } });
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useOrderActions(onSuccess));

    let ok;
    await act(async () => {
      ok = await result.current.konfirmasiKirim(1, 1);
    });

    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalledWith('Tidak diizinkan');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('bayarOrder mengirim metode pembayaran', async () => {
    api.post.mockResolvedValue({});
    const { result } = renderHook(() => useOrderActions());
    await act(async () => {
      await result.current.bayarOrder(4, 8, 'QRIS');
    });
    expect(api.post).toHaveBeenCalledWith('/orders/4/bayar', { metode_pembayaran: 'QRIS' });
  });

  it('bayarOrder melempar ulang error agar modal tidak tertutup', async () => {
    const err = { response: { data: { error: 'Saldo kurang' } } };
    api.post.mockRejectedValue(err);
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useOrderActions(onSuccess));

    let caught;
    await act(async () => {
      try {
        await result.current.bayarOrder(4, 8, 'QRIS');
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toBe(err);
    expect(toast.error).toHaveBeenCalledWith('Saldo kurang');
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
