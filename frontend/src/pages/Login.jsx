import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';
import { useForm, validators } from '../hooks/useForm.js';

/** Validator gabungan untuk field username/email login */
const loginValidators = {
  username: (v) => (!v?.trim() ? 'Username atau email wajib diisi' : null),
  password: validators.minLength(6),
};

/** Validator untuk form registrasi */
const registerValidators = {
  nama: validators.required('Nama'),
  username: validators.email,
  password: validators.minLength(6),
};

export default function Login() {
  const loc = useLocation();
  const [mode, setMode] = useState(loc.pathname.includes('register') ? 'register' : 'login');
  const [submitErr, setSubmitErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const activeValidators = mode === 'login' ? loginValidators : registerValidators;
  const { values: f, errors, set, validate, reset, setValues } = useForm(
    { username: '', password: '', nama: '' },
    activeValidators
  );

  // Sync mode dengan URL path
  useEffect(() => {
    const newMode = loc.pathname.includes('register') ? 'register' : 'login';
    if (newMode !== mode) {
      setMode(newMode);
      reset();
      setSubmitErr('');
    }
  }, [loc.pathname]); // eslint-disable-line

  // Sinkronkan username & email
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, username: val, email: val }));
    if (errors.username) {
      // reset error saat user mengetik
    }
  };

  async function submit(e) {
    e.preventDefault();
    setSubmitErr('');
    if (!validate()) return;

    try {
      const payload = {
        email: f.username,
        username: f.username,
        password: f.password,
        ...(mode === 'register' && { nama: f.nama || f.username }),
      };
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      login(data.token, data.user);
      nav(data.user.role === 'penjual' ? '/dashboard' : '/');
    } catch (e2) {
      setSubmitErr(errMsg(e2));
    }
  }

  return (
    <form id="form-login" className="card narrow" onSubmit={submit} noValidate>
      <h2>{mode === 'login' ? 'Masuk' : 'Daftar Mahasiswa'}</h2>

      {mode === 'register' && (
        <div>
          <label htmlFor="nama">Nama
            <input
              id="nama"
              name="nama"
              value={f.nama}
              onChange={set('nama')}
              required
              aria-invalid={!!errors.nama}
            />
          </label>
          {errors.nama && <p className="error small">{errors.nama}</p>}
        </div>
      )}

      <div>
        <label htmlFor="username">
          {mode === 'register' ? 'Email' : 'Username / Email'}
          <input
            id="username"
            name="username"
            type={mode === 'register' ? 'email' : 'text'}
            autoComplete="username"
            value={f.username}
            onChange={handleUsernameChange}
            required
            aria-invalid={!!errors.username}
          />
        </label>
        {errors.username && <p className="error small">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="password">Password
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={f.password}
            onChange={set('password')}
            required
            minLength={6}
            aria-invalid={!!errors.password}
          />
        </label>
        {errors.password && <p className="error small">{errors.password}</p>}
      </div>

      {submitErr && <p className="error" id="error-message">{submitErr}</p>}

      <button id="btn-submit" name="btn-submit" className="primary" type="submit">
        {mode === 'login' ? 'Masuk' : 'Daftar'}
      </button>

      <p className="muted">
        {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <a
          href="#"
          id="btn-switch-mode"
          onClick={(e) => {
            e.preventDefault();
            setMode(mode === 'login' ? 'register' : 'login');
            reset();
            setSubmitErr('');
          }}
        >
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </a>
      </p>
      <p className="muted small">
        Demo: mhs@delfood.local / mahasiswa123 · penjual: sari@delfood.local / penjual123
      </p>
    </form>
  );
}
