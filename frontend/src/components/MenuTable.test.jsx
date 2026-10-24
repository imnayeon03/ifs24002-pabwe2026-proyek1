import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuTable from './MenuTable.jsx';

vi.mock('../api', () => ({
  rupiah: (n) => `Rp${n}`,
}));

describe('MenuTable Component', () => {
  it('renders empty message when no menu', () => {
    render(<MenuTable menu={[]} onEdit={vi.fn()} onHapusClick={vi.fn()} />);
    expect(screen.getByText('Belum ada menu.')).toBeTruthy();
  });

  it('renders list of menu items and handles edit and delete clicks', () => {
    const onEdit = vi.fn();
    const onHapusClick = vi.fn();
    const menu = [
      { id: 1, nama: 'Soto Kudus', kategori: 'Makanan', harga: 18000, stok: 10 },
      { id: 2, nama: 'Es Jeruk', kategori: 'Minuman', harga: 5000, stok: 20 },
    ];

    render(<MenuTable menu={menu} onEdit={onEdit} onHapusClick={onHapusClick} />);

    expect(screen.getByText('Soto Kudus')).toBeTruthy();
    expect(screen.getByText('Es Jeruk')).toBeTruthy();

    const ubahButtons = screen.getAllByRole('button', { name: 'Ubah' });
    fireEvent.click(ubahButtons[0]);
    expect(onEdit).toHaveBeenCalledWith(menu[0]);

    const hapusButtons = screen.getAllByRole('button', { name: 'Hapus' });
    fireEvent.click(hapusButtons[1]);
    expect(onHapusClick).toHaveBeenCalledWith(menu[1]);
  });
});
