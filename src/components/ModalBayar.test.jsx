import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModalBayar from './ModalBayar.jsx';
import { PAYMENT_METHODS } from '../config/paymentMethods.js';

vi.mock('../api', () => ({
  rupiah: (n) => `Rp${n}`,
}));

describe('ModalBayar Component', () => {
  const baseProps = {
    isOpen: true,
    onClose: vi.fn(),
    total: 35000,
    orderNo: 7,
    onConfirm: vi.fn(),
    loading: false,
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<ModalBayar {...baseProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with QRIS view by default', () => {
    render(<ModalBayar {...baseProps} />);

    expect(screen.getByText('Pembayaran Pesanan #7')).toBeTruthy();
    expect(screen.getByText('QRIS Standar Pembayaran Nasional')).toBeTruthy();
    expect(screen.getByText('Rp35000')).toBeTruthy();
  });

  it('switches views based on selected payment method', () => {
    render(<ModalBayar {...baseProps} />);

    const select = screen.getByLabelText(/Pilih Metode Pembayaran/i);

    // Transfer BCA
    fireEvent.change(select, { target: { value: 'Transfer Bank BCA' } });
    expect(screen.getByText(/Nomor Virtual Account Transfer Bank BCA/i)).toBeTruthy();

    // E-Wallet
    fireEvent.change(select, { target: { value: 'GoPay / OVO / Dana' } });
    expect(screen.getByText(/Nomor E-Wallet/i)).toBeTruthy();

    // Tunai
    fireEvent.change(select, { target: { value: 'Tunai' } });
    expect(screen.getByText(/Pembayaran Tunai di Lokasi Kios/i)).toBeTruthy();
  });

  it('handles submission and close actions', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ModalBayar {...baseProps} onConfirm={onConfirm} onClose={onClose} />);

    const closeBtn = screen.getByRole('button', { name: '✕' });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();

    const submitBtn = screen.getByRole('button', { name: /Konfirmasi Sudah Membayar/i });
    fireEvent.click(submitBtn);
    expect(onConfirm).toHaveBeenCalledWith('QRIS');
  });

  it('closes via backdrop click and Escape key', () => {
    const onClose = vi.fn();
    const { container } = render(<ModalBayar {...baseProps} onClose={onClose} />);

    fireEvent.click(container.querySelector('.modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('handles loading state', () => {
    render(<ModalBayar {...baseProps} loading={true} />);

    const submitBtn = screen.getByRole('button', { name: 'Memproses...' });
    expect(submitBtn.disabled).toBe(true);
  });
});

describe('ModalBayar - tanpa nomor pesanan', () => {
  it('judul tidak menampilkan nomor jika orderNo kosong', () => {
    render(
      <ModalBayar
        isOpen
        onClose={vi.fn()}
        total={10000}
        onConfirm={vi.fn()}
      />
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.textContent.trim()).toBe('Pembayaran Pesanan');
    expect(heading.textContent).not.toContain('#');
  });
});

describe('ModalBayar - aksesibilitas dan daftar metode', () => {
  const baseProps = { isOpen: true, onClose: vi.fn(), total: 10000, orderNo: 3, onConfirm: vi.fn() };

  it('menandai dialog sebagai modal dan memberi nama dari judulnya', () => {
    render(<ModalBayar {...baseProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const heading = screen.getByRole('heading', { level: 3 });
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('memindahkan fokus ke dalam dialog saat terbuka', () => {
    render(<ModalBayar {...baseProps} />);
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true);
  });

  it('opsi metode pembayaran berasal dari konfigurasi bersama', () => {
    render(<ModalBayar {...baseProps} />);
    const options = screen.getAllByRole('option').map((o) => o.value);
    expect(options).toEqual(PAYMENT_METHODS.map((m) => m.value));
  });
});
