import { useCallback, useEffect, useState } from 'react';
import api, { errMsg, rupiah } from '../api';
import { useAuth } from '../auth.jsx';

const STATUS = ['Diterima', 'Dimasak', 'Siap', 'Dikirim', 'Selesai'];
const empty = { nama: '', harga: '', kategori: 'Makanan', stok: '' };

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(() => {
    api.get('/orders').then((r) => setOrders(r.data)).catch(() => {});
    api.get('/menu', { params: { kios_id: user.kios_id } }).then((r) => setMenu(r.data)).catch(() => {});
  }, [user.kios_id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, [load]);

  async function simpan(e) {
    e.preventDefault();
    setErr('');
    const body = { ...form, harga: Number(form.harga), stok: Number(form.stok) };
    try {
      if (editId) await api.put(`/menu/${editId}`, { ...body, tersedia: true });
      else await api.post('/menu', body);
      setForm(empty);
      setEditId(null);
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  }

  const hapus = async (id) => {
    if (confirm('Hapus menu ini?')) {
      await api.delete(`/menu/${id}`);
      load();
    }
  };

  const ubahStatus = async (id, status) => {
    try {
      await api.patch(`/orders/${id}/status`, { status });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const konfirmasiKirim = async (order) => {
    if (!confirm(`Konfirmasi bahwa pesanan #${order.nomor_antrean} untuk ${order.pemesan} sudah Anda kirim?`)) return;
    try {
      await api.post(`/orders/${order.id}/kirim`);
      setMsg(`Pesanan #${order.nomor_antrean} berhasil ditandai sudah dikirim. Pembeli akan diminta konfirmasi penerimaan.`);
      load();
      setTimeout(() => setMsg(''), 6000);
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const mulaiEdit = (m) => {
    setEditId(m.id);
    setForm({ nama: m.nama, harga: m.harga, kategori: m.kategori, stok: m.stok });
  };

  // Hitung pesanan yang baru dibayar
  const paidOrdersCount = orders.filter((o) => o.status_pembayaran === 'Sudah Dibayar' && o.status !== 'Selesai').length;

  return (
    <>
      <h1>Dashboard Penjual</h1>

      {msg && <div className="alert-success">{msg}</div>}
      {err && <div className="error">{err}</div>}

      {paidOrdersCount > 0 && (
        <div className="banner-payment-info">
          💳 <b>Notifikasi Pembayaran:</b> Terdapat {paidOrdersCount} pesanan aktif yang pembayarannya sudah lunas dan siap diproses/dikirim.
        </div>
      )}

      <h2>Pesanan Masuk</h2>
      {!orders.length && <p className="muted">Belum ada pesanan.</p>}

      {orders.map((o) => (
        <div className="card" key={o.id}>
          <div className="row">
            <div>
              <b>#{o.nomor_antrean} · {o.pemesan} · ambil {o.jam_ambil}</b>
              <div className="order-badges">
                <span className={`status ${o.status}`}>{o.status}</span>
                <span className={`badge-payment ${o.status_pembayaran === 'Sudah Dibayar' ? 'paid' : 'unpaid'}`}>
                  {o.status_pembayaran === 'Sudah Dibayar' ? `✓ Sudah Dibayar (${o.metode_pembayaran || 'QRIS'})` : '⚠️ Belum Dibayar'}
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
            {o.items.map((i) => (
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
                  onClick={() => ubahStatus(o.id, s)}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Tombol aksi khusus konfirmasi sudah mengirim pesanan */}
            {o.status !== 'Dikirim' && o.status !== 'Selesai' && (
              <button
                type="button"
                className="btn-kirim"
                onClick={() => konfirmasiKirim(o)}
                title="Kirimkan notifikasi dan konfirmasi bahwa pesanan sudah dikirim ke pembeli"
              >
                🚚 Konfirmasi Sudah Mengirim Pesanan
              </button>
            )}

            {o.status === 'Dikirim' && (
              <div className="delivery-waiting-note">
                🚚 <b>Pesanan Sedang Dikirim</b> · Menunggu pembeli ({o.pemesan}) memberikan konfirmasi sudah menerima pesanan.
              </div>
            )}

            {o.status === 'Selesai' && (
              <div className="delivery-done-note">
                ✅ <b>Pesanan Selesai</b> · Pembeli ({o.pemesan}) telah mengonfirmasi pesanan sudah diterima dengan baik.
              </div>
            )}
          </div>
        </div>
      ))}

      <h2>Kelola Menu</h2>
      <form className="card filters" onSubmit={simpan}>
        <input placeholder="Nama menu" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} required />
        <input type="number" min="0" placeholder="Harga" value={form.harga} onChange={(e) => setForm({ ...form, harga: e.target.value })} required />
        <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
          <option>Makanan</option>
          <option>Minuman</option>
          <option>Camilan</option>
        </select>
        <input type="number" min="0" placeholder="Stok" value={form.stok} onChange={(e) => setForm({ ...form, stok: e.target.value })} required />
        <button className="primary">{editId ? 'Simpan Perubahan' : 'Tambah Menu'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); }}>Batal</button>}
        {err && <p className="error">{err}</p>}
      </form>

      <table>
        <thead>
          <tr>
            <th>Menu</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Stok</th>
            <th></th>
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
                <button onClick={() => mulaiEdit(m)}>Ubah</button>
                <button onClick={() => hapus(m.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
