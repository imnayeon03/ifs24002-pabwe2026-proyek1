import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useOrders } from '../hooks/useOrders.js';
import { useMenu } from '../hooks/useMenu.js';
import { useOrderActions } from '../hooks/useOrderActions.js';
import Dashboard from './Dashboard.jsx';

vi.mock('../auth.jsx', () => ({ useAuth: () => ({ user: { kios_id: 3 } }) }));
vi.mock('../hooks/useOrders.js', () => ({ useOrders: vi.fn() }));
vi.mock('../hooks/useMenu.js', () => ({ useMenu: vi.fn() }));
vi.mock('../hooks/useOrderActions.js', () => ({ useOrderActions: vi.fn() }));

// Komponen presentasional di-stub: yang diuji di sini hanya logika koordinasi Dashboard.
vi.mock('../components/MenuForm.jsx', () => ({
  default: ({ editId, form, onSubmit, onBatal }) => (
    <form onSubmit={onSubmit}>
      <span data-testid="edit-id">{String(editId)}</span>
      <span data-testid="form-nama">{form.nama}</span>
      <button type="submit">simpan</button>
      <button type="button" onClick={onBatal}>batal-edit</button>
    </form>
  ),
}));
vi.mock('../components/MenuTable.jsx', () => ({
  default: ({ menu, onEdit, onHapusClick }) => (
    <div>
      {menu.map((m) => (
        <div key={m.id}>
          <button onClick={() => onEdit(m)}>edit-{m.id}</button>
          <button onClick={() => onHapusClick(m)}>hapus-{m.id}</button>
        </div>
      ))}
    </div>
  ),
}));
vi.mock('../components/PesananMasukCard.jsx', () => ({
  default: ({ order, onUbahStatus, onKonfirmasiKirimClick }) => (
    <div>
      <button onClick={() => onUbahStatus(order.id, 'Diproses')}>status-{order.id}</button>
      <button onClick={() => onKonfirmasiKirimClick(order)}>kirim-{order.id}</button>
    </div>
  ),
}));

const MENU = [{ id: 1, nama: 'Nasi Goreng', harga: 15000, kategori: 'Makanan', stok: 5 }];
const ORDER = { id: 5, nomor_antrean: 12, pemesan: 'Budi', status: 'Diproses', status_pembayaran: 'Sudah Dibayar' };

let mocks;

function setup({ orders = [], ordersLoading = false, menu = MENU } = {}) {
  mocks = {
    saveMenu: vi.fn().mockResolvedValue(true),
    deleteMenu: vi.fn().mockResolvedValue(true),
    ubahStatus: vi.fn(),
    konfirmasiKirim: vi.fn().mockResolvedValue(true),
  };
  useOrders.mockReturnValue({ orders, loading: ordersLoading, reload: vi.fn() });
  useMenu.mockReturnValue({
    menu,
    loading: false,
    saveMenu: mocks.saveMenu,
    deleteMenu: mocks.deleteMenu,
  });
  useOrderActions.mockReturnValue({
    ubahStatus: mocks.ubahStatus,
    konfirmasiKirim: mocks.konfirmasiKirim,
  });
  return render(<Dashboard />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Dashboard - pesanan masuk', () => {
  it('menampilkan spinner saat pesanan dimuat', () => {
    setup({ ordersLoading: true });
    expect(screen.getByText('Memuat pesanan masuk...')).toBeTruthy();
  });

  it('menampilkan pesan kosong jika belum ada pesanan', () => {
    setup();
    expect(screen.getByText('Belum ada pesanan.')).toBeTruthy();
  });

  it('banner hanya menghitung pesanan lunas yang belum selesai', () => {
    setup({
      orders: [
        ORDER,
        { ...ORDER, id: 6, status: 'Selesai' },
        { ...ORDER, id: 7, status_pembayaran: 'Belum Dibayar' },
      ],
    });
    expect(screen.getByText(/Terdapat 1 pesanan aktif/)).toBeTruthy();
  });

  it('tidak menampilkan banner jika tidak ada pesanan lunas aktif', () => {
    const { container } = setup({ orders: [{ ...ORDER, status: 'Selesai' }] });
    expect(container.querySelector('.banner-payment-info')).toBeNull();
  });

  it('meneruskan perubahan status ke useOrderActions', () => {
    setup({ orders: [ORDER] });
    fireEvent.click(screen.getByText('status-5'));
    expect(mocks.ubahStatus).toHaveBeenCalledWith(5, 'Diproses');
  });

  it('konfirmasi kirim: modal muncul lalu pesanan dikirim', async () => {
    setup({ orders: [ORDER] });
    fireEvent.click(screen.getByText('kirim-5'));
    expect(screen.getByText('Konfirmasi Pengiriman Pesanan')).toBeTruthy();

    fireEvent.click(screen.getByText('Ya, Sudah Dikirim'));
    await waitFor(() => expect(mocks.konfirmasiKirim).toHaveBeenCalledWith(5, 12));
    await waitFor(() => expect(screen.queryByText('Konfirmasi Pengiriman Pesanan')).toBeNull());
  });

  it('membatalkan konfirmasi kirim tidak memanggil API', () => {
    setup({ orders: [ORDER] });
    fireEvent.click(screen.getByText('kirim-5'));
    fireEvent.click(screen.getByText('Batal'));
    expect(mocks.konfirmasiKirim).not.toHaveBeenCalled();
    expect(screen.queryByText('Konfirmasi Pengiriman Pesanan')).toBeNull();
  });
});

