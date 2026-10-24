import { describe, it, expect } from 'vitest';
import { rupiah, errMsg } from './api';

describe('api helper functions', () => {
  describe('rupiah formatter', () => {
    it('harus memformat angka menjadi format mata uang Rupiah', () => {
      // id-ID format: Rp15.000 (atau dengan spasi/separator)
      const formatted = rupiah(15000);
      expect(formatted).toContain('Rp');
      expect(formatted).toContain('15');
    });

    it('harus menangani angka 0 dengan benar', () => {
      const formatted = rupiah(0);
      expect(formatted).toContain('Rp');
      expect(formatted).toContain('0');
    });
  });

  describe('errMsg helper', () => {
    it('harus mengekstrak pesan error dari response data', () => {
      const err = { response: { data: { error: 'Email sudah terdaftar' } } };
      expect(errMsg(err)).toBe('Email sudah terdaftar');
    });

    it('harus memberikan fallback jika tidak ada response data error', () => {
      const err = new Error('Network error');
      expect(errMsg(err)).toBe('Terjadi kesalahan, coba lagi');
      expect(errMsg(null)).toBe('Terjadi kesalahan, coba lagi');
    });
  });
});
