import { useState } from 'react';
import { useOrders } from '../hooks/useOrders.js';
import { useOrderActions } from '../hooks/useOrderActions.js';
import PesananCard from '../components/PesananCard.jsx';
import ModalBayar from '../components/ModalBayar.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';

export default function Riwayat() {
  const { orders, loading, error, reload } = useOrders();
  const { bayarOrder, konfirmasiTerima, loadingAction } = useOrderActions(reload);

  const [selectedPayOrder, setSelectedPayOrder] = useState(null);
  const [confirmOrder, setConfirmOrder] = useState(null);

  const handleBayarConfirm = async (metode) => {
    if (!selectedPayOrder) return;
    try {
      await bayarOrder(selectedPayOrder.id, selectedPayOrder.nomor_antrean, metode);
      setSelectedPayOrder(null);
    } catch {
      // error sudah ditampilkan via toast di useOrderActions
    }
  };

  const handleKonfirmasiTerimaClick = (order) => {
    setConfirmOrder(order);
  };

  const executeKonfirmasiTerima = async () => {
    if (!confirmOrder) return;
    await konfirmasiTerima(confirmOrder.id, confirmOrder.nomor_antrean);
    setConfirmOrder(null);
  };

  const renderOrdersContent = () => {
    if (loading) {
      return <LoadingSpinner text="Memuat daftar pesanan..." />;
    }
    if (orders.length === 0) {
      return <p className="muted">Belum ada pesanan.</p>;
    }
    return orders.map((o) => (
      <PesananCard
        key={o.id}
        order={o}
        onBayar={() => setSelectedPayOrder(o)}
        onKonfirmasiTerima={() => handleKonfirmasiTerimaClick(o)}
      />
    ));
  };

  return (
    <>
      <h1>Pesanan Saya</h1>
      {error && <div className="error">{error}</div>}

      {renderOrdersContent()}

      {selectedPayOrder && (
        <ModalBayar
          isOpen={!!selectedPayOrder}
          onClose={() => setSelectedPayOrder(null)}
          total={selectedPayOrder.total}
          orderNo={selectedPayOrder.nomor_antrean}
          onConfirm={handleBayarConfirm}
          loading={loadingAction}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmOrder}
        title="Konfirmasi Penerimaan Pesanan"
        message={confirmOrder ? `Konfirmasi bahwa Anda telah menerima pesanan #${confirmOrder.nomor_antrean} dari ${confirmOrder.kios_nama}?` : ''}
        confirmText="Ya, Sudah Diterima"
        cancelText="Batal"
        onConfirm={executeKonfirmasiTerima}
        onCancel={() => setConfirmOrder(null)}
      />
    </>
  );
}
