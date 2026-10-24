import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Profil from './Profil.jsx';
import * as auth from '../auth.jsx';

describe('Profil Component', () => {
  it('renders user details from auth', () => {
    vi.spyOn(auth, 'useAuth').mockReturnValue({
      user: { nama: 'Edwin S', email: 'edwin@del.ac.id', role: 'mahasiswa' },
    });

    render(<Profil />);

    expect(screen.getByText('Profil Saya')).toBeTruthy();
    expect(screen.getByText('Edwin S')).toBeTruthy();
    expect(screen.getByText('edwin@del.ac.id')).toBeTruthy();
    expect(screen.getByText('mahasiswa')).toBeTruthy();
  });
});
