import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { rupiah, errMsg } from './api';
import toast from 'react-hot-toast';
import * as nav from './utils/navigation';

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

describe('api module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('rupiah formatter', () => {
    it('harus memformat angka menjadi format mata uang Rupiah', () => {
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

  describe('interceptors', () => {
    it('request interceptor attaches token if available', () => {
      localStorage.setItem('token', 'jwt-token-abc');
      const reqHandler = api.interceptors.request.handlers[0].fulfilled;

      const config = { headers: {} };
      const result = reqHandler(config);
      expect(result.headers.Authorization).toBe('Bearer jwt-token-abc');
    });

    it('request interceptor does nothing if token is not set', () => {
      const reqHandler = api.interceptors.request.handlers[0].fulfilled;
      const config = { headers: {} };
      const result = reqHandler(config);
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('response interceptor passes success response', () => {
      const resHandler = api.interceptors.response.handlers[0].fulfilled;
      const response = { status: 200, data: { ok: true } };
      expect(resHandler(response)).toBe(response);
    });

    it('response interceptor handles 401 on protected endpoint', async () => {
      vi.useFakeTimers();
      const redirectSpy = vi.spyOn(nav, 'hardRedirect').mockImplementation(() => {});
      localStorage.setItem('token', 'expired-token');
      localStorage.setItem('user', JSON.stringify({ name: 'User' }));

      const errHandler = api.interceptors.response.handlers[0].rejected;
      const error = {
        config: { url: '/orders' },
        response: { status: 401 },
      };

      await expect(errHandler(error)).rejects.toEqual(error);

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Sesi Anda telah berakhir. Silakan masuk kembali.');

      vi.advanceTimersByTime(1000);
      expect(redirectSpy).toHaveBeenCalledWith('/auth/login');
      vi.useRealTimers();
    });

    it('response interceptor does not clear session on 401 login/register failure', async () => {
      localStorage.setItem('token', 'some-token');
      const errHandler = api.interceptors.response.handlers[0].rejected;
      const error = {
        config: { url: '/auth/login' },
        response: { status: 401 },
      };

      await expect(errHandler(error)).rejects.toEqual(error);
      expect(localStorage.getItem('token')).toBe('some-token');
      expect(toast.error).not.toHaveBeenCalled();
    });

    it('response interceptor passes through non-401 errors', async () => {
      const errHandler = api.interceptors.response.handlers[0].rejected;
      const error = { response: { status: 500 } };
      await expect(errHandler(error)).rejects.toEqual(error);
    });
  });
});
