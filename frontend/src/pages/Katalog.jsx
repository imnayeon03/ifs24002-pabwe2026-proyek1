import { useEffect, useState } from 'react';
import api, { rupiah } from '../api';
import { useAuth } from '../auth.jsx';

export default function Katalog({ onAdd }) {
  const [menu, setMenu] = useState([]);
  const [q, setQ] = useState('');
  const [kategori, setKategori] = useState('');
  const [err, setErr] = useState('');
  const { user } = useAuth();
  useEffect(() => {
    const t = setTimeout(() => {
      api.get('/menu', { params: { q, kategori } }).then((r) => setMenu(r.data)).catch(() => setErr('Gagal memuat menu'));
    }, 250);
    return () => clearTimeout(t);
  }, [q, kategori]);
  return (
    <>
      <section className="hero">
        <span className="eyebrow">Pre-order kantin kampus</span>
        <h1>Pesan dulu, <em>ambil tanpa antre.</em></h1>
        <p>Pilih menu favoritmu dari kios kantin, tentukan jam ambil, dan pantau status pesananmu langsung dari DelFood.</p>
      </section>
      <h2 className="section-title">Menu Hari Ini</h2>
      <div className="filters">
        <input placeholder="Cari menu..." value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={kategori} onChange={(e) => setKategori(e.target.value)}>
          <option value="">Semua kategori</option><option>Makanan</option><option>Minuman</option><option>Camilan</option>
        </select>
      </div>
      {err && <p className="error">{err}</p>}
      <div className="grid">
        {menu.map((m) => (
          <div className="card" key={m.id}>
            <span className="tag">{m.kategori}</span>
            <h3>{m.nama}</h3>
            <p className="muted">{m.kios_nama}</p>
            <p className="price">{rupiah(m.harga)}</p>
            <p className="muted small">Stok: {m.stok}</p>
            <button className="primary" disabled={!m.tersedia || m.stok < 1 || !user} onClick={() => onAdd(m)}>
              {!user ? 'Login untuk memesan' : m.stok < 1 || !m.tersedia ? 'Habis' : '+ Keranjang'}
            </button>
          </div>
        ))}
        {!menu.length && !err && <p className="muted">Menu tidak ditemukan.</p>}
      </div>
    </>
  );
}
