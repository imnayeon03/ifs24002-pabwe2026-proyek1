import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Katalog from './Katalog.jsx';
import api from '../api';
import * as auth from '../auth.jsx';

vi.mock('../api', () => ({
  default: { get: vi.fn() },
  rupiah: (n) => `Rp${n}`,
}));

describe('Katalog Component', () => {
  const mockMenu = [
    { id: 1, nama: 'Nasi Goreng', harga: 15000, kategori: 'Makanan', stok: 5, tersedia: 1, kios_nama: 'Kios Bu Sari' },
    { id: 2, nama: 'Es Teh', harga: 4000, kategori: 'Minuman', stok: 0, tersedia: 1, kios_nama: 'Kios Es' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and fetches menu with debounce', async () => {
    api.get.mockResolvedValueOnce({ data: mockMenu });
    vi.spyOn(auth, 'useAuth').mockReturnValue({ user: { id: 1, role: 'mahasiswa' } });

    const onAdd = vi.fn();
    render(<Katalog onAdd={onAdd} />);

    expect(screen.getByText(/Pesan dulu,/i)).toBeTruthy();
    expect(screen.getByPlaceholderText('Cari menu...')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Nasi Goreng')).toBeTruthy();
      expect(screen.getByText('Es Teh')).toBeTruthy();
    });

    // Klik tombol tambah ke keranjang untuk menu yang stoknya ada
    const addBtn = screen.getByText('+ Keranjang');
    fireEvent.click(addBtn);
    expect(onAdd).toHaveBeenCalledWith(mockMenu[0]);

    // Menu dengan stok 0 tombolnya Habis dan disabled
    const habisBtn = screen.getByText('Habis');
    expect(habisBtn.disabled).toBe(true);
  });

  it('filters menu by search query and category', async () => {
    api.get.mockResolvedValue({ data: [] });
    vi.spyOn(auth, 'useAuth').mockReturnValue({ user: { id: 1 } });

    render(<Katalog onAdd={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText('Cari menu...');
    fireEvent.change(searchInput, { target: { value: 'Ayam' } });

    const select = screen.getByLabelText('Filter kategori menu');
    fireEvent.change(select, { target: { value: 'Makanan' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/menu', expect.objectContaining({
        params: { q: 'Ayam', kategori: 'Makanan' }
      }));
      expect(screen.getByText('Menu tidak ditemukan.')).toBeTruthy();
    });
  });

  it('handles API fetch error', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));
    vi.spyOn(auth, 'useAuth').mockReturnValue({ user: null });

    render(<Katalog onAdd={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Gagal memuat menu')).toBeTruthy();
    });
  });

  it('shows Login untuk memesan when not logged in', async () => {
    api.get.mockResolvedValueOnce({ data: [mockMenu[0]] });
    vi.spyOn(auth, 'useAuth').mockReturnValue({ user: null });

    render(<Katalog onAdd={vi.fn()} />);

    await waitFor(() => {
      const loginBtn = screen.getByText('Login untuk memesan');
      expect(loginBtn.disabled).toBe(true);
    });
  });
});
