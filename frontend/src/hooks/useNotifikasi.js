import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { usePolling } from './usePolling';
import { getNotifIcon } from '../utils/notifications';

/**
 * Custom hook untuk mengelola notifikasi + react-hot-toast alert.
 */
export function useNotifikasi(user) {
  const [notifications, setNotifications] = useState([]);
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
            toast(`${newest.judul}: ${newest.pesan}`, {
              icon: getNotifIcon(newest.tipe),
              duration: 5000,
            });
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

  return { notifications, unreadCount, markRead, markAllRead };
}
