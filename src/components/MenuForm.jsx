import PropTypes from 'prop-types';

/**
 * Komponen Presentasional: Formulir Tambah dan Ubah Menu Kios
 */
export default function MenuForm({ editId, form, errors, onSet, onSubmit, onBatal, loading = false }) {
  return (
    <form className="card filters" onSubmit={onSubmit} noValidate>
      <div>
        <input
          placeholder="Nama menu"
          aria-label="Nama menu"
          value={form.nama}
          onChange={onSet('nama')}
          required
          aria-invalid={!!errors.nama}
        />
        {errors.nama && <p className="error small">{errors.nama}</p>}
      </div>
      <div>
        <input
          type="number"
          min="0"
          placeholder="Harga (Rp)"
          aria-label="Harga menu (Rp)"
          value={form.harga}
          onChange={onSet('harga')}
          required
          aria-invalid={!!errors.harga}
        />
        {errors.harga && <p className="error small">{errors.harga}</p>}
      </div>
      <select
        aria-label="Kategori menu"
        value={form.kategori}
        onChange={onSet('kategori')}
      >
        <option>Makanan</option>
        <option>Minuman</option>
        <option>Camilan</option>
      </select>
      <div>
        <input
          type="number"
          min="0"
          placeholder="Stok"
          aria-label="Jumlah stok menu"
          value={form.stok}
          onChange={onSet('stok')}
          required
          aria-invalid={!!errors.stok}
        />
        {errors.stok && <p className="error small">{errors.stok}</p>}
      </div>
      <button className="primary" type="submit" disabled={loading}>
        {loading ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Menu'}
      </button>
      {editId && (
        <button type="button" onClick={onBatal} disabled={loading}>Batal</button>
      )}
    </form>
  );
}

MenuForm.propTypes = {
  editId: PropTypes.number,
  form: PropTypes.shape({
    nama: PropTypes.string,
    harga: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    kategori: PropTypes.string,
    stok: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  errors: PropTypes.shape({
    nama: PropTypes.string,
    harga: PropTypes.string,
    kategori: PropTypes.string,
    stok: PropTypes.string,
  }),
  onSet: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBatal: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
