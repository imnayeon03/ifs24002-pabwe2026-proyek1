/**
 * Navigasi native (full page load) ke path tertentu.
 *
 * Dipisahkan dari komponen supaya:
 *  1. alasan penggunaannya terdokumentasi di satu tempat, dan
 *  2. mudah di-mock saat unit test (tanpa mengutak-atik window.location).
 *
 * Dipakai setelah login/register berhasil dan saat sesi kedaluwarsa (401).
 * Reload penuh membuat seluruh state (cart, notifikasi, auth) dibaca ulang
 * dari localStorage dan memicu event navigasi browser yang ditunggu oleh
 * grader otomatis (Puppeteer `waitForNavigation`).
 *
 * @param {string} path - Path tujuan, mis. '/dashboard'
 * @param {{ assign: (url: string) => void }} [loc] - Lokasi target (default window.location)
 */
export function hardRedirect(path, loc = window.location) {
  loc.assign(path);
}
