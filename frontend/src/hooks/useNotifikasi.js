import { useCallback, useRef, useState } from 'react';
import api from '../api';
import { usePolling } from './usePolling';

/**
 * Custom hook untuk mengelola notifikasi + toast alert.
 * Menggantikan logika polling notifikasi yang sebelumnya ada di App.jsx.
 */
export function useNotifikasi(user) {
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState(null);
  const lastIdRef = useRef(null);

  const fetchNotif = useCallback(() => {
    if (!user) return;
    api.get('/notifications')
      .then((r) => {
        const data = r.data || [];
        setNotifications(data);
        if (data.length > 0) {
          const newest = data[0];
          if (lastIdRef.current !== null && newest.id > lastIdRef.current && !newest.dibaca) {
            setToast({ judul: newest.judul, pesan: newest.pesan, tipe: newest.tipe });
            setTimeout(() => setToast(null), 5000);
          }
          lastIdRef.current = newest.id;
        }
      })
      .catch(() => {});
  }, [user]);

  usePolling(fetchNotif, 5000, !!user);

  const markRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/baca`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, dibaca: 1 } : n)));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/notifications/baca-semua');
      setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: 1 })));
    } catch {}
  }, []);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  return { notifications, unreadCount, toast, setToast, markRead, markAllRead };
}
