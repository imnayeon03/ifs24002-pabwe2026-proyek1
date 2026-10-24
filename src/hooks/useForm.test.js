import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useForm, validators } from './useForm';

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

describe('email validator - kasus tepi', () => {
  const INVALID = 'Format email tidak valid';

  it('menolak nilai kosong, spasi saja, dan undefined', () => {
    expect(validators.email('')).toBe(INVALID);
    expect(validators.email('   ')).toBe(INVALID);
    expect(validators.email(undefined)).toBe(INVALID);
  });

  it('menolak email lebih dari 254 karakter', () => {
    const panjang = `${'a'.repeat(250)}@x.com`;
    expect(panjang.length).toBeGreaterThan(254);
    expect(validators.email(panjang)).toBe(INVALID);
  });

  it('menolak email dengan lebih dari satu "@"', () => {
    expect(validators.email('a@b@c.com')).toBe(INVALID);
  });

  it('menolak spasi di bagian lokal maupun domain', () => {
    expect(validators.email('a b@x.com')).toBe(INVALID);
    expect(validators.email('a@x .com')).toBe(INVALID);
  });

  it('menolak domain tanpa titik atau dengan bagian kosong', () => {
    expect(validators.email('a@localhost')).toBe(INVALID);
    expect(validators.email('a@.com')).toBe(INVALID);
    expect(validators.email('a@x.')).toBe(INVALID);
    expect(validators.email('a@x..com')).toBe(INVALID);
  });
});

describe('useForm hook', () => {
  const setup = () =>
    renderHook(() => useForm({ nama: '' }, { nama: validators.required('Nama') }));

  it('menghapus error field saat pengguna mulai mengetik', () => {
    const { result } = setup();

    act(() => {
      expect(result.current.validate()).toBe(false);
    });
    expect(result.current.errors.nama).toBe('Nama wajib diisi');

    act(() => {
      result.current.set('nama')({ target: { value: 'Edwin' } });
    });
    expect(result.current.values.nama).toBe('Edwin');
    expect(result.current.errors.nama).toBe('');
  });

  it('mengetik pada field tanpa error tidak menambah error', () => {
    const { result } = setup();
    act(() => {
      result.current.set('nama')({ target: { value: 'E' } });
    });
    expect(result.current.errors).toEqual({});
  });

  it('reset mengembalikan nilai awal dan menghapus error', () => {
    const { result } = setup();
    act(() => {
      result.current.set('nama')({ target: { value: 'Edwin' } });
      result.current.validate();
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.values).toEqual({ nama: '' });
    expect(result.current.errors).toEqual({});
  });
});
