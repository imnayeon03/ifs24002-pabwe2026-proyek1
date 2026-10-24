import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { useOrders } from '../hooks/useOrders.js';
import { useMenu } from '../hooks/useMenu.js';
import { useOrderActions } from '../hooks/useOrderActions.js';
import { useForm, validators } from '../hooks/useForm.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import MenuForm from '../components/MenuForm.jsx';
import MenuTable from '../components/MenuTable.jsx';
import PesananMasukCard from '../components/PesananMasukCard.jsx';

const EMPTY_MENU = { nama: '', harga: '', kategori: 'Makanan', stok: '' };

const menuValidators = {
  nama: validators.required('Nama menu'),
  harga: validators.positiveNumber('Harga'),
  stok: validators.nonNegativeNumber('Stok'),
};

/**
 * Halaman Utama: Dashboard Penjual (hanya bertanggung jawab untuk koordinasi state & data)
 */
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

  // ConfirmModal hanya terbuka (dan bisa dikonfirmasi) saat target sudah terisi.
  const handleConfirmHapus = async () => {
    await deleteMenu(deleteTarget.id, deleteTarget.nama);
    setDeleteTarget(null);
  };

  const handleConfirmKirim = async () => {
    await konfirmasiKirim(kirimTarget.id, kirimTarget.nomor_antrean);
    setKirimTarget(null);
  };

  const paidOrdersCount = orders.filter((o) => o.status_pembayaran === 'Sudah Dibayar' && o.status !== 'Selesai').length;

  const renderOrdersContent = () => {
    if (ordersLoading) {
      return <LoadingSpinner text="Memuat pesanan masuk..." />;
    }
    if (orders.length === 0) {
      return <p className="muted">Belum ada pesanan.</p>;
    }
    return (
      <>
        {orders.map((o) => (
          <PesananMasukCard
            key={o.id}
            order={o}
            onUbahStatus={ubahStatus}
            onKonfirmasiKirimClick={setKirimTarget}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <h1>Dashboard Penjual</h1>

      {paidOrdersCount > 0 && (
        <div className="banner-payment-info">
          💳 <b>Notifikasi Pembayaran:</b> Terdapat {paidOrdersCount} pesanan aktif yang pembayarannya sudah lunas.
        </div>
      )}

      <h2>Pesanan Masuk</h2>
      {renderOrdersContent()}

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
