import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Keranjang from './Keranjang.jsx';
import { useCheckout } from '../hooks/useCheckout.js';
import { PAYMENT_METHODS } from '../config/paymentMethods.js';

vi.mock('../hooks/useCheckout.js', () => ({
  useCheckout: vi.fn(),
}));

vi.mock('../components/ModalBayar.jsx', () => ({
  default: ({ isOpen, onClose, onConfirm, total }) => (
    isOpen ? (
      <div data-testid="modal-bayar">
        <span>Modal Total: {total}</span>
        <button onClick={() => onConfirm('Transfer Bank BCA')}>Konfirmasi Modal</button>
        <button onClick={onClose}>Batal Modal</button>
      </div>
    ) : null
  ),
}));

describe('Keranjang Component', () => {
  const mockCart = [
    {
      menu: { id: 1, nama: 'Nasi Ayam', harga: 15000, stok: 5, kios_nama: 'Kios Bu Sari' },
      jumlah: 2,
    },
    {
      menu: { id: 2, nama: 'Es Jeruk', harga: 5000, stok: 10, kios_nama: 'Kios Es' },
      jumlah: 1,
    },
  ];

  let checkoutMock;

  beforeEach(() => {
    checkoutMock = vi.fn().mockResolvedValue({ id: 101 });
    useCheckout.mockReturnValue({
      checkout: checkoutMock,
      loading: false,
    });
  });

  it('renders empty message when cart is empty', () => {
    render(<Keranjang cart={[]} setCart={vi.fn()} />);
    expect(screen.getByText('Keranjang kosong.')).toBeTruthy();
  });

  it('renders cart items and updates quantities', () => {
    const setCart = vi.fn();
    render(<Keranjang cart={mockCart} setCart={setCart} />);

    expect(screen.getByText('Keranjang Belanja')).toBeTruthy();
    expect(screen.getByText(/Nasi Ayam/)).toBeTruthy();
    expect(screen.getByText(/Es Jeruk/)).toBeTruthy();

    // Tombol + dan -
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    fireEvent.click(plusButtons[0]);
    expect(setCart).toHaveBeenCalled();

    const minusButtons = screen.getAllByRole('button', { name: '-' });
    fireEvent.click(minusButtons[0]);
    expect(setCart).toHaveBeenCalled();

    // Tombol hapus
    const removeButtons = screen.getAllByTitle('Hapus item');
    fireEvent.click(removeButtons[0]);
    expect(setCart).toHaveBeenCalled();
  });

  it('handles Bayar & Buat Pesanan flow with ModalBayar and close', async () => {
    render(<Keranjang cart={mockCart} setCart={vi.fn()} />);

    // Klik Bayar & Buat Pesanan -> modal terbuka
    const bayarBtn = screen.getByText(/Bayar & Buat Pesanan/i);
    fireEvent.click(bayarBtn);

    expect(screen.getByTestId('modal-bayar')).toBeTruthy();

    // Tutup modal
    const batalModalBtn = screen.getByText('Batal Modal');
    fireEvent.click(batalModalBtn);
    expect(screen.queryByTestId('modal-bayar')).toBeNull();

    // Buka lagi lalu konfirmasi
    fireEvent.click(bayarBtn);
    const confirmModalBtn = screen.getByText('Konfirmasi Modal');
    fireEvent.click(confirmModalBtn);

    await waitFor(() => {
      expect(checkoutMock).toHaveBeenCalledWith(expect.objectContaining({
        cart: mockCart,
        metode: 'Transfer Bank BCA',
        statusBayar: 'Sudah Dibayar',
      }));
    });
  });

  it('handles checkout error in modal confirm', async () => {
    checkoutMock.mockRejectedValueOnce(new Error('Gagal checkout'));
    render(<Keranjang cart={mockCart} setCart={vi.fn()} />);

    const bayarBtn = screen.getByText(/Bayar & Buat Pesanan/i);
    fireEvent.click(bayarBtn);

    const confirmModalBtn = screen.getByText('Konfirmasi Modal');
    fireEvent.click(confirmModalBtn);

    await waitFor(() => {
      expect(checkoutMock).toHaveBeenCalled();
    });
  });

  it('handles Pesan Dulu (Bayar Nanti)', async () => {
    render(<Keranjang cart={mockCart} setCart={vi.fn()} />);

    const pesanDuluBtn = screen.getByText('Pesan Dulu (Bayar Nanti)');
    fireEvent.click(pesanDuluBtn);

    await waitFor(() => {
      expect(checkoutMock).toHaveBeenCalledWith(expect.objectContaining({
        cart: mockCart,
        metode: 'Tunai',
        statusBayar: 'Belum Dibayar',
      }));
    });
  });

  it('does not proceed when validation fails', () => {
    render(<Keranjang cart={mockCart} setCart={vi.fn()} />);

    const jamInput = screen.getByLabelText(/Jam Pengambilan/i);
    fireEvent.change(jamInput, { target: { value: '' } });

    const bayarBtn = screen.getByText(/Bayar & Buat Pesanan/i);
    fireEvent.click(bayarBtn);
    expect(screen.queryByTestId('modal-bayar')).toBeNull();

    const pesanDuluBtn = screen.getByText('Pesan Dulu (Bayar Nanti)');
    fireEvent.click(pesanDuluBtn);
    expect(checkoutMock).not.toHaveBeenCalled();
  });

  it('allows changing jam ambil and metode pembayaran', () => {
    render(<Keranjang cart={mockCart} setCart={vi.fn()} />);

    const jamInput = screen.getByLabelText(/Jam Pengambilan/i);
    fireEvent.change(jamInput, { target: { value: '14:30' } });
    expect(jamInput.value).toBe('14:30');

    const metodeSelect = screen.getByLabelText(/Metode Pembayaran/i);
    fireEvent.change(metodeSelect, { target: { value: 'Tunai' } });
    expect(metodeSelect.value).toBe('Tunai');
  });
});

