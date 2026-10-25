import { useState } from 'react';
import PropTypes from 'prop-types';
import { rupiah } from '../api';
import { useAuth } from '../auth.jsx';
import { useMenuCatalog } from '../hooks/useMenuCatalog.js';

export default function Katalog({ onAdd }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [kategori, setKategori] = useState('');
  const { user } = useAuth();
  const { menu, error } = useMenuCatalog({ searchQuery, kategori });

  const getButtonLabel = (menuItem) => {
    if (!user) return 'Login untuk memesan';
    if (!menuItem.tersedia || menuItem.stok < 1) return 'Habis';
    return '+ Keranjang';
  };

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Pre-order kantin kampus</span>
        <h1>Pesan dulu, <em>ambil tanpa antre.</em></h1>
        <p>Pilih menu favoritmu dari kios kantin, tentukan jam ambil, dan pantau status pesananmu langsung dari DelFood.</p>
      </section>
      <h2 className="section-title">Menu Hari Ini</h2>
      <div className="filters">
        <input
          placeholder="Cari menu..."
          aria-label="Cari menu"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <select
          id="kategori-filter"
          aria-label="Filter kategori menu"
          value={kategori}
          onChange={(event) => setKategori(event.target.value)}
        >
          <option value="">Semua kategori</option>
          <option value="Makanan">Makanan</option>
          <option value="Minuman">Minuman</option>
          <option value="Camilan">Camilan</option>
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="grid">
        {menu.map((menuItem) => (
          <div className="card" key={menuItem.id}>
            <span className="tag">{menuItem.kategori}</span>
            <h3>{menuItem.nama}</h3>
            <p className="muted">{menuItem.kios_nama}</p>
            <p className="price">{rupiah(menuItem.harga)}</p>
            <p className="muted small">Stok: {menuItem.stok}</p>
            <button
              type="button"
              className="primary"
              disabled={!menuItem.tersedia || menuItem.stok < 1 || !user}
              onClick={() => onAdd(menuItem)}
            >
              {getButtonLabel(menuItem)}
            </button>
          </div>
        ))}
        {menu.length === 0 && !error && <p className="muted">Menu tidak ditemukan.</p>}
      </div>
    </>
  );
}

Katalog.propTypes = {
  onAdd: PropTypes.func.isRequired,
};
