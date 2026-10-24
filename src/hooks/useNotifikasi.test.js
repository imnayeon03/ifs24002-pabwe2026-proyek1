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
  it('handles empty list and triggers toast on subsequent unread notification', async () => {
    vi.useFakeTimers();

    // 1. Polling pertama: list kosong
    api.get.mockResolvedValueOnce({ data: [] });

    renderHook(() => useNotifikasi({ id: 1 }));

    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    // 2. Polling kedua: notifikasi awal (id: 10, dibaca: 1)
    api.get.mockResolvedValueOnce({
      data: [{ id: 10, judul: 'Pesanan Dibuat', pesan: 'Pesanan #10', dibaca: 1 }],
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // 3. Polling ketiga: notifikasi baru muncul (id: 11 > 10, dibaca: 0)
    api.get.mockResolvedValueOnce({
      data: [
        { id: 11, judul: 'Pesanan Dikirim', pesan: 'Pesanan #10 sedang dikirim', dibaca: 0, tipe: 'pengiriman' },
        { id: 10, judul: 'Pesanan Dibuat', pesan: 'Pesanan #10', dibaca: 1 },
      ],
    });

    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(toast).toHaveBeenCalledWith(
      'Pesanan Dikirim: Pesanan #10 sedang dikirim',
      expect.objectContaining({ icon: '🚚', duration: 5000 })
    );

    vi.useRealTimers();
  });

  it('marks single notification as read and handles catch error', async () => {
    api.get.mockResolvedValueOnce({
      data: [{ id: 5, judul: 'Test', pesan: 'Pesan', dibaca: 0 }],
    });
    api.patch.mockResolvedValueOnce({ data: { message: 'ok' } });

    const { result } = renderHook(() => useNotifikasi({ id: 1 }));

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(1);
    });

    // Sukses markRead
    await act(async () => {
      await result.current.markRead(5);
    });
    expect(api.patch).toHaveBeenCalledWith('/notifications/5/baca');
    expect(result.current.unreadCount).toBe(0);

    // Gagal markRead (catch block)
    api.patch.mockRejectedValueOnce(new Error('Network fail'));
    await act(async () => {
      await result.current.markRead(5);
    });
  });

  it('marks all notifications as read and handles catch error', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: 1, judul: 'N1', pesan: 'P1', dibaca: 0 },
        { id: 2, judul: 'N2', pesan: 'P2', dibaca: 0 },
      ],
    });
    api.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    const { result } = renderHook(() => useNotifikasi({ id: 1 }));

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });

    // Sukses markAllRead
    await act(async () => {
      await result.current.markAllRead();
    });
    expect(api.post).toHaveBeenCalledWith('/notifications/baca-semua');
    expect(result.current.unreadCount).toBe(0);

    // Gagal markAllRead (catch block)
    api.post.mockRejectedValueOnce(new Error('Network fail'));
    await act(async () => {
      await result.current.markAllRead();
    });
  });
});

describe('useNotifikasi Hook - banyak notifikasi', () => {
  it('markRead hanya menandai notifikasi yang dipilih', async () => {
    api.get.mockResolvedValueOnce({
      data: [
        { id: 2, judul: 'N2', pesan: 'P2', dibaca: 0 },
        { id: 1, judul: 'N1', pesan: 'P1', dibaca: 0 },
      ],
    });
    api.patch.mockResolvedValueOnce({ data: { message: 'ok' } });

    const { result } = renderHook(() => useNotifikasi({ id: 1 }));
    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });

    await act(async () => {
      await result.current.markRead(2);
    });

    expect(result.current.unreadCount).toBe(1);
    expect(result.current.notifications.find((n) => n.id === 2).dibaca).toBe(1);
    expect(result.current.notifications.find((n) => n.id === 1).dibaca).toBe(0);
  });
});
