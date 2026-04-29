# HRIS Frontend — hris-fe-msr

> **Smart Attendance HRIS** — React JS + Vite + PWA  
> Bagian frontend dari sistem HRIS yang mencakup absensi, approval realtime, shift mapping, dan laporan kehadiran.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React JS 18 + Vite |
| PWA | vite-plugin-pwa + Workbox |
| State Management | Zustand |
| HTTP Client | Axios |
| Realtime | Laravel Echo + Pusher JS |
| Styling | Tailwind CSS |
| UI Components | Shadcn/UI |
| Routing | React Router v6 |
| Form Handling | React Hook Form + Zod |
| Camera/Webcam | react-webcam |
| QR Code | react-qr-reader |
| Maps/Geolocation | Browser Geolocation API |
| Notification | React Hot Toast |

---

## Fitur MVP

- [x] PWA Installable (manifest + service worker)
- [ ] Auth (Login, Logout, Refresh Token)
- [ ] Dashboard ringkasan kehadiran
- [ ] Absensi Selfie Webcam + Foto + Geolocation
- [ ] Absensi QR Code
- [ ] Shift Mapping per tanggal
- [ ] Pengajuan Cuti & Izin
- [ ] Approval Realtime (Pusher)
- [ ] Laporan Absensi (filter user & range tanggal)
- [ ] Rekap Data Kehadiran
- [ ] Management Pegawai (Admin)

---

## Struktur Folder

```
src/
├── assets/              # Static assets (icons, images)
├── components/
│   ├── common/          # Reusable components (Button, Modal, Badge, dll)
│   ├── layout/          # Layout utama (Sidebar, Navbar, BottomNav PWA)
│   └── ui/              # Shadcn UI components
├── hooks/               # Custom React Hooks
├── lib/
│   ├── axios.js         # Axios instance + interceptor
│   ├── echo.js          # Laravel Echo + Pusher setup
│   └── utils.js         # Helper functions
├── pages/
│   ├── auth/            # Login page
│   ├── dashboard/       # Dashboard utama
│   ├── attendance/      # Absensi (selfie, QR, geolocation)
│   ├── shift/           # Shift mapping per tanggal
│   ├── leave/           # Cuti & Izin
│   ├── approval/        # Halaman approval
│   ├── report/          # Laporan absensi
│   └── employee/        # Management pegawai (admin)
├── routes/              # Route config + Protected Route
├── services/            # API service layer per modul
├── store/               # Zustand store (auth, attendance, notification)
└── pwa/
    ├── manifest.json    # PWA manifest
    └── sw.js            # Service worker (via Workbox)
```

---

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

---

## Environment Variables

Buat file `.env` di root project:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_PUSHER_APP_KEY=your_pusher_key
VITE_PUSHER_APP_CLUSTER=ap1
```

---

## Pair Repository

Backend API: [hris-be-msr](https://github.com/AtsukoAditia/hris-be-msr)

---

## Author

**Aditia Nugraha** — [@AtsukoAditia](https://github.com/AtsukoAditia)