describe('Dashboard - kelola menu', () => {
  it('menyimpan menu hasil edit lalu mereset form', async () => {
    setup();
    fireEvent.click(screen.getByText('edit-1'));
    expect(screen.getByTestId('edit-id').textContent).toBe('1');
    expect(screen.getByTestId('form-nama').textContent).toBe('Nasi Goreng');

    fireEvent.click(screen.getByText('simpan'));
    await waitFor(() => expect(mocks.saveMenu).toHaveBeenCalledTimes(1));
    expect(mocks.saveMenu.mock.calls[0][0]).toMatchObject({ nama: 'Nasi Goreng', harga: '15000', stok: '5' });
    expect(mocks.saveMenu.mock.calls[0][1]).toBe(1);

    await waitFor(() => expect(screen.getByTestId('edit-id').textContent).toBe('null'));
    expect(screen.getByTestId('form-nama').textContent).toBe('');
  });

  it('tidak menyimpan jika validasi gagal', () => {
    setup();
    fireEvent.click(screen.getByText('simpan'));
    expect(mocks.saveMenu).not.toHaveBeenCalled();
  });

  it('mempertahankan mode edit jika penyimpanan gagal', async () => {
    setup();
    mocks.saveMenu.mockResolvedValue(false);
    fireEvent.click(screen.getByText('edit-1'));
    fireEvent.click(screen.getByText('simpan'));
    await waitFor(() => expect(mocks.saveMenu).toHaveBeenCalled());
    expect(screen.getByTestId('edit-id').textContent).toBe('1');
  });

  it('tombol batal keluar dari mode edit dan mengosongkan form', () => {
    setup();
    fireEvent.click(screen.getByText('edit-1'));
    fireEvent.click(screen.getByText('batal-edit'));
    expect(screen.getByTestId('edit-id').textContent).toBe('null');
    expect(screen.getByTestId('form-nama').textContent).toBe('');
  });

  it('hapus menu: konfirmasi dulu, lalu panggil deleteMenu', async () => {
    setup();
    fireEvent.click(screen.getByText('hapus-1'));
    expect(screen.getByText('Apakah Anda yakin ingin menghapus menu "Nasi Goreng"?')).toBeTruthy();

    fireEvent.click(screen.getByText('Ya, Hapus'));
    await waitFor(() => expect(mocks.deleteMenu).toHaveBeenCalledWith(1, 'Nasi Goreng'));
    await waitFor(() => expect(screen.queryByText('Hapus Menu')).toBeNull());
  });

  it('membatalkan hapus menu tidak memanggil API', () => {
    setup();
    fireEvent.click(screen.getByText('hapus-1'));
    fireEvent.click(screen.getByText('Batal'));
    expect(mocks.deleteMenu).not.toHaveBeenCalled();
  });
});
