import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm, validators } from '../hooks/useForm.js';
import { useAuthSubmit } from '../hooks/useAuthSubmit.js';

const registerValidators = {
  nama: validators.required('Nama'),
  username: validators.email,
  password: validators.minLength(6),
};

const modeFromPath = (pathname) => (pathname.includes('register') ? 'register' : 'login');

export default function Login() {
  const routerLocation = useLocation();
  const [mode, setMode] = useState(modeFromPath(routerLocation.pathname));
  const { loading, submit } = useAuthSubmit(mode);

  // Login hanya mewajibkan field terisi (ditangani di handleSubmit);
  // validasi format/panjang hanya berlaku saat mendaftar.
  const activeValidators = mode === 'register' ? registerValidators : {};
  const { values: form, errors, set: setField, validate, reset } = useForm(
    { username: '', password: '', nama: '' },
    activeValidators
  );

  useEffect(() => {
    const modeFromUrl = modeFromPath(routerLocation.pathname);
    if (modeFromUrl !== mode) {
      setMode(modeFromUrl);
      reset();
    }
  }, [routerLocation.pathname]); // eslint-disable-line

  async function handleSubmit(event) {
    event.preventDefault();

    // Sumber kebenaran tunggal: state dari useForm (input terkontrol), tanpa membaca DOM.
    const username = form.username.trim();
    const password = form.password.trim();
    const nama = form.nama.trim();

    if (mode === 'login') {
      if (!username || !password) {
        toast.error('Username dan password wajib diisi');
        return;
      }
    } else if (!validate()) {
      return;
    }

    await submit({ username, password, nama });
  }

  const getSubmitText = () => {
    if (loading) return 'Memproses...';
    if (mode === 'login') return 'Masuk';
    return 'Daftar';
  };

  return (
    <form id="form-login" className="card narrow" onSubmit={handleSubmit} noValidate>
      <h1>{mode === 'login' ? 'Masuk' : 'Daftar Mahasiswa'}</h1>

      {mode === 'register' && (
        <div>
          <label htmlFor="nama">Nama</label>
          <input
            id="nama"
            name="nama"
            value={form.nama}
            onChange={setField('nama')}
            required
            aria-invalid={!!errors.nama}
          />
          {errors.nama && <p className="error small">{errors.nama}</p>}
        </div>
      )}

      <div>
        <label htmlFor="username">
          {mode === 'register' ? 'Email' : 'Username / Email'}
        </label>
        <input
          id="username"
          name="username"
          type={mode === 'register' ? 'email' : 'text'}
          autoComplete="username"
          value={form.username}
          onChange={setField('username')}
          required
          aria-invalid={!!errors.username}
        />
        {errors.username && <p className="error small">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={form.password}
          onChange={setField('password')}
          required
          minLength={6}
          aria-invalid={!!errors.password}
        />
        {errors.password && <p className="error small">{errors.password}</p>}
      </div>

      <button id="btn-submit" name="btn-submit" className="primary" type="submit" disabled={loading}>
        {getSubmitText()}
      </button>

      <p className="muted">
        {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <button
          type="button"
          className="btn-link"
          id="btn-switch-mode"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            reset();
          }}
        >
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </button>
      </p>
      <p className="muted small">
        Demo: mhs@delfood.local / mahasiswa123 · penjual: sari@delfood.local / penjual123
      </p>
    </form>
  );
}
