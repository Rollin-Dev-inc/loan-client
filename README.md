# Frontend Rental Mobil

Frontend ini dibuat menggunakan:
- React + Vite
- Tailwind CSS v4

## Fitur Utama

- Login ke backend (`/api/v1/auth/login`)
- Dashboard:
  - Ringkasan data berdasarkan periode
  - Export data ke file CSV (bisa dibuka di Excel)
  - Popup chart item yang dipinjam
- Daftar Pinjaman:
  - Tambah peminjam
  - Filter status pinjaman
  - Notifikasi jatuh tempo
  - Konfirmasi pengembalian
- Daftar Item:
  - Buat kategori
  - Tambah item + upload foto
  - Form bisa hide/show

## Prasyarat

- Node.js 18+ (disarankan versi LTS)
- Backend berjalan di URL yang benar (default `http://localhost:8000`)

## Instalasi

```bash
npm install
```

## Konfigurasi Environment

1. Salin file env:
```bash
copy .env.example .env
```

2. Isi URL backend:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Catatan:
- Frontend membaca `VITE_API_BASE_URL` sebagai prioritas.
- Fallback lama `VITE_BACKEND_URLS` masih didukung.

## Menjalankan Project

Mode development:
```bash
npm run dev
```

Build production:
```bash
npm run build
```

Preview build:
```bash
npm run preview
```

Lint:
```bash
npm run lint
```

## Struktur Folder

```text
src/
|-- components/   # Komponen reusable UI (Button, Sidebar, Layout, Modal, dll)
|-- config/       # Env/config frontend
|-- pages/        # Halaman (Login, Dashboard, ListLoan, ListItem, dll)
|-- services/     # HTTP request ke backend API
|-- App.jsx       # Root app + auth gate sederhana
|-- main.jsx      # Entry React
`-- index.css     # Tailwind v4 import + global style
```

## Integrasi Backend

Pastikan backend memiliki:
- Auth endpoint:
  - `POST /api/v1/auth/login`
- Dashboard endpoint:
  - `GET /api/v1/dashboard/`
- Loan endpoint:
  - `GET /api/v1/loans/`
  - `POST /api/v1/loans/`
  - `PATCH /api/v1/loans/{loan_id}/confirm-return`
  - `GET /api/v1/loans/notifications`
- Category endpoint:
  - `GET /api/v1/categories/`
  - `POST /api/v1/categories/`
- Item endpoint:
  - `GET /api/v1/items/`
  - `POST /api/v1/items/`
  - `GET /api/v1/items/{item_id}/photo`

## Catatan

- Token login disimpan di `localStorage` dengan key `access_token`.
- Jika CORS error, cek `CORS_ORIGINS` di backend `.env`.
