import { useState, useCallback } from 'react';
import api, { errMsg, rupiah } from '../api';
import { useAuth } from '../auth.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { usePolling } from '../hooks/usePolling.js';
import { useForm, validators } from '../hooks/useForm.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

const STATUS = ['Diterima', 'Dimasak', 'Siap', 'Dikirim', 'Selesai'];
const EMPTY_MENU = { nama: '', harga: '', kategori: 'Makanan', stok: '' };

const menuValidators = {
  nama: validators.required('Nama menu'),
  harga: validators.positiveNumber('Harga'),
  stok: validators.nonNegativeNumber('Stok'),
};

/** Sub-komponen: Form tambah/edit menu */
function MenuForm({ editId, form, errors, onSet, onSubmit, onBatal }) {
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
      <button className="primary" type="submit">{editId ? 'Simpan Perubahan' : 'Tambah Menu'}</button>
      {editId && (
        <button type="button" onClick={onBatal}>Batal</button>
      )}
    </form>
  );
}

/** Sub-komponen: Tabel daftar menu kios */
function MenuTable({ menu, onEdit, onHapus }) {
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
              <button onClick={() => onHapus(m.id)}>Hapus</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Sub-komponen: Kartu pesanan masuk (penjual view) */
function PesananMasukCard({ order: o, onUbahStatus, onKonfirmasiKirim }) {
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
          <button type="button" className="btn-kirim" onClick={() => onKonfirmasiKirim(o)}>
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

/** Halaman utama Dashboard Penjual */
export default function Dashboard() {
  const { user } = useAuth();
  const { orders, loading: ordersLoading, reload } = useOrders();

  const [menu, setMenu] = useState([]);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const { values: form, errors: formErrors, set: setField, validate, reset, setValues } = useForm(
    EMPTY_MENU,
    menuValidators
  );

  const loadMenu = useCallback(() => {
    api.get('/menu', { params: { kios_id: user.kios_id } })
      .then((r) => setMenu(r.data))
      .catch(() => {});
  }, [user.kios_id]);

  usePolling(loadMenu);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 6000); };

  async function simpan(e) {
    e.preventDefault();
    setErr('');
    if (!validate()) return;
    const body = { ...form, harga: Number(form.harga), stok: Number(form.stok) };
    try {
      if (editId) await api.put(`/menu/${editId}`, { ...body, tersedia: true });
      else await api.post('/menu', body);
      reset();
      setEditId(null);
      loadMenu();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  }

  const hapus = async (id) => {
    if (!confirm('Hapus menu ini?')) return;
    try {
      await api.delete(`/menu/${id}`);
      loadMenu();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const ubahStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const konfirmasiKirim = async (order) => {
    if (!confirm(`Konfirmasi pesanan #${order.nomor_antrean} untuk ${order.pemesan} sudah dikirim?`)) return;
    try {
      await api.post(`/orders/${order.id}/kirim`);
      showMsg(`Pesanan #${order.nomor_antrean} berhasil ditandai sudah dikirim.`);
      reload();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const mulaiEdit = (m) => {
    setEditId(m.id);
    setValues({ nama: m.nama, harga: String(m.harga), kategori: m.kategori, stok: String(m.stok) });
  };

  const paidOrdersCount = orders.filter((o) => o.status_pembayaran === 'Sudah Dibayar' && o.status !== 'Selesai').length;

  return (
    <>
      <h1>Dashboard Penjual</h1>

      {msg && <div className="alert-success">{msg}</div>}
      {err && <div className="error">{err}</div>}

      {paidOrdersCount > 0 && (
        <div className="banner-payment-info">
          💳 <b>Notifikasi Pembayaran:</b> Terdapat {paidOrdersCount} pesanan aktif yang pembayarannya sudah lunas.
        </div>
      )}

      <h2>Pesanan Masuk</h2>
      {ordersLoading
        ? <LoadingSpinner text="Memuat pesanan..." />
        : !orders.length
          ? <p className="muted">Belum ada pesanan.</p>
          : orders.map((o) => (
              <PesananMasukCard
                key={o.id}
                order={o}
                onUbahStatus={ubahStatus}
                onKonfirmasiKirim={konfirmasiKirim}
              />
            ))
      }

      <h2>Kelola Menu</h2>
      <MenuForm
        editId={editId}
        form={form}
        errors={formErrors}
        onSet={setField}
        onSubmit={simpan}
        onBatal={() => { setEditId(null); reset(); }}
      />
      {err && <p className="error">{err}</p>}
      <MenuTable menu={menu} onEdit={mulaiEdit} onHapus={hapus} />
    </>
  );
}
