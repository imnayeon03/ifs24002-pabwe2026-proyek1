import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const loc = useLocation();
  const [mode, setMode] = useState(loc.pathname.includes('register') ? 'register' : 'login');
  const [f, setF] = useState({ username: '', email: '', password: '', nama: '' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loc.pathname.includes('register')) {
      setMode('register');
    } else if (loc.pathname.includes('login')) {
      setMode('login');
    }
  }, [loc.pathname]);

  const set = (k) => (e) => {
    const val = e.target.value;
    if (k === 'username' || k === 'email') {
      setF((prev) => ({ ...prev, username: val, email: val }));
    } else {
      setF((prev) => ({ ...prev, [k]: val }));
    }
  };

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const payload = {
        ...f,
        email: f.email || f.username,
        username: f.username || f.email,
        nama: f.nama || f.username,
      };
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', payload);
      login(data.token, data.user);
      nav(data.user.role === 'penjual' ? '/dashboard' : '/');
    } catch (e2) {
      setErr(errMsg(e2));
    }
  }

  return (
    <form id="form-login" className="card narrow" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Masuk' : 'Daftar Mahasiswa'}</h2>
      {mode === 'register' && (
        <label htmlFor="nama">Nama
          <input
            id="nama"
            name="nama"
            value={f.nama}
            onChange={set('nama')}
            required
          />
        </label>
      )}
      <label htmlFor="username">Username / Email
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={f.username || f.email}
          onChange={set('username')}
          required
        />
      </label>
      <label htmlFor="password">Password
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={f.password}
          onChange={set('password')}
          required
          minLength={6}
        />
      </label>
      {err && <p className="error" id="error-message">{err}</p>}
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
          }}
        >
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </a>
      </p>
      <p className="muted small">Demo: mhs@delfood.local / mahasiswa123 · penjual: sari@delfood.local / penjual123</p>
    </form>
  );
}
