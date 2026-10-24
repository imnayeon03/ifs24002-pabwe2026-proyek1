/**
 * Utility untuk pemetaan ikon notifikasi aplikasi DelFood.
 * Menghilangkan duplikasi logika antar komponen dan hooks.
 */
export const NOTIF_ICONS = {
  pembayaran: '💳',
  pengiriman: '🚚',
  penerimaan: '✅',
  default: '🔔',
};

/**
 * Mengambil emoji ikon sesuai tipe notifikasi.
 * @param {string} tipe - Tipe notifikasi ('pembayaran' | 'pengiriman' | 'penerimaan' | string)
 * @returns {string} Emoji ikon
 */
export function getNotifIcon(tipe) {
  return NOTIF_ICONS[tipe] || NOTIF_ICONS.default;
}
