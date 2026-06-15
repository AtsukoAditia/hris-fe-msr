# HRIS Frontend — hris-fe-msr

> **Smart Attendance HRIS** — React + Vite + PWA  
> Frontend HRIS berbasis role untuk employee management, shift, attendance GPS/foto/radius/QR, leave, approval, dan report.

## Project Overview

Project ini dikembangkan sebagai frontend PWA untuk backend Laravel `hris-be-msr`. Aplikasi dapat digunakan melalui browser desktop maupun mobile dan dirancang agar seluruh fitur utama HRIS tetap nyaman dipakai pada layar kecil.

- **Frontend:** React + Vite
- **State management:** Zustand
- **API client:** Axios
- **Roles:** Admin, HR, Manager, Employee
- **Pair repository:** [hris-be-msr](https://github.com/AtsukoAditia/hris-be-msr)
- **Master roadmap:** [Backend Issue #1](https://github.com/AtsukoAditia/hris-be-msr/issues/1)

---

## Current Status

| Module | Status | Description |
|---|:---:|---|
| Foundation & API Integration | ✅ | Axios instance, environment URL, protected layout |
| Authentication & Role Access | ✅ | Login, logout, auth hydration, role routes dan sidebar |
| Dashboard | ✅ | Dashboard operasional dan personal berdasarkan role |
| Employee Management | ✅ | CRUD, detail modal, filter, face enrollment |
| Shift Management | ✅ | CRUD, search/filter, overnight, late tolerance |
| Basic Shift Schedule | ✅ | Assignment shift per employee dan tanggal |
| Attendance | ✅ | Check-in/out, GPS, mobile camera, photo processing |
| Radius Attendance | ✅ | Office setting dan radius validation result |
| QR Attendance | ✅ | QR generator dan camera scanner |
| Leave Request & Balance | ✅ | Form pengajuan, saldo, history, cancellation |
| Leave Approval | ✅ | Pending list, approve, reject, history |
| Reports & CSV Export | ✅ | Attendance, leave, employee report dan download CSV |
| Organization Master Data UI | 🔵 In Progress | Department, position, branch, employee dropdown |
| Employee Self-Service | ⬜ Planned | Profile, change password, document access |
| Attendance Correction | ⬜ Planned | Request koreksi attendance |
| Notification & Audit UI | ⬜ Planned | Notification center dan activity history |
| Payroll & Payslip | ⬜ Planned | Payroll administration dan employee payslip |
| Testing & Deployment | ⬜ Planned | Automated test, PWA acceptance, production deployment |

### Current Focus — Organization Master Data

Frontend issue: [Implement organization master data UI](https://github.com/AtsukoAditia/hris-fe-msr/issues/1)

Target awal:

1. Halaman Master Data untuk Admin dan HR.
2. Tab Department, Position, dan Branch.
3. CRUD, search, active filter, loading, empty state, dan validation feedback.
4. Dropdown department, position, branch, dan direct manager pada form employee.
5. Menghapus ketergantungan terhadap input department dan position berbentuk teks bebas.
6. Responsive layout untuk desktop dan mobile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State Management | Zustand |
| HTTP Client | Axios |
| Icons | Lucide React |
| PWA | vite-plugin-pwa + Workbox |
| QR Scanner | html5-qrcode |
| QR Generator | qrcode |
| Camera Upload | Browser file input dengan `capture` |
| Geolocation | Browser Geolocation API |
| Mobile Testing | Local network dan ngrok |

---

## Completed Features

### Authentication & Role Access

- Login menggunakan API token.
- Logout.
- Auth state persistence dengan Zustand.
- Sinkronisasi user melalui `/auth/me`.
- Protected route hydration.
- Role-based sidebar dan page access.
- Axios interceptor.
- Dukungan request API melalui ngrok.

### Dashboard

Admin, HR, dan Manager:

- Employee summary.
- Attendance summary.
- Leave summary.
- Shift summary.
- Recent attendance dan leave.

Employee:

- Attendance hari ini.
- Shift hari ini.
- Saldo cuti.
- Riwayat attendance dan leave pribadi.

### Employee Management

- Employee list dengan search dan filter.
- Add, edit, detail, dan delete/nonaktif employee.
- Face enrollment upload.
- Face registration status.
- Photo preview.

### Shift & Schedule

- Shift list.
- Add, edit, delete/nonaktif shift.
- Search nama, kode, dan deskripsi.
- Filter active/inactive.
- Regular dan overnight shift.
- Late tolerance.
- Assignment shift per employee dan tanggal.

### Attendance

Employee:

- Check-in dan check-out.
- GPS location.
- Selfie photo evidence.
- Foto dikonversi ke JPEG, di-resize, dan dikompres sebelum upload.
- QR scanner melalui kamera.
- Status, late minute, overtime minute, dan radius result.
- Riwayat attendance pribadi.

Admin, HR, dan Manager:

- Monitoring attendance employee.
- Filter employee, tanggal, dan status.
- Search cepat.
- Office location dan radius setting.
- QR attendance generator untuk Admin dan HR.

### Leave & Approval

Employee:

- Leave balance.
- Leave request form.
- Leave history.
- Status pending, approved, rejected, dan cancelled.
- Cancellation untuk request pending.

Admin, HR, dan Manager:

- Pending approval list.
- Approve dan reject.
- Rejection reason.
- Approval history.
- Filter jenis cuti, status, dan keyword.

### Reports

- Attendance report.
- Leave report.
- Employee report.
- Filter bulan/tahun dan rentang tanggal.
- Filter department, employee, status, dan jenis cuti.
- Summary cards.
- Download CSV.

---

## Role Access

| Menu / Page | Admin | HR | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Attendance | ✅ | ✅ | ✅ | ✅ |
| Leave | ✅ | ✅ | ✅ | ✅ |
| Approval | ✅ | ✅ | ✅ | ❌ |
| Report | ✅ | ✅ | ✅ | ❌ |
| Employee | ✅ | ✅ | ❌ | ❌ |
| Shift | ✅ | ✅ | ❌ | ❌ |
| Shift Schedule | ✅ | ✅ | ❌ | ❌ |
| Attendance Setting — Read | ✅ | ✅ | ✅ | ❌ |
| Attendance Setting — Write | ✅ | ✅ | ❌ | ❌ |
| QR Generator | ✅ | ✅ | ❌ | ❌ |
| Master Data — Planned | ✅ | ✅ | ❌ | ❌ |

---

## Application Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login page |
| `/dashboard` | All roles | Role-aware dashboard |
| `/attendance` | All roles | Attendance pribadi atau monitoring |
| `/leave` | All roles | Leave request dan history pribadi |
| `/approval` | Admin, HR, Manager | Leave approval |
| `/report` | Admin, HR, Manager | Reports dan CSV export |
| `/employee` | Admin, HR | Employee management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Basic shift assignment |
| `/master-data` | Admin, HR | Planned organization master data page |

---

## Development Roadmap

### Phase 1 — Core Stabilization

- [ ] Organization master data UI.
- [ ] Employee profile dan emergency contact UI.
- [ ] Employee document management UI.
- [ ] Employee self-service profile.
- [ ] Change password page.
- [ ] Attendance correction request.
- [ ] Generic approval interface.
- [ ] Audit log viewer.
- [ ] Notification center.

### Phase 2 — Time, Attendance & Leave Expansion

- [ ] Shift schedule calendar.
- [ ] Bulk dan rotating shift UI.
- [ ] Day off dan holiday calendar.
- [ ] Overtime request dan approval.
- [ ] Leave policy management.
- [ ] Leave attachment.
- [ ] Half-day leave dan hourly permission.
- [ ] Attendance anomaly indicators.

### Phase 3 — Payroll

- [ ] Salary component administration.
- [ ] Employee salary profile.
- [ ] Payroll period dan calculation UI.
- [ ] Payroll review dan finalization.
- [ ] Employee payslip.
- [ ] Payroll report.

### Phase 4 — Portfolio Hardening

- [ ] Component dan flow tests.
- [ ] Mobile responsive review.
- [ ] PWA install acceptance test.
- [ ] Error boundary dan consistent feedback component.
- [ ] Accessibility review.
- [ ] Production build dan deployment.
- [ ] Final screenshots dan portfolio documentation.

Optional future modules:

- Recruitment.
- Onboarding dan offboarding.
- Performance management.
- Reimbursement.
- Asset management.
- Announcement dan company calendar.

### Definition of Done

Sebuah frontend module dianggap selesai apabila:

- API sudah terintegrasi tanpa mock data.
- Role access sesuai backend.
- Loading, empty state, error state, dan success feedback tersedia.
- Form mempunyai client-side dan server validation feedback.
- Responsive pada mobile dan desktop.
- Alur utama sudah diuji.
- README atau dokumentasi terkait diperbarui.

---

## Project Structure

```txt
src/
├── assets/                    # Static assets
├── components/
│   ├── layout/                # Sidebar dan application shell
│   ├── shift/                 # Shift components
│   └── ui/                    # Reusable UI components
├── hooks/                     # Custom hooks
├── lib/
│   ├── axios.js               # Axios instance dan interceptor
│   └── utils.js               # Shared utilities
├── pages/
│   ├── auth/                  # Login
│   ├── dashboard/             # Dashboard summary
│   ├── employee/              # Employee management
│   ├── shift/                 # Shift management
│   ├── shift-schedule/        # Shift assignment
│   ├── attendance/            # GPS, photo, radius, dan QR
│   ├── leave/                 # Leave request
│   ├── approval/              # Leave approval
│   └── report/                # Reports dan export
├── routes/                    # React Router dan ProtectedRoute
├── services/                  # API services per module
└── store/                     # Zustand stores
```

Planned master data structure:

```txt
src/
├── pages/master-data/MasterDataPage.jsx
├── components/master-data/
│   ├── DepartmentTab.jsx
│   ├── PositionTab.jsx
│   └── BranchTab.jsx
└── services/
    ├── departmentService.js
    ├── positionService.js
    └── branchService.js
```

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hris.test` | `password123` |
| HR | `hr@hris.test` | `password123` |
| Manager | `manager@hris.test` | `password123` |
| Employee | `employee@hris.test` | `password123` |

---

## Environment Variables

Buat file `.env` di root project:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Untuk mobile testing dengan backend ngrok:

```env
VITE_API_BASE_URL=https://your-backend-ngrok-url.ngrok-free.app/api/v1
```

Restart Vite setiap kali `.env` berubah.

---

## Local Setup

```bash
npm install
npm run dev
```

Default development server:

```txt
http://localhost:3000
```

Agar dapat diakses dari jaringan lokal atau ngrok:

```bash
npm run dev -- --host 0.0.0.0
```

---

## Mobile Testing with ngrok

### 1. Run Backend

```bash
cd hris-be-msr
php artisan serve --host=0.0.0.0 --port=8000
ngrok http 8000
```

### 2. Configure Frontend

```env
VITE_API_BASE_URL=https://your-backend-ngrok-url.ngrok-free.app/api/v1
```

### 3. Run Frontend

```bash
cd hris-fe-msr
npm run dev -- --host 0.0.0.0
ngrok http 3000
```

Buka URL frontend ngrok melalui Chrome Android dan izinkan akses kamera serta lokasi.

---

## Attendance Photo Processing

Foto dari kamera mobile diproses sebelum upload:

```txt
1. Validasi file tidak kosong
2. Load image dari object URL
3. Resize maksimal 1280px
4. Convert ke JPEG
5. Compress dengan quality 0.82
6. Upload sebagai multipart/form-data
```

Proses ini membuat upload kamera Android lebih stabil dibanding mengirim file mentah.

---

## PWA Cache Troubleshooting

Service worker dapat menyimpan build lama ketika development. Jalankan di browser console bila perubahan tidak muncul:

```js
navigator.serviceWorker.getRegistrations().then((registrations) => {
  registrations.forEach((registration) => registration.unregister())
})

caches.keys().then((keys) => {
  keys.forEach((key) => caches.delete(key))
})

localStorage.removeItem('hris-auth-storage')
location.reload()
```

Axios juga mengirim header berikut ketika menggunakan backend ngrok:

```txt
ngrok-skip-browser-warning: true
```

---

## Pair Repository

Backend Laravel API: [AtsukoAditia/hris-be-msr](https://github.com/AtsukoAditia/hris-be-msr)

---

## Author

**Aditia Nugraha** — [@AtsukoAditia](https://github.com/AtsukoAditia)
