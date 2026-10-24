import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PesananCard from './PesananCard.jsx';

vi.mock('../api', () => ({
  rupiah: (n) => `Rp${n}`,
}));

describe('PesananCard Component', () => {
  const baseOrder = {
    id: 1,
    kios_nama: 'Kios Bu Sari',
    nomor_antrean: 5,
    status: 'Diterima',
    status_pembayaran: 'Belum Dibayar',
    total: 20000,
    jam_ambil: '12:30',
    created_at: '2026-10-24 11:00',
    items: [{ menu_id: 1, nama: 'Nasi Rames', harga: 20000, jumlah: 1 }],
  };

  it('renders unpaid order and triggers onBayar', () => {
    const onBayar = vi.fn();
    render(<PesananCard order={baseOrder} onBayar={onBayar} onKonfirmasiTerima={vi.fn()} />);

    expect(screen.getByText(/Kios Bu Sari · Antrean #5/)).toBeTruthy();
    expect(screen.getByText('⏳ Belum Dibayar')).toBeTruthy();

    const bayarBtn = screen.getByRole('button', { name: /Bayar Sekarang/i });
    fireEvent.click(bayarBtn);
    expect(onBayar).toHaveBeenCalledWith(baseOrder);
  });

  it('renders paid and delivered order, triggers onKonfirmasiTerima', () => {
    const onKonfirmasiTerima = vi.fn();
    const paidOrder = {
      ...baseOrder,
      status: 'Dikirim',
      status_pembayaran: 'Sudah Dibayar',
      metode_pembayaran: 'QRIS',
      waktu_kirim: '2026-10-24 12:40',
    };

    render(<PesananCard order={paidOrder} onBayar={vi.fn()} onKonfirmasiTerima={onKonfirmasiTerima} />);

    expect(screen.getByText(/Lunas \(QRIS\)/)).toBeTruthy();
    expect(screen.getByText(/Dikirim pada 2026-10-24 12:40/)).toBeTruthy();

    const terimaBtn = screen.getByRole('button', { name: /Konfirmasi Sudah Menerima Pesanan/i });
    fireEvent.click(terimaBtn);
    expect(onKonfirmasiTerima).toHaveBeenCalledWith(paidOrder);
  });

  it('renders completed order with completed timestamp', () => {
    const completedOrder = {
      ...baseOrder,
      status: 'Selesai',
      status_pembayaran: 'Sudah Dibayar',
      waktu_selesai: '2026-10-24 13:00',
    };

    render(<PesananCard order={completedOrder} onBayar={vi.fn()} onKonfirmasiTerima={vi.fn()} />);
    expect(screen.getByText(/Selesai pada 2026-10-24 13:00/)).toBeTruthy();
  });
});

describe('PesananCard - data opsional', () => {
  const order = {
    id: 2,
    kios_nama: 'Kios Es',
    nomor_antrean: 8,
    status: 'Diterima',
    status_pembayaran: 'Sudah Dibayar',
    total: 5000,
    jam_ambil: '10:00',
    created_at: '2026-10-24 09:00',
  };

  it('tidak crash dan tidak menampilkan item jika items tidak ada', () => {
    const { container } = render(<PesananCard order={order} />);
    expect(container.querySelectorAll('li')).toHaveLength(0);
  });

  it('memakai QRIS sebagai metode default pada pesanan lunas tanpa metode', () => {
    render(<PesananCard order={order} />);
    expect(screen.getByText(/Lunas \(QRIS\)/)).toBeTruthy();
  });
});
