import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { hardRedirect } from '../utils/navigation';
import { AuthProvider } from '../auth.jsx';
import Login from './Login.jsx';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock('../api', () => ({
  default: { post: vi.fn() },
  errMsg: (e) => e?.response?.data?.error || 'Terjadi kesalahan, coba lagi',
}));
vi.mock('../utils/navigation', () => ({ hardRedirect: vi.fn() }));

function renderLogin(path = '/auth/login') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </MemoryRouter>
  );
}

const submit = () => fireEvent.submit(document.getElementById('form-login'));
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('Login (mode masuk)', () => {
  it('menolak submit jika username/password kosong', () => {
    renderLogin();
    submit();
    expect(toast.error).toHaveBeenCalledWith('Username dan password wajib diisi');
    expect(api.post).not.toHaveBeenCalled();
  });

  it('login mahasiswa: kirim kredensial dari state, simpan sesi, redirect ke "/"', async () => {
    api.post.mockResolvedValue({ data: { token: 'tkn', user: { nama: 'Mhs', role: 'mahasiswa' } } });
    renderLogin();
    type(/username/i, '  mhs@delfood.local ');
    type(/password/i, 'mahasiswa123');
    submit();

    await waitFor(() => expect(hardRedirect).toHaveBeenCalledWith('/'));
    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'mhs@delfood.local',
      username: 'mhs@delfood.local',
      password: 'mahasiswa123',
    });
    expect(localStorage.getItem('token')).toBe('tkn');
    expect(toast.success).toHaveBeenCalledWith('Selamat datang, Mhs!');
  });

  it('login penjual diarahkan ke /dashboard', async () => {
    api.post.mockResolvedValue({ data: { token: 't', user: { nama: 'Sari', role: 'penjual' } } });
    renderLogin();
    type(/username/i, 'sari@delfood.local');
    type(/password/i, 'penjual123');
    submit();
    await waitFor(() => expect(hardRedirect).toHaveBeenCalledWith('/dashboard'));
  });

  it('menampilkan pesan error server dan tidak redirect saat login gagal', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Kredensial salah' } } });
    renderLogin();
    type(/username/i, 'mhs@delfood.local');
    type(/password/i, 'salahsalah');
    submit();

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Kredensial salah'));
    expect(hardRedirect).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('bisa berganti mode dengan tombol switch mode', () => {
    renderLogin('/auth/login');
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Masuk');

    const switchBtn = document.getElementById('btn-switch-mode');
    fireEvent.click(switchBtn);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Daftar Mahasiswa');

    fireEvent.click(document.getElementById('btn-switch-mode'));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Masuk');
  });

  it('merespons perubahan lokasi URL pathname via effect', () => {
    function AppWrapper() {
      return (
        <MemoryRouter initialEntries={['/auth/login']}>
          <Link to="/auth/register" data-testid="link-reg">Go Register</Link>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );
    }
    render(<AppWrapper />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Masuk');

    fireEvent.click(screen.getByTestId('link-reg'));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Daftar Mahasiswa');
  });
});

describe('Login (mode daftar)', () => {
  it('menampilkan error validasi email dan tidak memanggil API', () => {
    renderLogin('/auth/register');
    type('Nama', 'Edwin');
    type('Email', 'bukan-email');
    type('Password', 'rahasia123');
    submit();

    expect(screen.getByText('Format email tidak valid')).toBeTruthy();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('mendaftar dengan data valid dan nama terisi', async () => {
    api.post.mockResolvedValue({ data: { token: 't', user: { nama: 'Edwin', role: 'mahasiswa' } } });
    renderLogin('/auth/register');
    type('Nama', 'Edwin');
    type('Email', 'edwin@delfood.local');
    type('Password', 'rahasia123');
    submit();

    await waitFor(() => expect(hardRedirect).toHaveBeenCalledWith('/'));
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      email: 'edwin@delfood.local',
      username: 'edwin@delfood.local',
      password: 'rahasia123',
      nama: 'Edwin',
    });
    expect(toast.success).toHaveBeenCalledWith('Pendaftaran berhasil!');
  });
});
