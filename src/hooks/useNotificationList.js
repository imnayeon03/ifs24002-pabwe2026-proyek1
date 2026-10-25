import api from '../api';
import { usePollingResource } from './usePollingResource';

export const fetchNotifications = () => api.get('/notifications').then((response) => response.data);

/**
 * Daftar notifikasi untuk halaman Notifikasi (diperbarui berkala).
 */
export function useNotificationList() {
  const { data, error } = usePollingResource(fetchNotifications);
  return { notifications: data, error };
}
