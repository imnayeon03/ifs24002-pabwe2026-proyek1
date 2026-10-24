import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NotifikasiDropdown from './NotifikasiDropdown.jsx';

describe('NotifikasiDropdown Component', () => {
  const notifications = [
    { id: 1, judul: 'Pesanan Selesai', pesan: 'Pesanan #10 selesai', tipe: 'penerimaan', dibaca: 0, created_at: '10:00' },
    { id: 2, judul: 'Pesanan Dikirim', pesan: 'Pesanan #11 dikirim', tipe: 'pengiriman', dibaca: 1, created_at: '09:00' },
  ];

  it('renders nothing when closed', () => {
    const { container } = render(
      <NotifikasiDropdown
        isOpen={false}
        onClose={vi.fn()}
        notifications={notifications}
        onMarkAllRead={vi.fn()}
        onMarkRead={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders list with unread items and triggers mark read actions', () => {
    const onMarkRead = vi.fn();
    const onMarkAllRead = vi.fn();
    const onClose = vi.fn();

    render(
      <NotifikasiDropdown
        isOpen={true}
        onClose={onClose}
        notifications={notifications}
        onMarkAllRead={onMarkAllRead}
        onMarkRead={onMarkRead}
      />
    );

    expect(screen.getByText('1 baru')).toBeTruthy();
    expect(screen.getByText('Pesanan Selesai')).toBeTruthy();
    expect(screen.getByText('Pesanan Dikirim')).toBeTruthy();

    // Klik notifikasi belum dibaca -> panggil onMarkRead
    fireEvent.click(screen.getByText('Pesanan Selesai'));
    expect(onMarkRead).toHaveBeenCalledWith(1);

    // Klik tombol tandai semua dibaca
    const markAllBtn = screen.getByText('Tandai semua dibaca');
    fireEvent.click(markAllBtn);
    expect(onMarkAllRead).toHaveBeenCalled();

    // Tutup dropdown
    const closeBtn = screen.getByRole('button', { name: 'Tutup notifikasi' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders empty message when no notifications', () => {
    render(
      <NotifikasiDropdown
        isOpen={true}
        onClose={vi.fn()}
        notifications={[]}
        onMarkAllRead={vi.fn()}
        onMarkRead={vi.fn()}
      />
    );

    expect(screen.getByText('Belum ada notifikasi saat ini.')).toBeTruthy();
  });
});
