import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenu } from './useMenu';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
  errMsg: (e) => e?.message || 'Error',
}));

describe('useMenu Hook', () => {
  it('returns empty menu when kiosId is not provided', () => {
    const { result } = renderHook(() => useMenu(null));
    expect(result.current.menu).toEqual([]);
  });

  it('saves new menu and updates existing menu', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockResolvedValueOnce({ data: { id: 1 } });
    api.put.mockResolvedValueOnce({ data: { id: 2 } });

    const { result } = renderHook(() => useMenu(5));

    await act(async () => {
      await result.current.saveMenu({ nama: 'Nasi Kuning', harga: '10000', stok: '5', kategori: 'Makanan' });
    });

    expect(api.post).toHaveBeenCalledWith('/menu', {
      nama: 'Nasi Kuning',
      harga: 10000,
      stok: 5,
      kategori: 'Makanan',
    });

    await act(async () => {
      await result.current.saveMenu({ nama: 'Nasi Kuning Special', harga: '12000', stok: '5', kategori: 'Makanan' }, 2);
    });

    expect(api.put).toHaveBeenCalledWith('/menu/2', {
      nama: 'Nasi Kuning Special',
      harga: 12000,
      stok: 5,
      kategori: 'Makanan',
      tersedia: true,
    });
  });

  it('handles saveMenu failure', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.post.mockRejectedValueOnce(new Error('Gagal simpan'));

    const { result } = renderHook(() => useMenu(5));

    let ok;
    await act(async () => {
      ok = await result.current.saveMenu({ nama: 'Gagal Menu', harga: 1000, stok: 1, kategori: 'Makanan' });
    });

    expect(ok).toBeFalsy();
  });

  it('deletes menu item with and without nama', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.delete.mockResolvedValue({ data: { message: 'Menu dihapus' } });

    const { result } = renderHook(() => useMenu(5));

    // Dengan nama
    await act(async () => {
      await result.current.deleteMenu(7, 'Es Jeruk');
    });
    expect(api.delete).toHaveBeenCalledWith('/menu/7');

    // Tanpa nama
    await act(async () => {
      await result.current.deleteMenu(8);
    });
    expect(api.delete).toHaveBeenCalledWith('/menu/8');
  });

  it('handles deleteMenu failure', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.delete.mockRejectedValueOnce(new Error('Gagal hapus'));

    const { result } = renderHook(() => useMenu(5));

    let ok;
    await act(async () => {
      ok = await result.current.deleteMenu(9, 'Batal');
    });

    expect(ok).toBeFalsy();
  });
});
