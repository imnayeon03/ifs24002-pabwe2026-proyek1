import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal.jsx';

function setup(props = {}) {
  const onClose = vi.fn();
  const utils = render(
    <Modal isOpen onClose={onClose} title="Judul Dialog" {...props}>
      <button type="button">aksi isi</button>
    </Modal>
  );
  return { onClose, ...utils };
}

describe('Modal', () => {
  it('tidak merender apa pun saat tertutup', () => {
    const { container } = setup({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('menampilkan judul dan isi, dengan ukuran default md', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Judul Dialog' })).toBeTruthy();
    expect(screen.getByText('aksi isi')).toBeTruthy();
    expect(screen.getByRole('dialog').className).toContain('modal-md');
  });

  it('memakai kelas ukuran sm', () => {
    setup({ size: 'sm' });
    expect(screen.getByRole('dialog').className).toContain('modal-sm');
  });

  it('memberi atribut ARIA dan memindahkan fokus ke dalam dialog', () => {
    setup();
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-labelledby')).toBe(screen.getByRole('heading').id);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('menutup lewat tombol tutup, backdrop, dan Escape', () => {
    const { onClose, container } = setup();
    fireEvent.click(screen.getByText('✕'));
    fireEvent.click(container.querySelector('.modal-backdrop'));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
