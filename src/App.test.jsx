import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import App from './App.jsx';

vi.mock('./auth.jsx', () => ({ useAuth: vi.fn() }));
vi.mock('react-hot-toast', () => ({ Toaster: () => null }));
vi.mock('./hooks/useNotifikasi.js', () => ({
  useNotifikasi: () => ({
    notifications: [],
    unreadCount: 0,
    markRead: vi.fn(),
    markAllRead: vi.fn(),
  }),
}));
vi.mock('./components/NavBar.jsx', () => ({ default: () => <nav>navbar</nav> }));
vi.mock('./pages/Login.jsx', () => ({ default: () => <div>Halaman Login</div> }));
vi.mock('./pages/Katalog.jsx', () => ({
  default: ({ onAdd, cart }) => (
    <div>
      <span>Halaman Katalog</span>
      <button onClick={() => onAdd({ id: 1, stok: 2 })}>tambah</button>
      <span data-testid="cart">{cart.map((x) => `${x.menu.id}x${x.jumlah}`).join(',')}</span>
    </div>
  ),
}));
vi.mock('./pages/Keranjang.jsx', () => ({ default: () => <div>Halaman Keranjang</div> }));
vi.mock('./pages/Riwayat.jsx', () => ({ default: () => <div>Halaman Riwayat</div> }));
vi.mock('./pages/Dashboard.jsx', () => ({ default: () => <div>Halaman Dashboard</div> }));
vi.mock('./pages/Profil.jsx', () => ({ default: () => <div>Halaman Profil</div> }));
vi.mock('./pages/Notifikasi.jsx', () => ({ default: () => <div>Halaman Notifikasi</div> }));

const mahasiswa = { nama: 'Mhs', role: 'mahasiswa' };
const penjual = { nama: 'Sari', role: 'penjual' };

function renderApp(path, { user = null, loading = false } = {}) {
  useAuth.mockReturnValue({ user, loading, logout: vi.fn() });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('App routing & guard', () => {
  it('tamu melihat katalog di "/"', () => {
    renderApp('/');
    expect(screen.getByText('Halaman Katalog')).toBeTruthy();
  });

  it('tidak merender halaman selama auth masih loading', () => {
    const { container } = renderApp('/', { loading: true });
    expect(container.querySelector('#app-loading')).toBeTruthy();
    expect(screen.queryByText('Halaman Katalog')).toBeNull();
  });

  it('penjual di "/" diarahkan ke dashboard', async () => {
    renderApp('/', { user: penjual });
    expect(await screen.findByText('Halaman Dashboard')).toBeTruthy();
  });

  it('tamu yang membuka halaman terproteksi diarahkan ke login', () => {
    renderApp('/keranjang');
    expect(screen.getByText('Halaman Login')).toBeTruthy();
  });

  it('tamu tidak bisa membuka profil dan notifikasi', () => {
    renderApp('/profil');
    expect(screen.getByText('Halaman Login')).toBeTruthy();
  });

  it('mahasiswa bisa membuka keranjang dan riwayat (lazy load)', async () => {
    renderApp('/keranjang', { user: mahasiswa });
    expect(await screen.findByText('Halaman Keranjang')).toBeTruthy();
  });

  it('mahasiswa tidak bisa membuka dashboard penjual', () => {
    renderApp('/dashboard', { user: mahasiswa });
    expect(screen.getByText('Halaman Katalog')).toBeTruthy();
  });

  it('penjual tidak bisa membuka keranjang mahasiswa', async () => {
    renderApp('/keranjang', { user: penjual });
    expect(await screen.findByText('Halaman Dashboard')).toBeTruthy();
  });

  it('user yang login bisa membuka profil', async () => {
    renderApp('/profil', { user: mahasiswa });
    expect(await screen.findByText('Halaman Profil')).toBeTruthy();
  });

  it('rute /auth/register menampilkan halaman login/daftar', () => {
    renderApp('/auth/register');
    expect(screen.getByText('Halaman Login')).toBeTruthy();
  });
});

describe('App keranjang', () => {
  it('menambah menu baru dan membatasi jumlah sesuai stok', () => {
    renderApp('/', { user: mahasiswa });
    const cart = () => screen.getByTestId('cart').textContent;

    fireEvent.click(screen.getByText('tambah'));
    expect(cart()).toBe('1x1');

    fireEvent.click(screen.getByText('tambah'));
    expect(cart()).toBe('1x2');

    // stok = 2, jadi tidak boleh melebihi 2
    fireEvent.click(screen.getByText('tambah'));
    expect(cart()).toBe('1x2');
  });
});
