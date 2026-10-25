import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchNotifications, useNotificationList } from './useNotificationList.js';
import api from '../api';

vi.mock('../api', () => ({
  default: { get: vi.fn() },
  errMsg: (error) => error?.message || 'Error',
}));

beforeEach(() => {
  api.get.mockReset();
});

describe('useNotificationList', () => {
  it('fetchNotifications mengembalikan isi data dari API', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
    await expect(fetchNotifications()).resolves.toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith('/notifications');
  });

  it('mengisi daftar notifikasi', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, judul: 'A' }] });
    const { result } = renderHook(() => useNotificationList());
    await waitFor(() => expect(result.current.notifications).toHaveLength(1));
    expect(result.current.error).toBe('');
  });

  it('mengisi pesan error jika gagal', async () => {
    api.get.mockRejectedValue(new Error('Gagal memuat notifikasi'));
    const { result } = renderHook(() => useNotificationList());
    await waitFor(() => expect(result.current.error).toBe('Gagal memuat notifikasi'));
    expect(result.current.notifications).toEqual([]);
  });
});
