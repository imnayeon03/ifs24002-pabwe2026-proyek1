import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Notifikasi from './Notifikasi.jsx';
import api from '../api';

vi.mock('../api', () => ({
  default: { get: vi.fn() },
  errMsg: (e) => e.message || 'Error',
}));

describe('Notifikasi Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notification list when fetched successfully', async () => {
    const notifications = [
      { id: 1, judul: 'Pesanan Selesai', pesan: 'Pesanan #5 sudah selesai', created_at: '2026-10-24 12:00' },
    ];
    api.get.mockResolvedValueOnce({ data: notifications });

    render(<Notifikasi />);

    expect(screen.getByText('Notifikasi')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Pesanan Selesai')).toBeTruthy();
      expect(screen.getByText('Pesanan #5 sudah selesai')).toBeTruthy();
    });
  });

  it('renders empty message when no notifications', async () => {
    api.get.mockResolvedValueOnce({ data: [] });

    render(<Notifikasi />);

    await waitFor(() => {
      expect(screen.getByText('Belum ada notifikasi.')).toBeTruthy();
    });
  });

  it('renders error message when fetch fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Gagal memuat notifikasi'));

    render(<Notifikasi />);

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat notifikasi')).toBeTruthy();
    });
  });
});

describe('Notifikasi Page Component - respons tanpa data', () => {
  it('menganggap data null sebagai daftar kosong', async () => {
    api.get.mockResolvedValueOnce({ data: null });

    render(<Notifikasi />);

    await waitFor(() => {
      expect(screen.getByText('Belum ada notifikasi.')).toBeTruthy();
    });
  });
});
