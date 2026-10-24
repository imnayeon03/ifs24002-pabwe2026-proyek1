import PropTypes from 'prop-types';
import { rupiah } from '../api';

/**
 * Komponen Presentasional: Tabel Daftar Menu Kios
 */
export default function MenuTable({ menu, onEdit, onHapusClick }) {
  if (!menu?.length) {
    return <p className="muted">Belum ada menu.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Menu</th>
          <th>Kategori</th>
          <th>Harga</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {menu.map((m) => (
          <tr key={m.id}>
            <td>{m.nama}</td>
            <td>{m.kategori}</td>
            <td>{rupiah(m.harga)}</td>
            <td>{m.stok}</td>
            <td>
              <button type="button" onClick={() => onEdit(m)}>Ubah</button>
              <button type="button" onClick={() => onHapusClick(m)}>Hapus</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

MenuTable.propTypes = {
  menu: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nama: PropTypes.string.isRequired,
      kategori: PropTypes.string.isRequired,
      harga: PropTypes.number.isRequired,
      stok: PropTypes.number.isRequired,
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onHapusClick: PropTypes.func.isRequired,
};
