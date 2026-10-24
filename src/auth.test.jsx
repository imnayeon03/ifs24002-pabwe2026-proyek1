import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth.jsx';

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  localStorage.clear();
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
