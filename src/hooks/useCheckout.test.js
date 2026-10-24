import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCheckout } from './useCheckout';
import api from '../api';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../api', () => ({
  default: { post: vi.fn() },
  errMsg: (e) => e.message || 'Error',
}));

describe('useCheckout Hook', () => {
  it('successfully creates order and navigates to riwayat', async () => {
    api.post.mockResolvedValueOnce({ data: { id: 1 } });
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useCheckout(onSuccess));

    let ok;
    await act(async () => {
      ok = await result.current.checkout({
        cart: [{ menu: { id: 10 }, jumlah: 2 }],
        jam: '12:00',
        metode: 'QRIS',
        statusBayar: 'Sudah Dibayar',
      });
    });

    expect(ok).toBe(true);
    expect(api.post).toHaveBeenCalledWith('/orders', expect.objectContaining({
      jam_ambil: '12:00',
      metode_pembayaran: 'QRIS',
      status_pembayaran: 'Sudah Dibayar',
      items: [{ menu_id: 10, jumlah: 2 }],
    }));
    expect(onSuccess).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/riwayat');
  });

  it('handles checkout error and sets error state', async () => {
    api.post.mockRejectedValueOnce(new Error('Stok habis'));

    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      try {
        await result.current.checkout({
          cart: [{ menu: { id: 10 }, jumlah: 2 }],
          jam: '12:00',
          metode: 'Tunai',
          statusBayar: 'Belum Dibayar',
        });
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('Stok habis');
  });
});
