import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useFocusTrap } from './useFocusTrap.js';

function Harness({ open, withButtons = true }) {
  const ref = useFocusTrap(open);
  return (
    <div>
      <button type="button">di luar</button>
      {open && (
        <div ref={ref} tabIndex={-1} data-testid="dialog">
          {withButtons && (
            <>
              <button type="button">pertama</button>
              <button type="button" tabIndex={-1}>dilewati</button>
              <button type="button" disabled>nonaktif</button>
              <button type="button">tengah</button>
              <button type="button">terakhir</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const tab = (opts = {}) => fireEvent.keyDown(document, { key: 'Tab', ...opts });

describe('useFocusTrap', () => {
  it('memindahkan fokus ke elemen interaktif pertama saat dialog terbuka', () => {
    render(<Harness open />);
    expect(document.activeElement).toBe(screen.getByText('pertama'));
  });

  it('memfokuskan dialog itu sendiri jika tidak ada elemen interaktif, dan menahan Tab', () => {
    render(<Harness open withButtons={false} />);
    expect(document.activeElement).toBe(screen.getByTestId('dialog'));
    expect(tab()).toBe(false); // false = default dicegah
  });

  it('Tab pada elemen terakhir berputar ke elemen pertama', () => {
    render(<Harness open />);
    screen.getByText('terakhir').focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('pertama'));
  });

  it('Shift+Tab pada elemen pertama berputar ke elemen terakhir', () => {
    render(<Harness open />);
    expect(tab({ shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('terakhir'));
  });

  it('Tab di tengah dialog dibiarkan berjalan normal', () => {
    render(<Harness open />);
    screen.getByText('tengah').focus();
    expect(tab()).toBe(true);
    expect(tab({ shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(screen.getByText('tengah'));
  });

  it('menarik fokus kembali ke dalam dialog jika fokus ada di luar', () => {
    render(<Harness open />);
    screen.getByText('di luar').focus();
    expect(tab()).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('pertama'));

    screen.getByText('di luar').focus();
    expect(tab({ shiftKey: true })).toBe(false);
    expect(document.activeElement).toBe(screen.getByText('terakhir'));
  });

  it('mengabaikan tombol selain Tab', () => {
    render(<Harness open />);
    screen.getByText('terakhir').focus();
    expect(fireEvent.keyDown(document, { key: 'a' })).toBe(true);
    expect(document.activeElement).toBe(screen.getByText('terakhir'));
  });

  it('mengembalikan fokus ke elemen pemicu saat dialog ditutup', () => {
    const { rerender } = render(<Harness open={false} />);
    const pemicu = screen.getByText('di luar');
    pemicu.focus();

    rerender(<Harness open />);
    expect(document.activeElement).toBe(screen.getByText('pertama'));

    rerender(<Harness open={false} />);
    expect(document.activeElement).toBe(pemicu);
  });

  it('tidak melakukan apa pun saat tidak aktif', () => {
    render(<Harness open={false} />);
    const luar = screen.getByText('di luar');
    luar.focus();
    expect(tab()).toBe(true);
    expect(document.activeElement).toBe(luar);
  });
});
