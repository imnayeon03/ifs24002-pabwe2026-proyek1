import { describe, it, expect } from 'vitest';
import { getNotifIcon, NOTIF_ICONS } from './notifications';

describe('notifications utility', () => {
  it('harus mengembalikan ikon pembayaran dengan benar', () => {
    expect(getNotifIcon('pembayaran')).toBe('💳');
  });

  it('harus mengembalikan ikon pengiriman dengan benar', () => {
    expect(getNotifIcon('pengiriman')).toBe('🚚');
  });

  it('harus mengembalikan ikon penerimaan dengan benar', () => {
    expect(getNotifIcon('penerimaan')).toBe('✅');
  });

  it('harus mengembalikan default icon jika tipe tidak dikenal atau kosong', () => {
    expect(getNotifIcon('unknown_type')).toBe('🔔');
    expect(getNotifIcon(null)).toBe('🔔');
    expect(getNotifIcon(undefined)).toBe('🔔');
  });

  it('harus memiliki daftar NOTIF_ICONS yang konsisten', () => {
    expect(NOTIF_ICONS).toHaveProperty('pembayaran');
    expect(NOTIF_ICONS).toHaveProperty('pengiriman');
    expect(NOTIF_ICONS).toHaveProperty('penerimaan');
    expect(NOTIF_ICONS).toHaveProperty('default');
  });
});
