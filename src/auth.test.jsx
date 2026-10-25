import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth.jsx';
import api from './api';
import { config } from './config';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  config.useCookieAuth = false;
  vi.restoreAllMocks();
});

describe('AuthProvider', () => {
  it('user null jika localStorage kosong', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('membaca user dari localStorage pada render pertama', () => {
    localStorage.setItem('user', JSON.stringify({ nama: 'Edwin', role: 'mahasiswa' }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toEqual({ nama: 'Edwin', role: 'mahasiswa' });
  });

  it('tidak crash jika data user di localStorage rusak', () => {
    localStorage.setItem('user', '{bukan-json');
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('login menyimpan token & user lalu memperbarui state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login('token-abc', { nama: 'Sari', role: 'penjual' });
    });
    expect(localStorage.getItem('token')).toBe('token-abc');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ nama: 'Sari', role: 'penjual' });
    expect(result.current.user.role).toBe('penjual');
  });

  it('logout membersihkan localStorage dan user', () => {
    localStorage.setItem('token', 't');
    localStorage.setItem('user', JSON.stringify({ nama: 'Edwin' }));
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

describe('AuthProvider - localStorage gagal', () => {
  it('login tetap memperbarui state dan mencatat error jika penyimpanan gagal', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login('token-abc', { nama: 'Sari', role: 'penjual' });
    });

    expect(errorSpy).toHaveBeenCalledWith('Gagal menyimpan token ke localStorage:', expect.any(Error));
    expect(result.current.user).toEqual({ nama: 'Sari', role: 'penjual' });
  });

  it('logout tetap mengosongkan state dan mencatat error jika pembersihan gagal', () => {
    localStorage.setItem('user', JSON.stringify({ nama: 'Edwin' }));
    const { result } = renderHook(() => useAuth(), { wrapper });

    vi.spyOn(Storage.prototype, 'clear').mockImplementation(() => {
      throw new Error('storage terkunci');
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.logout();
    });

    expect(errorSpy).toHaveBeenCalledWith('Gagal membersihkan localStorage:', expect.any(Error));
    expect(result.current.user).toBeNull();
  });
});

describe('AuthProvider - mode token (default)', () => {
  it('logout tidak memanggil server', () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({});
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.logout();
    });
    expect(postSpy).not.toHaveBeenCalled();
  });
});

describe('AuthProvider - mode cookie HttpOnly', () => {
  beforeEach(() => {
    config.useCookieAuth = true;
  });

  it('login hanya menyimpan profil, tidak menyimpan token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.login('token-rahasia', { nama: 'Sari', role: 'penjual' });
    });
    expect(localStorage.getItem('token')).toBeNull();
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ nama: 'Sari', role: 'penjual' });
    expect(result.current.user.role).toBe('penjual');
  });

  it('logout meminta server menghapus cookie lalu membersihkan sesi lokal', () => {
    const postSpy = vi.spyOn(api, 'post').mockResolvedValue({});
    localStorage.setItem('user', JSON.stringify({ nama: 'Edwin' }));
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(postSpy).toHaveBeenCalledWith('/auth/logout');
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('logout tetap membersihkan sesi lokal walau server tidak terjangkau', async () => {
    vi.spyOn(api, 'post').mockRejectedValue(new Error('offline'));
    localStorage.setItem('user', JSON.stringify({ nama: 'Edwin' }));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
  });
});
