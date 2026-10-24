import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ nama: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function submit(e) {
    e.preventDefault(); setErr('');
    try {
      const { data } = await api.post(mode === 'login' ? '/auth/login' : '/auth/register', f);
      login(data.token, data.user);
      nav(data.user.role === 'penjual' ? '/dashboard' : '/');
    } catch (e2) { setErr(errMsg(e2)); }
  }
  return (
    <form className="card narrow" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Masuk' : 'Daftar Mahasiswa'}</h2>
      {mode === 'register' && <label>Nama<input value={f.nama} onChange={set('nama')} required /></label>}
      <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
      <label>Password<input type="password" value={f.password} onChange={set('password')} required minLength={6} /></label>
      {err && <p className="error">{err}</p>}
      <button className="primary">{mode === 'login' ? 'Masuk' : 'Daftar'}</button>
      <p className="muted">
        {mode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Daftar' : 'Masuk'}</a>
      </p>
      <p className="muted small">Demo: mhs@delfood.local / mahasiswa123 · penjual: sari@delfood.local / penjual123</p>
    </form>
  );
}
