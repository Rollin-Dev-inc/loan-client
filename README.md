# Aplikasi Frontend Rental Mobil / Peminjaman Barang

Frontend ini adalah sebuah sistem manajemen antarmuka berkinerja tinggi yang dibangun untuk memantau inventaris dan siklus sewa-menyewa menggunakan **React + Vite** & **Tailwind CSS v4**.

## ✨ Fitur-Fitur Utama

- **Sistem Autentikasi RBAC (Aman)**: Pemisahan level akun (`ADMIN` & `STAFF`). Seluruh menu navigasi, tombol Hapus/Ubah Barang, hingga wawasan Dasbor Finansial tersembunyi dengan apik untuk Staf Biasa.
- **Pengepakan Komponen Dasbor Premium**:
  - Tinjauan Metrik berdasarkan Rentang Waktu
  - Tombol Unduh Laporan Pinjaman ke Format CSV/Excel
  - *Popup Chart* Visualisasi Item Peminjaman Populer
  - Modul Tabel Riwayat Audit Sistem Sejarah Lengkap
- **Manajemen Formulir Sewa (Loans)**:
  - Form Pembuatan peminjam asinkron dengan kalkulasi Jatuh Tempo visual.
  - Saringan pencarian kuat (Berbasis Tanggal, Kata Kunci, Status, dsb).
  - Tanda Notifikasi Tenggat Jatuh Tempo (*Overdue notifications*).
  - Status Lacak Pengembalian Otomatis mengurangi/menambah *Stock* Gudang.
- **Daftar Master Data Inventaris (Items)**:
  - Form Pembuatan Kategori yang tanggap.
  - Komponen **Multi-Upload Foto** Interaktif: Penampil Pratinjau *Thumbnail*, dukungan Penghapusan Foto dari awan, dan Modul Penjelajah (*Carousel Viewer Popup*) tanpa bingkai gawai peramban baku.
  - Fungsionalitas Edit Formulir Barang Penuh (Termasuk Foto-foto lama).
  - Perlindungan *Soft-Delete* tanpa merusak historis data lama di dasbor (Asalkan Barang sudah beres dipinjam).

## 🛡️ Lapisan Eksklusif Anti-Tamper Watermark

Aplikasi React ini ditenagai **Pelindung Hard-Mode Watermark Obfuscator**. Logo `Powered by Rollindev | Pabloraka` adalah bukti kuat yang terus bermutasi menempel ke dalam struktur utama `index.html`. 
Skrip injeksi direkayasa menggunakan kompresi Heksadesimal `MutationObserver` dan putaran Poling Waktu `setInterval` canggih. Segala macam upaya dari AdBlocker maupun Peretas Iseng (*Display: none*) melalui _Inspect Element Browser_ akan segera digagalkan dan di-regenerasi otomatis sepersekian milidetik!

---

## 🛠️ Prasyarat Lingkungan

- Node.js 18+ (disarankan menggunakan versi LTS)
- Backend API berjalan sinkron di port standar (`http://localhost:8000`) 

## 🔌 Konfigurasi `.env` Lingkungan

Salin dan buat berkas rahasia dari *template* yang tersedia:
```bash
copy .env.example .env
```

Pusatkan konfigurasi *Bridge* URL Backend yang menjembatani jalaur komunikasi Frontend:
```env
VITE_API_BASE_URL=http://localhost:8000
```
> **Catatan Kesalahan Umum**: Teks galat raksasa dari Peladen kini diterjemahkan utuh menjadi Notifikasi Bahasa Indonesia yang renyah menggunakan Filter `parseApiError`.

---

## 🚀 Perintah Pemandu Pembangunan

Mode Jembangan Lokal Cepat (React Vite):
```bash
npm run dev
```

Kompilasi ke Paket Publikasi (Production Build):
```bash
npm run build
```

Pratinjau Uji Coba Laman Final (Preview Build):
```bash
npm run preview
```

## 📂 Peta Struktur Direktori

Kiblat kode terpusat dalam rancang bangun modular:

```text
src/
|-- components/   # Rakitan puzzle reusable (Button, Sidebar, Table, Modal Penuh, TextBox)
|-- config/       # Penyimpan Konstanta Env/URL Backend Dasar
|-- pages/        # Koleksi Ruang Utama (Login, Dashboard Utama, ListLoan, ListItem, AuditLog)
|-- services/     # Motor Jaringan Penghubung HTTP (*Fetch* ke Endpoints API dengan Token Bearer)
|-- utils/        # Kolektor Perkakas Pembantu Terpusat (Pengurai Api Error Translator Indonesia)
|-- App.jsx       # Gerbang Utama Rute + Blokade Login/Redirection
|-- main.jsx      # *Entry React* Injeksi + Penampung Obfuscator Paten Watermark 🛡️
`-- index.css     # Pangkalan Utilitas *Tailwind CSS v4*
```

---
Catatan: Sesi Token diselamatkan di `localStorage` bertajuk `access_token` & `user_role`. Jika terkena hambatan _CORS Error_, sesuaikan baris *Origins* Backend secepatnya.
