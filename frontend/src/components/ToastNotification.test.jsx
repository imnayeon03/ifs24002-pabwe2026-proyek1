import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastNotification from './ToastNotification.jsx';

describe('ToastNotification Component', () => {
  it('renders nothing when toast is null', () => {
    const { container } = render(<ToastNotification toast={null} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders toast content and triggers close on click', () => {
    const onClose = vi.fn();
    const toast = { judul: 'Sukses', pesan: 'Pesanan berhasil', tipe: 'pembayaran' };

    render(<ToastNotification toast={toast} onClose={onClose} />);

    expect(screen.getByText('Sukses')).toBeTruthy();
    expect(screen.getByText('Pesanan berhasil')).toBeTruthy();

    const closeBtn = screen.getByRole('button', { name: 'Tutup notifikasi' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
