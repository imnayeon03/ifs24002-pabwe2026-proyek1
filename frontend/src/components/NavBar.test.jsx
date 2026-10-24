import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from './NavBar.jsx';

describe('NavBar Component', () => {
  const baseProps = {
    user: null,
    onLogout: vi.fn(),
    unreadCount: 0,
    showNotif: false,
    setShowNotif: vi.fn(),
    notifications: [],
    onMarkRead: vi.fn(),
    onMarkAllRead: vi.fn(),
  };

  it('renders guest navigation when user is not logged in', () => {
    render(
      <BrowserRouter>
        <NavBar {...baseProps} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Del/)).toBeTruthy();
    expect(screen.getByText('Menu')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Masuk' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Keluar/ })).toBeNull();
  });

  it('renders mahasiswa navigation when logged in as mahasiswa', () => {
    const user = { id: 1, nama: 'Mahasiswa Test', role: 'mahasiswa' };
    render(
      <BrowserRouter>
        <NavBar {...baseProps} user={user} unreadCount={3} />
      </BrowserRouter>
    );

    expect(screen.getByText('Keranjang')).toBeTruthy();
    expect(screen.getByText('Pesanan Saya')).toBeTruthy();
    expect(screen.getByText('Notifikasi')).toBeTruthy();
    expect(screen.getByText('Profil')).toBeTruthy();
    expect(screen.getByText(/Keluar \(Mahasiswa Test\)/)).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders penjual navigation when logged in as penjual', () => {
    const user = { id: 2, nama: 'Penjual Test', role: 'penjual' };
    render(
      <BrowserRouter>
        <NavBar {...baseProps} user={user} />
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.queryByText('Keranjang')).toBeNull();
  });

  it('toggles notifications and triggers logout', () => {
    const setShowNotif = vi.fn();
    const onLogout = vi.fn();
    const user = { id: 1, nama: 'Budi', role: 'mahasiswa' };

    render(
      <BrowserRouter>
        <NavBar {...baseProps} user={user} setShowNotif={setShowNotif} onLogout={onLogout} />
      </BrowserRouter>
    );

    const notifBtn = screen.getByTitle('Notifikasi');
    fireEvent.click(notifBtn);
    expect(setShowNotif).toHaveBeenCalled();

    const logoutBtn = screen.getByRole('button', { name: /Keluar/ });
    fireEvent.click(logoutBtn);
    expect(onLogout).toHaveBeenCalled();
  });
});
