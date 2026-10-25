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
- **Sesi.** Secara default token JWT disimpan di `localStorage` (risiko dan mitigasi dijelaskan di `src/auth.jsx`): skrip berbahaya di halaman (XSS) bisa membacanya, sehingga React meng-escape output, proyek tidak memakai `dangerouslySetInnerHTML`, dan sesi dihapus otomatis saat server mengembalikan 401.
- **Mode cookie HttpOnly (opsional).** Set `VITE_USE_COOKIE_AUTH=true` agar token tidak pernah disimpan di JavaScript: browser mengirim cookie sesi (`withCredentials`) dan logout memanggil `POST /auth/logout`. Back-end harus mengirim `Set-Cookie: HttpOnly; Secure; SameSite`, menyediakan endpoint logout, dan mengizinkan CORS dengan credentials.
- **Dialog yang accessible.** Semua dialog memakai komponen `Modal` (`aria-modal`, `aria-labelledby`, jebakan fokus lewat `useFocusTrap`, Escape menutup, fokus kembali ke pemicu).

## Struktur kode
- `src/pages` halaman, `src/components` komponen tampilan (`Modal`, `ModalBayar`, `QrisCode`, kartu pesanan), `src/hooks` logika dan akses data (`useMenuCatalog`, `useNotificationList`, `useAuthSubmit`, `useOrders`, dll.), `src/config` konfigurasi (`paymentMethods`), `src/utils` fungsi bantu.
- Halaman tidak memanggil API langsung; pemanggilan API ada di hook.

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
