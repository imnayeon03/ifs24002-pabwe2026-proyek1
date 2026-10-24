import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api, { errMsg } from '../api';
import { usePolling } from './usePolling';

/**
 * Custom hook untuk manajemen menu kios penjual.
 * Memisahkan state & pemanggilan API menu dari Dashboard.jsx.
 */
export function useMenu(kiosId) {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadMenu = useCallback(() => {
    if (!kiosId) return;
    api.get('/menu', { params: { kios_id: kiosId } })
      .then((r) => setMenu(r.data || []))
      .catch(() => {});
  }, [kiosId]);

  usePolling(loadMenu, 5000, !!kiosId);

  const saveMenu = async (menuData, editId = null) => {
    setLoading(true);
    const body = {
      ...menuData,
      harga: Number(menuData.harga),
      stok: Number(menuData.stok),
    };
    try {
      if (editId) {
        await api.put(`/menu/${editId}`, { ...body, tersedia: true });
        toast.success(`Menu "${body.nama}" berhasil diperbarui`);
      } else {
        await api.post('/menu', body);
        toast.success(`Menu "${body.nama}" berhasil ditambahkan`);
      }
      loadMenu();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (id, nama) => {
    setLoading(true);
    try {
      await api.delete(`/menu/${id}`);
      toast.success(`Menu ${nama ? `"${nama}" ` : ''}telah dihapus`);
      loadMenu();
      return true;
    } catch (e) {
      toast.error(errMsg(e));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    menu,
    loading,
    reloadMenu: loadMenu,
    saveMenu,
    deleteMenu,
  };
}
