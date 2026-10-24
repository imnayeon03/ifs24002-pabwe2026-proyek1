import api from '../api';
import { useAsyncAction } from './useAsyncAction';
import { usePollingResource } from './usePollingResource';

/**
 * Manajemen menu kios penjual: daftar menu (polling) + simpan/hapus.
 */
export function useMenu(kiosId) {
  const { data: menu, reload } = usePollingResource(
    () => (kiosId ? api.get('/menu', { params: { kios_id: kiosId } }).then((r) => r.data) : []),
    { enabled: !!kiosId }
  );
  const { loading, run } = useAsyncAction();

  const saveMenu = async (menuData, editId = null) => {
    const body = { ...menuData, harga: Number(menuData.harga), stok: Number(menuData.stok) };
    const ok = await run(
      () => (editId ? api.put(`/menu/${editId}`, { ...body, tersedia: true }) : api.post('/menu', body)),
      { success: `Menu "${body.nama}" berhasil ${editId ? 'diperbarui' : 'ditambahkan'}` }
    );
    if (ok) reload();
    return ok;
  };

  const deleteMenu = async (id, nama) => {
    const namaLabel = nama ? `"${nama}" ` : '';
    const ok = await run(() => api.delete(`/menu/${id}`), {
      success: `Menu ${namaLabel}telah dihapus`,
    });
    if (ok) reload();
    return ok;
  };

  return { menu, loading, reloadMenu: reload, saveMenu, deleteMenu };
}
