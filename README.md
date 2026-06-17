# HRIS Frontend — hris-fe-msr

React + Vite PWA untuk Smart Attendance HRIS. Aplikasi ini terhubung dengan backend Laravel `hris-be-msr` melalui REST API terautentikasi.

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| HTTP | Axios |
| Testing | Vitest, React Testing Library, Playwright |
| PWA | vite-plugin-pwa + Workbox |

## Module Status

| Module | Backend | Frontend | Status |
|---|:---:|:---:|---|
| Authentication & Role Access | ✅ | ✅ | Synced |
| Dashboard | ✅ | ✅ | Synced |
| Employee Management | ✅ | ✅ | Synced |
| Attendance, Leave, Shift & Report | ✅ | ✅ | Synced |
| Department, Position & Branch | ✅ | ✅ | Completed |
| Employee Manager Relation | ✅ | ✅ | Completed |
| Organization Mobile Acceptance | ✅ | ✅ | Completed |
| Employee Profile & Emergency Contact | ✅ | ✅ | Completed |
| **Employee Document Management** | ✅ | ✅ | **Completed** |

## Main Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login |
| `/dashboard` | All roles | Dashboard |
| `/profile` | All roles | Self profile dan emergency contacts |
| `/documents` | All roles | Self-service Employee documents |
| `/attendance` | All roles | Attendance |
| `/leave` | All roles | Leave |
| `/approval` | Admin, HR, Manager | Approval |
| `/report` | Admin, HR, Manager | Reports |
| `/master-data` | Admin, HR, Manager | Department, Position, Branch |
| `/employee` | Admin, HR | Employee management |
| `/employee/:employeeId/profile` | Admin, HR | Employee profile management |
| `/employee/:employeeId/documents` | Admin, HR | Employee document management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |

## Employee Document Management

### Self-Service

Employee dapat:

- Melihat summary dokumen.
- Mencari dan memfilter berdasarkan kategori serta status expiry.
- Melihat metadata, versi, ukuran file, dan label.
- Mengunduh file melalui private authenticated endpoint.

### Admin dan HR

Admin dan HR dapat:

- Mengunggah PDF, JPG, PNG, atau WEBP maksimal 10 MB.
- Mengubah metadata dokumen.
- Mengganti file sambil mempertahankan ID dokumen.
- Melihat version increment.
- Menghapus dan mengunduh dokumen Employee.

Status expiry yang didukung:

```text
valid
expiring
expired
without_expiry
```

Dokumentasi lengkap:

```text
docs/employee-document-management.md
```

## Employee Profile

Profile mendukung self-service dan Admin/HR management, data personal lanjutan, completion indicator, serta emergency contact dengan satu kontak utama.

Dokumentasi lengkap:

```text
docs/profile-module.md
```

## API Services

```text
src/services/employeeService.js
src/services/profileService.js
src/services/documentService.js
src/services/departmentService.js
src/services/positionService.js
src/services/branchService.js
```

## Testing

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Mobile acceptance menggunakan:

| Device | Browser Engine |
|---|---|
| Pixel 5 | Chromium |
| iPhone 13 | WebKit |

Coverage mencakup Organization Master, Employee Manager, Profile, Emergency Contact, Employee Document upload/edit/replace/download, modal containment, dan document-level overflow protection.

Frontend CI menjalankan dependency installation, ESLint, Vitest, dan production build. Component-test log disimpan sebagai artifact. Workflow mobile mengunggah Playwright report, screenshots, traces, dan failure video.

## Environment

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Local Setup

```bash
npm install
npm run dev
```

Mobile acceptance:

```bash
npx playwright install chromium webkit
npm run test:e2e
```

Testing dari perangkat satu jaringan:

```bash
npm run dev -- --host 0.0.0.0
```

## Definition of Done

Sebuah modul dianggap selesai setelah backend, frontend, authorization, request/response contract, validation states, automated tests, CI, mobile acceptance, dan dokumentasi sinkron.

## Next Module

Belum ditetapkan. Pemilihan berikutnya mengikuti roadmap proyek setelah Employee Document Management selesai.
