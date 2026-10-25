import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMenuCatalog } from './useMenuCatalog.js';
import api from '../api';

vi.mock('../api', () => ({ default: { get: vi.fn() } }));

beforeEach(() => {
  vi.useFakeTimers();
  api.get.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useMenuCatalog', () => {
  it('menunda permintaan dan mengirim parameter pencarian', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, nama: 'Nasi' }] });
    const { result } = renderHook(() => useMenuCatalog({ searchQuery: 'nasi', kategori: 'Makanan' }));

    expect(api.get).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(api.get).toHaveBeenCalledWith('/menu', { params: { q: 'nasi', kategori: 'Makanan' } });
    expect(result.current.menu).toEqual([{ id: 1, nama: 'Nasi' }]);
    expect(result.current.error).toBe('');
  });

  it('hanya memanggil API sekali untuk ketikan beruntun', async () => {
    api.get.mockResolvedValue({ data: [] });
    const { rerender } = renderHook(
      ({ searchQuery }) => useMenuCatalog({ searchQuery, kategori: '' }),
      { initialProps: { searchQuery: 'n' } }
    );
    rerender({ searchQuery: 'na' });
    rerender({ searchQuery: 'nas' });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/menu', { params: { q: 'nas', kategori: '' } });
  });

  it('menampilkan pesan error lalu menghapusnya saat permintaan berikutnya berhasil', async () => {
    api.get.mockRejectedValueOnce(new Error('putus'));
    const { result, rerender } = renderHook(
      ({ searchQuery }) => useMenuCatalog({ searchQuery, kategori: '' }),
      { initialProps: { searchQuery: '' } }
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(result.current.error).toBe('Gagal memuat menu');

    api.get.mockResolvedValueOnce({ data: [{ id: 2 }] });
    rerender({ searchQuery: 'es' });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });
    expect(result.current.error).toBe('');
    expect(result.current.menu).toEqual([{ id: 2 }]);
  });
});
