import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const loc = useLocation();
  const [mode, setMode] = useState(loc.pathname.includes('register') ? 'register' : 'login');
  const [f, setF] = useState({ nama: '', email: '', password: '' });
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

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', f);
      login(data.token, data.user);
      nav(data.user.role === 'penjual' ? '/dashboard' : '/');
    } catch (e2) {
      setErr(errMsg(e2));
    }
  }

  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Masuk' : 'Daftar Mahasiswa'}</h2>
      {mode === 'register' && (
        <label htmlFor="nama">Nama
          <input id="nama" name="nama" value={f.nama} onChange={set('nama')} required />
        </label>
      )}
      <label htmlFor="email">Email
        <input id="email" name="email" type="email" value={f.email} onChange={set('email')} required />
      </label>
      <label htmlFor="password">Password
        <input id="password" name="password" type="password" value={f.password} onChange={set('password')} required minLength={6} />
      </label>
      {err && <p className="error">{err}</p>}
      <button className="primary" type="submit">{mode === 'login' ? 'Masuk' : 'Daftar'}</button>
      <p className="muted">
        {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'Daftar' : 'Masuk'}
        </a>
      </p>
      <p className="muted small">Demo: mhs@delfood.local / mahasiswa123 · penjual: sari@delfood.local / penjual123</p>
    </form>
  );
}
