import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotifikasi } from './useNotifikasi';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('useNotifikasi Hook', () => {
  const notifs = [
    { id: 1, judul: 'A', pesan: 'Pesanan dibuat', dibaca: 0 },
    { id: 2, judul: 'B', pesan: 'Pesanan diantar', dibaca: 1 },
  ];

  it('polls notifications and marks single or all as read', async () => {
    api.get.mockResolvedValue({ data: notifs });
    api.patch.mockResolvedValueOnce({ data: { message: 'ok' } });
    api.post.mockResolvedValueOnce({ data: { message: 'ok' } });

    const user = { id: 1 };
    const { result } = renderHook(() => useNotifikasi(user));

    await waitFor(() => {
      expect(result.current.notifications.length).toBe(2);
      expect(result.current.unreadCount).toBe(1);
    });

    // Mark single as read
    await act(async () => {
      await result.current.markRead(1);
    });
    expect(api.patch).toHaveBeenCalledWith('/notifications/1/baca');

    // Mark all as read
    await act(async () => {
      await result.current.markAllRead();
    });
    expect(api.post).toHaveBeenCalledWith('/notifications/baca-semua');
  });
});
