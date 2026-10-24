import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PesananMasukCard from './PesananMasukCard.jsx';

vi.mock('../api', () => ({
  rupiah: (n) => `Rp${n}`,
}));

describe('PesananMasukCard Component', () => {
  const order = {
    id: 10,
    nomor_antrean: 3,
    pemesan: 'Esgul',
    jam_ambil: '12:00',
    status: 'Dimasak',
    status_pembayaran: 'Sudah Dibayar',
    metode_pembayaran: 'QRIS',
    total: 25000,
    created_at: '2026-10-24 10:00',
    waktu_bayar: '2026-10-24 10:05',
    items: [{ menu_id: 1, nama: 'Ayam Penyet', harga: 25000, jumlah: 1 }],
  };

  it('renders order details and triggers status change', () => {
    const onUbahStatus = vi.fn();
    render(<PesananMasukCard order={order} onUbahStatus={onUbahStatus} onKonfirmasiKirimClick={vi.fn()} />);

    expect(screen.getByText(/#3 · Esgul · ambil 12:00/)).toBeTruthy();
    expect(screen.getByText(/Sudah Dibayar \(QRIS\)/)).toBeTruthy();
    expect(screen.getByText(/Dibayar: 2026-10-24 10:05/)).toBeTruthy();

    const siapBtn = screen.getByRole('button', { name: 'Siap' });
    fireEvent.click(siapBtn);
    expect(onUbahStatus).toHaveBeenCalledWith(10, 'Siap');
  });

  it('triggers send confirmation click when not yet sent', () => {
    const onKonfirmasiKirimClick = vi.fn();
    render(<PesananMasukCard order={order} onUbahStatus={vi.fn()} onKonfirmasiKirimClick={onKonfirmasiKirimClick} />);

    const kirimBtn = screen.getByRole('button', { name: /Konfirmasi Sudah Mengirim Pesanan/i });
    fireEvent.click(kirimBtn);
    expect(onKonfirmasiKirimClick).toHaveBeenCalledWith(order);
  });

  it('shows badge when order is already sent or completed', () => {
    const sentOrder = {
      ...order,
      status: 'Dikirim',
      waktu_kirim: '2026-10-24 12:15',
    };
    render(<PesananMasukCard order={sentOrder} onUbahStatus={vi.fn()} onKonfirmasiKirimClick={vi.fn()} />);

    expect(screen.getByText(/Pesanan Sedang Dikirim/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Konfirmasi Sudah Mengirim Pesanan/i })).toBeNull();
  });
});
