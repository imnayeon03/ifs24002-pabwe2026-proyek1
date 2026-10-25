/**
 * Sumber tunggal daftar metode pembayaran.
 * Dipakai oleh halaman Keranjang, ModalBayar, dan kartu pesanan supaya nilai
 * dan label tidak ditulis ulang di banyak tempat.
 *
 * `jenis` menentukan tampilan instruksi pembayaran di ModalBayar.
 */
export const METODE_QRIS = 'QRIS';
export const METODE_TUNAI = 'Tunai';
export const DEFAULT_METODE = METODE_QRIS;

export const PAYMENT_METHODS = [
  { value: METODE_QRIS, label: 'QRIS (Semua E-Wallet & Bank)', jenis: 'qris' },
  { value: 'Transfer Bank BCA', label: 'Transfer Bank (BCA VA)', jenis: 'transfer' },
  { value: 'Transfer Bank Mandiri', label: 'Transfer Bank (Mandiri VA)', jenis: 'transfer' },
  { value: 'GoPay / OVO / Dana', label: 'E-Wallet (GoPay / OVO / Dana)', jenis: 'ewallet' },
  { value: METODE_TUNAI, label: 'Tunai di Tempat', jenis: 'tunai' },
];

/** @returns {'qris'|'transfer'|'ewallet'|'tunai'|undefined} */
export const getJenisMetode = (value) => PAYMENT_METHODS.find((method) => method.value === value)?.jenis;
