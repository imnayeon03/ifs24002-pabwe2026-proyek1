import { useState } from 'react';
import { rupiah } from '../api';
import { useAuth } from '../auth.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { useMenu } from '../hooks/useMenu.js';
import { useOrderActions } from '../hooks/useOrderActions.js';
import { useForm, validators } from '../hooks/useForm.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';

const STATUS = ['Diterima', 'Dimasak', 'Siap', 'Dikirim', 'Selesai'];
const EMPTY_MENU = { nama: '', harga: '', kategori: 'Makanan', stok: '' };

const menuValidators = {
  nama: validators.required('Nama menu'),
  harga: validators.positiveNumber('Harga'),
  stok: validators.nonNegativeNumber('Stok'),
};

/** Sub-komponen Presentasional: Form kelola menu */
function MenuForm({ editId, form, errors, onSet, onSubmit, onBatal, loading }) {
  return (
    <form className="card filters" onSubmit={onSubmit} noValidate>
      <div>
        <input
          placeholder="Nama menu"
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
          value={form.harga}
          onChange={onSet('harga')}
          required
          aria-invalid={!!errors.harga}
        />
        {errors.harga && <p className="error small">{errors.harga}</p>}
      </div>
      <select value={form.kategori} onChange={onSet('kategori')}>
        <option>Makanan</option>
        <option>Minuman</option>
        <option>Camilan</option>
      </select>
      <div>
        <input
          type="number"
          min="0"
          placeholder="Stok"
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

/** Sub-komponen Presentasional: Tabel menu */
function MenuTable({ menu, onEdit, onHapusClick }) {
  if (!menu.length) return <p className="muted">Belum ada menu.</p>;
  return (
    <table>
      <thead>
        <tr>
          <th>Menu</th><th>Kategori</th><th>Harga</th><th>Stok</th><th></th>
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
              <button onClick={() => onEdit(m)}>Ubah</button>
              <button onClick={() => onHapusClick(m)}>Hapus</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Sub-komponen Presentasional: Kartu pesanan masuk */
function PesananMasukCard({ order: o, onUbahStatus, onKonfirmasiKirimClick }) {
  const isPaid = o.status_pembayaran === 'Sudah Dibayar';

  return (
    <div className="card">
      <div className="row">
        <div>
          <b>#{o.nomor_antrean} · {o.pemesan} · ambil {o.jam_ambil}</b>
          <div className="order-badges">
            <span className={`status ${o.status}`}>{o.status}</span>
            <span className={`badge-payment ${isPaid ? 'paid' : 'unpaid'}`}>
              {isPaid ? `✅ Sudah Dibayar (${o.metode_pembayaran || 'QRIS'})` : '⏳ Belum Dibayar'}
            </span>
          </div>
        </div>
        <div className="price">{rupiah(o.total)}</div>
      </div>

      <p className="muted small">
        Dipesan: {o.created_at}
        {o.waktu_bayar && <span> · Dibayar: {o.waktu_bayar}</span>}
        {o.waktu_kirim && <span> · Dikirim: {o.waktu_kirim}</span>}
        {o.waktu_selesai && <span> · Diterima: {o.waktu_selesai}</span>}
      </p>

      <ul>
        {(o.items || []).map((i) => (
          <li key={i.menu_id}>{i.jumlah}× {i.nama} ({rupiah(i.harga)})</li>
        ))}
      </ul>

      <div className="seller-order-footer">
        <div className="status-button-group">
          <span className="small muted">Ubah status: </span>
          {STATUS.map((s) => (
            <button
              key={s}
              disabled={s === o.status}
              className={s === o.status ? 'active-status-btn' : ''}
              onClick={() => onUbahStatus(o.id, s)}
            >
              {s}
            </button>
          ))}
        </div>

        {o.status !== 'Dikirim' && o.status !== 'Selesai' && (
          <button type="button" className="btn-kirim" onClick={() => onKonfirmasiKirimClick(o)}>
            🚚 Konfirmasi Sudah Mengirim Pesanan
          </button>
        )}
        {o.status === 'Dikirim' && (
          <div className="delivery-waiting-note">
            🚚 <b>Pesanan Sedang Dikirim</b> · Menunggu {o.pemesan} konfirmasi diterima.
          </div>
        )}
        {o.status === 'Selesai' && (
          <div className="delivery-done-note">
            ✅ <b>Pesanan Selesai</b> · {o.pemesan} telah konfirmasi pesanan diterima.
          </div>
        )}
      </div>
    </div>
  );
}

/** Komponen Utama: Dashboard Penjual */
export default function Dashboard() {
  const { user } = useAuth();
  const { orders, loading: ordersLoading, reload: reloadOrders } = useOrders();
  const { menu, loading: menuLoading, saveMenu, deleteMenu } = useMenu(user.kios_id);
  const { ubahStatus, konfirmasiKirim } = useOrderActions(reloadOrders);

  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [kirimTarget, setKirimTarget] = useState(null);

  const { values: form, errors: formErrors, set: setField, validate, reset, setValues } = useForm(
    EMPTY_MENU,
    menuValidators
  );

  async function handleSimpanMenu(e) {
    e.preventDefault();
    if (!validate()) return;
    const ok = await saveMenu(form, editId);
    if (ok) {
      reset();
      setEditId(null);
    }
  }

  const handleMulaiEdit = (m) => {
    setEditId(m.id);
    setValues({ nama: m.nama, harga: String(m.harga), kategori: m.kategori, stok: String(m.stok) });
  };

  const handleConfirmHapus = async () => {
    if (!deleteTarget) return;
    await deleteMenu(deleteTarget.id, deleteTarget.nama);
    setDeleteTarget(null);
  };

  const handleConfirmKirim = async () => {
    if (!kirimTarget) return;
    await konfirmasiKirim(kirimTarget.id, kirimTarget.nomor_antrean);
    setKirimTarget(null);
  };

  const paidOrdersCount = orders.filter((o) => o.status_pembayaran === 'Sudah Dibayar' && o.status !== 'Selesai').length;

  return (
    <>
      <h1>Dashboard Penjual</h1>

      {paidOrdersCount > 0 && (
        <div className="banner-payment-info">
          💳 <b>Notifikasi Pembayaran:</b> Terdapat {paidOrdersCount} pesanan aktif yang pembayarannya sudah lunas.
        </div>
      )}

      <h2>Pesanan Masuk</h2>
      {ordersLoading ? (
        <LoadingSpinner text="Memuat pesanan masuk..." />
      ) : !orders.length ? (
        <p className="muted">Belum ada pesanan.</p>
      ) : (
        orders.map((o) => (
          <PesananMasukCard
            key={o.id}
            order={o}
            onUbahStatus={ubahStatus}
            onKonfirmasiKirimClick={setKirimTarget}
          />
        ))
      )}

      <h2>Kelola Menu</h2>
      <MenuForm
        editId={editId}
        form={form}
        errors={formErrors}
        onSet={setField}
        onSubmit={handleSimpanMenu}
        onBatal={() => { setEditId(null); reset(); }}
        loading={menuLoading}
      />

      <MenuTable
        menu={menu}
        onEdit={handleMulaiEdit}
        onHapusClick={setDeleteTarget}
      />

      {/* Modal Konfirmasi Hapus Menu */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Menu"
        message={deleteTarget ? `Apakah Anda yakin ingin menghapus menu "${deleteTarget.nama}"?` : ''}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isDanger={true}
        onConfirm={handleConfirmHapus}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Modal Konfirmasi Kirim Pesanan */}
      <ConfirmModal
        isOpen={!!kirimTarget}
        title="Konfirmasi Pengiriman Pesanan"
        message={kirimTarget ? `Konfirmasi bahwa pesanan #${kirimTarget.nomor_antrean} untuk ${kirimTarget.pemesan} sudah Anda kirim?` : ''}
        confirmText="Ya, Sudah Dikirim"
        cancelText="Batal"
        onConfirm={handleConfirmKirim}
        onCancel={() => setKirimTarget(null)}
      />
    </>
  );
}
