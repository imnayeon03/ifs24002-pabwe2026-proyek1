import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Riwayat from './Riwayat.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { useOrderActions } from '../hooks/useOrderActions.js';

vi.mock('../hooks/useOrders.js', () => ({
  useOrders: vi.fn(),
}));

vi.mock('../hooks/useOrderActions.js', () => ({
  useOrderActions: vi.fn(),
}));

vi.mock('../components/ModalBayar.jsx', () => ({
  default: ({ isOpen, onConfirm, onClose }) => (
    isOpen ? (
      <div>
        <button onClick={() => onConfirm('QRIS')}>Konfirmasi Bayar Modal</button>
        <button onClick={onClose}>Tutup Bayar Modal</button>
      </div>
    ) : null
  ),
}));

vi.mock('../components/ConfirmModal.jsx', () => ({
  default: ({ isOpen, onConfirm, onCancel }) => (
    isOpen ? (
      <div>
        <button onClick={onConfirm}>Konfirmasi Terima Modal</button>
        <button onClick={onCancel}>Batal Terima Modal</button>
      </div>
    ) : null
  ),
}));

describe('Riwayat Page Component', () => {
  const mockOrder = {
    id: 99,
    nomor_antrean: 10,
    kios_nama: 'Kios Bu Sari',
    status: 'Dikirim',
    status_pembayaran: 'Belum Dibayar',
    total: 30000,
    jam_ambil: '13:00',
    created_at: '2026-10-24',
    items: [],
  };

  let mockBayarOrder;
  let mockKonfirmasiTerima;

  beforeEach(() => {
    vi.clearAllMocks();
    mockBayarOrder = vi.fn().mockResolvedValue(true);
    mockKonfirmasiTerima = vi.fn().mockResolvedValue(true);

    useOrderActions.mockReturnValue({
      bayarOrder: mockBayarOrder,
      konfirmasiTerima: mockKonfirmasiTerima,
      loadingAction: false,
    });
  });

  it('renders loading state', () => {
    useOrders.mockReturnValue({ orders: [], loading: true, error: null, reload: vi.fn() });
    render(<Riwayat />);
    expect(screen.getByText('Memuat daftar pesanan...')).toBeTruthy();
  });

  it('renders empty orders list', () => {
    useOrders.mockReturnValue({ orders: [], loading: false, error: null, reload: vi.fn() });
    render(<Riwayat />);
    expect(screen.getByText('Belum ada pesanan.')).toBeTruthy();
  });

  it('renders error message', () => {
    useOrders.mockReturnValue({ orders: [], loading: false, error: 'Koneksi terputus', reload: vi.fn() });
    render(<Riwayat />);
    expect(screen.getByText('Koneksi terputus')).toBeTruthy();
  });

  it('handles bayar flow from modal', async () => {
    useOrders.mockReturnValue({ orders: [mockOrder], loading: false, error: null, reload: vi.fn() });
    render(<Riwayat />);

    const bayarBtn = screen.getByRole('button', { name: /Bayar Sekarang/i });
    fireEvent.click(bayarBtn);

    const modalBtn = screen.getByText('Konfirmasi Bayar Modal');
    fireEvent.click(modalBtn);

    await waitFor(() => {
      expect(mockBayarOrder).toHaveBeenCalledWith(99, 10, 'QRIS');
    });
  });

  it('menutup modal bayar tanpa memanggil bayarOrder', () => {
    useOrders.mockReturnValue({ orders: [mockOrder], loading: false, error: null, reload: vi.fn() });
    render(<Riwayat />);

    fireEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }));
    fireEvent.click(screen.getByText('Tutup Bayar Modal'));

    expect(screen.queryByText('Konfirmasi Bayar Modal')).toBeNull();
    expect(mockBayarOrder).not.toHaveBeenCalled();
  });

  it('modal bayar tetap terbuka jika pembayaran gagal', async () => {
    mockBayarOrder.mockRejectedValueOnce(new Error('gagal'));
    useOrders.mockReturnValue({ orders: [mockOrder], loading: false, error: null, reload: vi.fn() });
    render(<Riwayat />);

    fireEvent.click(screen.getByRole('button', { name: /Bayar Sekarang/i }));
    fireEvent.click(screen.getByText('Konfirmasi Bayar Modal'));

    await waitFor(() => expect(mockBayarOrder).toHaveBeenCalled());
    expect(screen.getByText('Konfirmasi Bayar Modal')).toBeTruthy();
  });

  it('membatalkan konfirmasi terima tidak memanggil konfirmasiTerima', () => {
    useOrders.mockReturnValue({
      orders: [{ ...mockOrder, status: 'Dikirim', status_pembayaran: 'Sudah Dibayar' }],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    render(<Riwayat />);

    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Sudah Menerima Pesanan/i }));
    fireEvent.click(screen.getByText('Batal Terima Modal'));

    expect(screen.queryByText('Konfirmasi Terima Modal')).toBeNull();
    expect(mockKonfirmasiTerima).not.toHaveBeenCalled();
  });

  it('handles konfirmasi terima flow from modal', async () => {
    useOrders.mockReturnValue({
      orders: [{ ...mockOrder, status: 'Dikirim', status_pembayaran: 'Sudah Dibayar' }],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
    render(<Riwayat />);

    const terimaBtn = screen.getByRole('button', { name: /Konfirmasi Sudah Menerima Pesanan/i });
    fireEvent.click(terimaBtn);

    const modalBtn = screen.getByText('Konfirmasi Terima Modal');
    fireEvent.click(modalBtn);

    await waitFor(() => {
      expect(mockKonfirmasiTerima).toHaveBeenCalledWith(99, 10);
    });
  });
});
