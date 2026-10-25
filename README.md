# DelFood – Aplikasi Pre-Order dan Antrean Kantin Kampus

Proyek 1 PABWE. Front-end: ReactJS (Vite) · Back-end: Express.js · Database: SQLite.

## Menjalankan secara lokal
Prasyarat: Node.js 22.13+ dan Git.

```bash
git clone <URL-REPOSITORY>
cd delfood

# 1. Back-end (http://localhost:4000)
cd backend
npm install
npm start          # database dan data contoh dibuat otomatis

# 2. Front-end (terminal baru, http://localhost:5173)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Akun demo: `mhs@delfood.local / mahasiswa123` (mahasiswa), `sari@delfood.local / penjual123` (penjual Kios Bu Sari), `dedi@delfood.local / penjual123` (penjual Kios Es & Kopi).

## Keamanan
- **Token di `localStorage`.** Token JWT disimpan di `localStorage` (lihat komentar di `src/auth.jsx`). Artinya skrip berbahaya yang berjalan di halaman (XSS) bisa membacanya. Mitigasi: React meng-escape output dan proyek tidak memakai `dangerouslySetInnerHTML`; sesi dihapus otomatis saat server mengembalikan 401. Pilihan yang lebih aman adalah cookie `HttpOnly; Secure; SameSite` yang dikirim back-end, tetapi itu membutuhkan perubahan di back-end.
- **Dialog yang accessible.** `ModalBayar` dan `ConfirmModal` memakai `aria-modal`, `aria-labelledby`, dan jebakan fokus (`useFocusTrap`): Tab tidak keluar dari dialog, Escape menutup, dan fokus kembali ke tombol pemicu.
- **Metode pembayaran** didefinisikan sekali di `src/config/paymentMethods.js`.

## Pengujian
`cd backend && npm test` (7 tes API). Pipeline CI ada di `Jenkinsfile`.

## Endpoint API
| Method | Path | Akses | Keterangan |
|---|---|---|---|
| POST | /api/auth/register, /api/auth/login | publik | Autentikasi pengguna |
| GET | /api/kios, /api/menu?q=&kategori=&kios_id= | publik | Daftar kios & menu |
| POST/PUT/DELETE | /api/menu(/:id) | penjual | Kelola menu kios |
| POST | /api/orders | mahasiswa | Buat pesanan baru & bayar |
| GET | /api/orders | login | Riwayat pesanan (mahasiswa/penjual) |
| POST | /api/orders/:id/bayar | mahasiswa | Bayar pesanan (kirim notif ke penjual) |
| PATCH | /api/orders/:id/status | penjual | Ubah status pesanan |
| POST | /api/orders/:id/kirim | penjual | Konfirmasi sudah mengirim pesanan (kirim notif ke pembeli) |
| POST | /api/orders/:id/konfirmasi-terima | mahasiswa | Konfirmasi sudah menerima pesanan (kirim notif ke penjual) |
| GET | /api/notifications | login | Daftar notifikasi (pembayaran, pengiriman, penerimaan) |
| PATCH | /api/notifications/:id/baca | login | Tandai notifikasi dibaca |
| POST | /api/notifications/baca-semua | login | Tandai semua notifikasi dibaca |

## Deployment
Back-end: Render/Railway (`npm start`, set `JWT_SECRET`, `PORT`; pakai persistent disk untuk file SQLite). Front-end: Vercel/Netlify dengan env `VITE_API_URL=https://<url-backend>/api`.
