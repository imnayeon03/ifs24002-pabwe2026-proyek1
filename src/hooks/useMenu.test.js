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
}));

describe('useMenu Hook', () => {
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

  it('deletes menu item', async () => {
    api.get.mockResolvedValue({ data: [] });
    api.delete.mockResolvedValueOnce({ data: { message: 'Menu dihapus' } });

    const { result } = renderHook(() => useMenu(5));

    await act(async () => {
      await result.current.deleteMenu(7, 'Es Jeruk');
    });

    expect(api.delete).toHaveBeenCalledWith('/menu/7');
  });
});
