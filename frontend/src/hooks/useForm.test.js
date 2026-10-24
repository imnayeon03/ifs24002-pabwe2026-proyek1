import { describe, it, expect } from 'vitest';
import { validators } from './useForm';

describe('useForm validators', () => {
  describe('required validator', () => {
    const requiredName = validators.required('Nama');

    it('harus error jika string kosong atau hanya spasi', () => {
      expect(requiredName('')).toBe('Nama wajib diisi');
      expect(requiredName('   ')).toBe('Nama wajib diisi');
      expect(requiredName(null)).toBe('Nama wajib diisi');
    });

    it('harus valid jika ada isinya', () => {
      expect(requiredName('Nasi Goreng')).toBeNull();
    });
  });

  describe('email validator', () => {
    it('harus menolak format email yang tidak valid', () => {
      expect(validators.email('bukan-email')).toBe('Format email tidak valid');
      expect(validators.email('test@')).toBe('Format email tidak valid');
      expect(validators.email('@test.com')).toBe('Format email tidak valid');
    });

    it('harus menerima format email yang valid', () => {
      expect(validators.email('mhs@delfood.local')).toBeNull();
      expect(validators.email('user@gmail.com')).toBeNull();
    });
  });

  describe('minLength validator', () => {
    const min6 = validators.minLength(6);

    it('harus error jika panjang kurang dari batas', () => {
      expect(min6('12345')).toBe('Minimal 6 karakter');
      expect(min6('')).toBe('Minimal 6 karakter');
    });

    it('harus lolos jika panjang memenuhi atau lebih', () => {
      expect(min6('123456')).toBeNull();
      expect(min6('mahasiswa123')).toBeNull();
    });
  });

  describe('number validators', () => {
    it('positiveNumber harus menolak angka <= 0 atau non-angka', () => {
      const validateHarga = validators.positiveNumber('Harga');
      expect(validateHarga('0')).toBe('Harga harus lebih dari 0');
      expect(validateHarga('-5000')).toBe('Harga harus lebih dari 0');
      expect(validateHarga('abc')).toBe('Harga harus lebih dari 0');
      expect(validateHarga('15000')).toBeNull();
    });

    it('nonNegativeNumber harus menerima 0 dan menolak negatif', () => {
      const validateStok = validators.nonNegativeNumber('Stok');
      expect(validateStok('0')).toBeNull();
      expect(validateStok('25')).toBeNull();
      expect(validateStok('-1')).toBe('Stok tidak boleh negatif');
    });
  });
});