describe('Keranjang Component - kasus tambahan', () => {
  const cart = [
    { menu: { id: 1, nama: 'Nasi Ayam', harga: 15000, stok: 5, kios_nama: 'Kios Bu Sari' }, jumlah: 1 },
  ];

  it('callback sukses checkout mengosongkan keranjang', () => {
    useCheckout.mockReturnValue({ checkout: vi.fn(), loading: false });
    const setCart = vi.fn();
    render(<Keranjang cart={cart} setCart={setCart} />);

    const onSuccess = useCheckout.mock.calls[0][0];
    onSuccess();

    expect(setCart).toHaveBeenCalledWith([]);
  });

  it('menampilkan status memproses dan menonaktifkan tombol saat loading', () => {
    useCheckout.mockReturnValue({ checkout: vi.fn(), loading: true });
    render(<Keranjang cart={cart} setCart={vi.fn()} />);

    const tombolBayar = screen.getByRole('button', { name: 'Memproses...' });
    expect(tombolBayar.disabled).toBe(true);
    expect(screen.getByText('Pesan Dulu (Bayar Nanti)').disabled).toBe(true);
  });

  it('konfirmasi modal tidak memanggil checkout jika jam dikosongkan setelah modal terbuka', () => {
    const checkout = vi.fn().mockResolvedValue({ id: 1 });
    useCheckout.mockReturnValue({ checkout, loading: false });
    render(<Keranjang cart={cart} setCart={vi.fn()} />);

    fireEvent.click(screen.getByText(/Bayar & Buat Pesanan/i));
    expect(screen.getByTestId('modal-bayar')).toBeTruthy();

    fireEvent.change(screen.getByLabelText(/Jam Pengambilan/i), { target: { value: '' } });
    fireEvent.click(screen.getByText('Konfirmasi Modal'));

    expect(checkout).not.toHaveBeenCalled();
    expect(screen.getByText('Jam pengambilan wajib diisi')).toBeTruthy();
  });
});

describe('Keranjang Component - metode pembayaran', () => {
  it('opsi metode pembayaran berasal dari konfigurasi bersama', () => {
    useCheckout.mockReturnValue({ checkout: vi.fn(), loading: false });
    render(
      <Keranjang
        cart={[{ menu: { id: 1, nama: 'Nasi', harga: 10000, stok: 3, kios_nama: 'K' }, jumlah: 1 }]}
        setCart={vi.fn()}
      />
    );
    const select = screen.getByLabelText(/Metode Pembayaran/i);
    expect(select.value).toBe('QRIS');
    const options = Array.from(select.querySelectorAll('option')).map((o) => o.value);
    expect(options).toEqual(PAYMENT_METHODS.map((m) => m.value));
  });
});
