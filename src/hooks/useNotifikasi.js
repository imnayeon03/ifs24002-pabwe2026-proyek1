import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { usePollingResource } from './usePollingResource';
import { fetchNotifications } from './useNotificationList.js';
import { getNotifIcon } from '../utils/notifications';

/**
 * Notifikasi + toast untuk notifikasi baru yang belum dibaca.
 */
export function useNotifikasi(user) {
  const lastIdRef = useRef(null);

  const announceNewest = useCallback((list) => {
    if (!list.length) return;
    const newest = list[0];
    if (lastIdRef.current !== null && newest.id > lastIdRef.current && !newest.dibaca) {
      toast(`${newest.judul}: ${newest.pesan}`, { icon: getNotifIcon(newest.tipe), duration: 5000 });
    }
    lastIdRef.current = newest.id;
  }, []);

  const { data: notifications, setData } = usePollingResource(fetchNotifications, {
    enabled: !!user,
    onData: announceNewest,
  });

  const markRead = useCallback(
    async (id) => {
      try {
        await api.patch(`/notifications/${id}/baca`);
        setData((prev) => prev.map((notification) => (notification.id === id ? { ...notification, dibaca: 1 } : notification)));
      } catch {
        // gagal menandai dibaca tidak kritis; polling berikutnya menyinkronkan ulang
      }
    },
    [setData]
  );

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/notifications/baca-semua');
      setData((prev) => prev.map((notification) => ({ ...notification, dibaca: 1 })));
    } catch {
      // idem
    }
  }, [setData]);

  const unreadCount = notifications.filter((notification) => !notification.dibaca).length;

  return { notifications, unreadCount, markRead, markAllRead };
}
