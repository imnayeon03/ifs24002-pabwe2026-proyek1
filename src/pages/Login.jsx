import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';
import { useForm, validators } from '../hooks/useForm.js';
import { hardRedirect } from '../utils/navigation.js';

const registerValidators = {
  nama: validators.required('Nama'),
  username: validators.email,
  password: validators.minLength(6),
};

export default function Login() {
  const loc = useLocation();
  const [mode, setMode] = useState(loc.pathname.includes('register') ? 'register' : 'login');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Login hanya mewajibkan field terisi (ditangani di handleSubmit);
  // validasi format/panjang hanya berlaku saat mendaftar.
  const activeValidators = mode === 'register' ? registerValidators : {};
  const { values: f, errors, set: setField, validate, reset } = useForm(
    { username: '', password: '', nama: '' },
    activeValidators
  );

  useEffect(() => {
    const newMode = loc.pathname.includes('register') ? 'register' : 'login';
    if (newMode !== mode) {
      setMode(newMode);
      reset();
    }
  }, [loc.pathname]); // eslint-disable-line

  async function handleSubmit(e) {
    e.preventDefault();

    // Sumber kebenaran tunggal: state dari useForm (input terkontrol), tanpa membaca DOM.
    const username = f.username.trim();
    const password = f.password.trim();
    const nama = f.nama.trim();

    if (mode === 'login') {
      if (!username || !password) {
        toast.error('Username dan password wajib diisi');
        return;
      }
    } else if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: username,
        username,
        password,
        ...(mode === 'register' && { nama: nama || username }),
      };
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      login(data.token, data.user);
      toast.success(mode === 'login' ? `Selamat datang, ${data.user.nama}!` : 'Pendaftaran berhasil!');

      // Redirect native (bukan navigate SPA): lihat alasan di utils/navigation.js.
      hardRedirect(data.user.role === 'penjual' ? '/dashboard' : '/');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
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
            value={f.nama}
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
          value={f.username}
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
          value={f.password}
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
