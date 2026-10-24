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
    fireEvent.click(container.querySelector('.modal-overlay'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('isDanger memberi kelas "error" pada tombol konfirmasi', () => {
    setup({ isDanger: true });
    expect(screen.getByText('Ya, Lanjutkan').className).toBe('error');
  });

  it('tombol konfirmasi biasa memakai kelas "primary"', () => {
    setup();
    expect(screen.getByText('Ya, Lanjutkan').className).toBe('primary');
  });
});
