import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QrisCode from './QrisCode.jsx';

describe('QrisCode', () => {
  it('merender gambar dengan label aksesibilitas', () => {
    render(<QrisCode />);
    const svg = screen.getByRole('img', { name: 'Kode QR pembayaran QRIS' });
    expect(svg.getAttribute('viewBox')).toBe('0 0 160 160');
  });

  it('menggambar latar, tiga pola penanda, dan modul data', () => {
    const { container } = render(<QrisCode />);
    // 1 latar + 3 pola penanda x 3 persegi + 23 modul data
    expect(container.querySelectorAll('rect')).toHaveLength(1 + 9 + 23);
    expect(container.querySelectorAll('g')).toHaveLength(3);
  });

  it('hanya satu modul data yang memakai sudut membulat', () => {
    const { container } = render(<QrisCode />);
    const bulat = Array.from(container.querySelectorAll('rect')).filter(
      (rect) => rect.getAttribute('width') === '16' && rect.getAttribute('rx') === '2'
    );
    expect(bulat).toHaveLength(1);
  });
});
