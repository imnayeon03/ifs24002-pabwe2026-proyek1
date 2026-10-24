import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuForm from './MenuForm.jsx';

describe('MenuForm Component', () => {
  const baseProps = {
    editId: null,
    form: { nama: 'Mie Goreng', harga: 12000, kategori: 'Makanan', stok: 20 },
    errors: {},
    onSet: vi.fn(() => vi.fn()),
    onSubmit: vi.fn((e) => e.preventDefault()),
    onBatal: vi.fn(),
    loading: false,
  };

  it('renders add menu form correctly', () => {
    render(<MenuForm {...baseProps} />);

    expect(screen.getByPlaceholderText('Nama menu').value).toBe('Mie Goreng');
    expect(screen.getByPlaceholderText('Harga (Rp)').value).toBe('12000');
    expect(screen.getByPlaceholderText('Stok').value).toBe('20');
    expect(screen.getByRole('button', { name: 'Tambah Menu' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Batal' })).toBeNull();
  });

  it('renders edit menu form with cancel button', () => {
    render(<MenuForm {...baseProps} editId={12} />);

    expect(screen.getByRole('button', { name: 'Simpan Perubahan' })).toBeTruthy();
    const batalBtn = screen.getByRole('button', { name: 'Batal' });
    expect(batalBtn).toBeTruthy();

    fireEvent.click(batalBtn);
    expect(baseProps.onBatal).toHaveBeenCalled();
  });

  it('displays validation errors', () => {
    const errors = {
      nama: 'Nama menu wajib diisi',
      harga: 'Harga tidak valid',
      stok: 'Stok tidak valid',
    };
    render(<MenuForm {...baseProps} errors={errors} />);

    expect(screen.getByText('Nama menu wajib diisi')).toBeTruthy();
    expect(screen.getByText('Harga tidak valid')).toBeTruthy();
    expect(screen.getByText('Stok tidak valid')).toBeTruthy();
  });

  it('handles loading state', () => {
    render(<MenuForm {...baseProps} loading={true} />);

    const submitBtn = screen.getByRole('button', { name: 'Menyimpan...' });
    expect(submitBtn.disabled).toBe(true);
  });

  it('handles input changes and submission', () => {
    const onSetHandler = vi.fn();
    const onSet = vi.fn(() => onSetHandler);
    const onSubmit = vi.fn((e) => e.preventDefault());

    render(<MenuForm {...baseProps} onSet={onSet} onSubmit={onSubmit} />);

    const namaInput = screen.getByPlaceholderText('Nama menu');
    fireEvent.change(namaInput, { target: { value: 'Soto Ayam' } });
    expect(onSet).toHaveBeenCalledWith('nama');

    const submitBtn = screen.getByRole('button', { name: 'Tambah Menu' });
    fireEvent.click(submitBtn);
    expect(onSubmit).toHaveBeenCalled();
  });
});
