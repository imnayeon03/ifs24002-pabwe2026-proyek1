import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from './ConfirmModal.jsx';

function setup(props = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const utils = render(
    <ConfirmModal isOpen message="Yakin?" onConfirm={onConfirm} onCancel={onCancel} {...props} />
  );
  return { onConfirm, onCancel, ...utils };
}

describe('ConfirmModal', () => {
  it('tidak merender apa pun saat isOpen = false', () => {
    const { container } = setup({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('menampilkan judul, pesan, dan teks tombol default', () => {
    setup();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Konfirmasi')).toBeTruthy();
    expect(screen.getByText('Yakin?')).toBeTruthy();
    expect(screen.getByText('Batal')).toBeTruthy();
    expect(screen.getByText('Ya, Lanjutkan')).toBeTruthy();
  });

  it('memakai judul dan teks tombol kustom', () => {
    setup({ title: 'Hapus Menu', confirmText: 'Ya, Hapus', cancelText: 'Tidak' });
    expect(screen.getByText('Hapus Menu')).toBeTruthy();
    expect(screen.getByText('Ya, Hapus')).toBeTruthy();
    expect(screen.getByText('Tidak')).toBeTruthy();
  });

  it('tombol konfirmasi memanggil onConfirm', () => {
    const { onConfirm, onCancel } = setup();
    fireEvent.click(screen.getByText('Ya, Lanjutkan'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('tombol batal dan tombol tutup memanggil onCancel', () => {
    const { onCancel, container } = setup();
    fireEvent.click(screen.getByText('Batal'));
    fireEvent.click(container.querySelector('.btn-close'));
    expect(onCancel).toHaveBeenCalledTimes(2);
  });

  it('klik pada overlay menutup modal, klik di dalam konten tidak', () => {
    const { onCancel, container } = setup();
    fireEvent.click(container.querySelector('.modal-content'));
    expect(onCancel).not.toHaveBeenCalled();
    fireEvent.click(container.querySelector('.modal-backdrop'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('tombol Escape menutup modal', () => {
    const { onCancel } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('isDanger memberi kelas "btn-danger" pada tombol konfirmasi', () => {
    setup({ isDanger: true });
    expect(screen.getByText('Ya, Lanjutkan').className).toBe('btn-danger');
  });

  it('tombol konfirmasi biasa memakai kelas "primary"', () => {
    setup();
    expect(screen.getByText('Ya, Lanjutkan').className).toBe('primary');
  });
});

describe('ConfirmModal - aksesibilitas', () => {
  it('menandai dialog sebagai modal dan memberi nama dari judulnya', () => {
    setup({ title: 'Hapus Menu' });
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const heading = screen.getByRole('heading', { name: 'Hapus Menu' });
    expect(dialog.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('memindahkan fokus ke dalam dialog saat terbuka dan menjebak Tab', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);

    screen.getByText('Ya, Lanjutkan').focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(screen.getByText('Ya, Lanjutkan'));
  });
});
