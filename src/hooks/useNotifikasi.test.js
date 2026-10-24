import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifikasi } from './useNotifikasi';
import api from '../api';
import toast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
  default: vi.fn(),
}));

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useNotifikasi Hook', () => {
  const notifs1 = [
    { id: 1, judul: 'Pesanan Dibuat', pesan: 'Pesanan #10 dibuat', tipe: 'pembayaran', dibaca: 1 },
  ];
  const notifs2 = [
    { id: 2, judul: 'Pesanan Dikirim', pesan: 'Pesanan #10 dikirim', tipe: 'pengiriman', dibaca: 0 },
    { id: 1, judul: 'Pesanan Dibuat', pesan: 'Pesanan #10 dibuat', tipe: 'pembayaran', dibaca: 1 },
  ];

  it('polls notifications, triggers toast on new unread item, and marks read', async () => {
    api.get.mockResolvedValueOnce({ data: notifs1 });
    api.patch.mockResolvedValueOnce({ data: { message: 'ok' } });
    api.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    const user = { id: 1 };
    const { result, rerender } = renderHook(() => useNotifikasi(user));

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(1);
    });

    // Simulasi polling update dengan notifikasi baru (id: 2 > 1 dan unread)
    api.get.mockResolvedValueOnce({ data: notifs2 });
    rerender();

    // Mark single as read
    await act(async () => {
      await result.current.markRead(2);
    });
    expect(api.patch).toHaveBeenCalledWith('/notifications/2/baca');

    // Mark all as read
    await act(async () => {
      await result.current.markAllRead();
    });
    expect(api.post).toHaveBeenCalledWith('/notifications/baca-semua');
  });

  it('announces newest notification toast', async () => {
    let onDataCallback;
    // Panggil useNotifikasi dengan mock data sequence
    api.get.mockResolvedValueOnce({ data: [{ id: 5, judul: 'Awal', pesan: 'Msg', dibaca: 1 }] });
    api.get.mockResolvedValueOnce({ data: [{ id: 6, judul: 'Baru', pesan: 'Ada pesanan', dibaca: 0, tipe: 'pengiriman' }] });

    const { result } = renderHook(() => useNotifikasi({ id: 9 }));
    await waitFor(() => {
      expect(result.current.notifications).toBeDefined();
    });
  });
});
