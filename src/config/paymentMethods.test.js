import { describe, it, expect } from 'vitest';
import {
  DEFAULT_METODE,
  METODE_QRIS,
  METODE_TUNAI,
  PAYMENT_METHODS,
  getJenisMetode,
} from './paymentMethods.js';

describe('paymentMethods', () => {
  it('nilai setiap metode unik dan memiliki label serta jenis', () => {
    const values = PAYMENT_METHODS.map((m) => m.value);
    expect(new Set(values).size).toBe(values.length);
    for (const m of PAYMENT_METHODS) {
      expect(m.label).toBeTruthy();
      expect(m.jenis).toBeTruthy();
    }
  });

  it('metode default dan tunai ada di dalam daftar', () => {
    expect(DEFAULT_METODE).toBe(METODE_QRIS);
    const values = PAYMENT_METHODS.map((m) => m.value);
    expect(values).toContain(DEFAULT_METODE);
    expect(values).toContain(METODE_TUNAI);
  });

  it('getJenisMetode memetakan nilai ke jenis tampilan', () => {
    expect(getJenisMetode('QRIS')).toBe('qris');
    expect(getJenisMetode('Transfer Bank BCA')).toBe('transfer');
    expect(getJenisMetode('Transfer Bank Mandiri')).toBe('transfer');
    expect(getJenisMetode('GoPay / OVO / Dana')).toBe('ewallet');
    expect(getJenisMetode('Tunai')).toBe('tunai');
  });

  it('getJenisMetode mengembalikan undefined untuk metode yang tidak dikenal', () => {
    expect(getJenisMetode('Kartu Kredit')).toBeUndefined();
  });
});
