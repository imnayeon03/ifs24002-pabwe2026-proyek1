import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PesananMasukCard from './PesananMasukCard.jsx';

vi.mock('../api', () => ({
  rupiah: (n) => `Rp${n}`,
}));

describe('PesananMasukCard Component', () => {
  const baseOrder = {
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

  it('renders order details, handles status change, and triggers send confirmation', () => {
    const onUbahStatus = vi.fn();
    const onKonfirmasiKirimClick = vi.fn();
    render(
      <PesananMasukCard
        order={baseOrder}
        onUbahStatus={onUbahStatus}
        onKonfirmasiKirimClick={onKonfirmasiKirimClick}
      />
    );

    expect(screen.getByText(/#3 · Esgul · ambil 12:00/)).toBeTruthy();
    expect(screen.getByText(/Sudah Dibayar \(QRIS\)/)).toBeTruthy();
    expect(screen.getByText(/Dibayar: 2026-10-24 10:05/)).toBeTruthy();

    const siapBtn = screen.getByRole('button', { name: 'Siap' });
    fireEvent.click(siapBtn);
    expect(onUbahStatus).toHaveBeenCalledWith(10, 'Siap');

    const kirimBtn = screen.getByRole('button', { name: /Konfirmasi Sudah Mengirim Pesanan/i });
    fireEvent.click(kirimBtn);
    expect(onKonfirmasiKirimClick).toHaveBeenCalledWith(baseOrder);
  });

  it('renders unpaid order correctly', () => {
    const unpaidOrder = {
      ...baseOrder,
      status_pembayaran: 'Belum Dibayar',
      waktu_bayar: null,
    };

    render(
      <PesananMasukCard
        order={unpaidOrder}
        onUbahStatus={vi.fn()}
        onKonfirmasiKirimClick={vi.fn()}
      />
    );

    expect(screen.getByText('⏳ Belum Dibayar')).toBeTruthy();
  });

  it('shows delivery waiting note when order is sent', () => {
    const sentOrder = {
      ...baseOrder,
      status: 'Dikirim',
      waktu_kirim: '2026-10-24 12:15',
    };
    render(
      <PesananMasukCard
        order={sentOrder}
        onUbahStatus={vi.fn()}
        onKonfirmasiKirimClick={vi.fn()}
      />
    );

    expect(screen.getByText(/Pesanan Sedang Dikirim/)).toBeTruthy();
    expect(screen.getByText(/Dikirim: 2026-10-24 12:15/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Konfirmasi Sudah Mengirim Pesanan/i })).toBeNull();
  });

  it('shows completion note when order is finished', () => {
    const completedOrder = {
      ...baseOrder,
      status: 'Selesai',
      waktu_kirim: '2026-10-24 12:15',
      waktu_selesai: '2026-10-24 12:30',
    };
    render(
      <PesananMasukCard
        order={completedOrder}
        onUbahStatus={vi.fn()}
        onKonfirmasiKirimClick={vi.fn()}
      />
    );

    expect(screen.getByText(/Pesanan Selesai/)).toBeTruthy();
    expect(screen.getByText(/Diterima: 2026-10-24 12:30/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Konfirmasi Sudah Mengirim Pesanan/i })).toBeNull();
  });
});
