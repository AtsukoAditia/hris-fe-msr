# HRIS Frontend — `hris-fe-msr`

React + Vite PWA untuk **Smart Attendance HRIS**, terhubung dengan backend Laravel [`hris-be-msr`](https://github.com/AtsukoAditia/hris-be-msr).

> **Status terakhir diverifikasi:** 20 Juni 2026  
> Branch utama: `main`

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| State | Zustand |
| Form & Validation | React Hook Form, Zod |
| HTTP | Axios |
| Testing | Vitest, React Testing Library, Playwright |
| PWA | vite-plugin-pwa + Workbox |
| CI | GitHub Actions |

## Current Project Status

| Module | Backend | Frontend | Status |
|---|:---:|:---:|---|
| Foundation, API v1, Authentication & RBAC | ✅ | ✅ | Synced |
| Role-based Dashboard | ✅ | ✅ | Synced |
| Organization Master: Department, Position, Branch | ✅ | ✅ | Completed |
| Employee Management & Direct Manager Relation | ✅ | ✅ | Completed |
| Employee Profile, Emergency Contact & Documents | ✅ | ✅ | Completed |
| Employee Self-Service & Profile Change Approval | ✅ | ✅ | Completed |
| Shift & Basic Shift Schedule | ✅ | ✅ | Completed |
| Attendance: GPS, Photo, Radius & QR | ✅ | ✅ | Completed |
| Attendance Correction | ✅ | ✅ | Completed |
| Activity Log Viewer | ✅ | ✅ | Completed |
| Leave Request, Approval, Balance & History | ✅ | ✅ | Completed |
| Leave Type, Policy, Holiday & Balance Administration | ✅ | ✅ | Completed |
| Attendance, Leave & Employee Reports + CSV | ✅ | ✅ | Completed |
| **Overtime Policy & Request Workflow** | ✅ | ✅ | **Completed** |
| Payroll Foundation | ⬜ | ⬜ | Planned |

## Current Frontend Milestone — Overtime Management

Frontend overtime sudah disinkronkan dengan kontrak backend:

- Employee dapat memilih policy aktif, mengajukan lembur, melihat history, dan membatalkan request pending.
- Admin, HR, dan Manager dapat melihat request sesuai scope lalu approve atau reject.
- Admin dan HR dapat mencatat menit aktual serta mengelola overtime policy.
- Payload menggunakan `overtime_policy_id`, `overtime_date`, `planned_start_time`, `planned_end_time`, dan `reason`.
- Filter status dan tanggal, pagination, loading/error/empty state, serta validasi batas harian tersedia.
- Route `/overtime` responsif dan tersedia untuk seluruh role terautentikasi.

## Main Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login |
| `/dashboard` | All roles | Role-based dashboard |
| `/profile` | All roles | Self-profile dan emergency contacts |
| `/profile/changes` | All roles | Profile change request dan history |
| `/security` | All roles | Change password dan account security |
| `/documents` | All roles | Employee document self-service |
| `/attendance` | All roles | Attendance dan history |
| `/correction` | All roles | Attendance correction request/history |
| `/leave` | All roles | Leave request, balance, dan history |
| `/overtime` | All roles | Overtime request, review, actual minutes, dan policy sesuai role |
| `/approval` | Admin, HR, Manager | Leave approval workflow |
| `/report` | Admin, HR, Manager | Attendance, leave, dan employee reports |
| `/master-data` | Admin, HR, Manager | Department, Position, dan Branch |
| `/employee` | Admin, HR | Employee management |
| `/employee/:employeeId/profile` | Admin, HR | Employee profile management |
| `/employee/:employeeId/documents` | Admin, HR | Employee document management |
| `/profile-change-reviews` | Admin, HR | Review profile change requests |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |
| `/leave-master` | Admin, HR | Leave type, policy, holiday, dan balance administration |
| `/audit-log` | Admin, HR | Activity log viewer |


## Attendance Correction

Attendance Correction sudah tersedia untuk employee dan reviewer.

Employee dapat:

- Melihat daftar dan detail request miliknya.
- Mengajukan koreksi check-in, check-out, atau keduanya.
- Mengunggah attachment opsional.
- Membatalkan request selama masih `pending`.
- Melihat hasil approval atau rejection.

Reviewer dapat:

- Melihat request sesuai role dan scope.
- Memfilter data.
- Membandingkan attendance asli dan requested value.
- Approve atau reject.
- Melakukan manual correction untuk Admin/HR.

Service utama:

```text
src/services/correctionService.js
```

## Leave Management

Employee leave page menyediakan:

- Leave type selection.
- Date range dan duration preview.
- Request submission.
- Balance summary.
- Request history.
- Cancellation untuk request `pending`.
- Error, loading, dan empty state.

Admin/HR leave master page menyediakan pengelolaan:

- Leave types.
- Leave policies.
- Holidays.
- Leave balances dan adjustments.

Service utama:

```text
src/services/leaveService.js
src/services/leaveAdminService.js
```

## Overtime Management

Route `/overtime` menyediakan workspace berbasis role:

- **Employee:** submit, history, filter, detail ringkas, dan cancel pending request.
- **Manager:** review request direct report serta approve/reject sesuai backend policy.
- **Admin/HR:** review seluruh request, mencatat menit aktual, dan CRUD overtime policy.
- Policy aktif dibaca melalui endpoint authenticated read-only sehingga form tidak menggunakan ID hard-coded.

Service utama:

```text
src/services/overtimeService.js
```

## Employee Self-Service

Self-profile memisahkan field menjadi:

- **Direct update:** phone, address, personal email, alternate phone, domicile, city, province, dan postal code.
- **Approval required:** birth data, gender, identity, marital status, nationality, tax, social security, dan health insurance identifiers.

Employee dapat mengajukan perubahan data sensitif, melihat history/detail, memfilter status, dan membatalkan request pending. Admin/HR dapat membandingkan old/new value, approve, atau reject dengan catatan wajib.

## Employee Document Management

Employee dapat melihat summary, expiry status, metadata, version, labels, dan mengunduh dokumen melalui authenticated endpoint.

Admin/HR dapat:

- Upload dokumen.
- Edit metadata.
- Replace file dan version.
- Download.
- Delete.

File sensitif tidak menggunakan public URL.

## Activity Log Viewer

Admin dan HR dapat membuka `/audit-log` untuk:

- Melihat activity log terpaginated.
- Memfilter actor, module, action, status, dan tanggal.
- Membuka detail request/response preview.
- Melihat metadata endpoint dan actor.

Service utama:

```text
src/services/activityLogService.js
src/services/overtimeService.js
```

## API Services

```text
src/services/authService.js
src/services/attendanceService.js
src/services/correctionService.js
src/services/leaveService.js
src/services/leaveAdminService.js
src/services/activityLogService.js
src/services/overtimeService.js
src/services/profileService.js
src/services/profileChangeService.js
src/services/documentService.js
src/services/employeeService.js
src/services/departmentService.js
src/services/positionService.js
src/services/branchService.js
```

## Responsive and PWA Requirements

Frontend dikembangkan dengan prinsip:

- Mobile-first.
- Responsive desktop dan mobile.
- Loading, error, dan empty state.
- Protected route berdasarkan role.
- API error message ditampilkan secara jelas.
- Modal dan tabel tidak overflow pada viewport mobile.
- PWA foundation melalui service worker dan web app manifest.

## Testing and CI

Jalankan secara lokal:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Frontend CI menjalankan:

1. Dependency installation.
2. ESLint.
3. Vitest component tests.
4. Production build.

Mobile acceptance menggunakan:

| Device | Browser Engine |
|---|---|
| Pixel 5 | Chromium |
| iPhone 13 | WebKit |

Playwright mengunggah report dan diagnostic artifacts ketika diperlukan.

Status CI pada milestone terbaru: **lint, component tests, production build, dan mobile acceptance passing**.

## Environment

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Local Setup

```bash
git clone https://github.com/AtsukoAditia/hris-fe-msr.git
cd hris-fe-msr
npm install
cp .env.example .env
npm run dev
```

Aplikasi tersedia secara default melalui Vite development server.

Untuk mobile acceptance:

```bash
npx playwright install chromium webkit
npm run test:e2e
```

## Definition of Done

Modul dinyatakan selesai setelah backend dan frontend contract sinkron, authorization diterapkan di backend, validation state tersedia, automated tests lulus, CI hijau, mobile acceptance lulus, dan dokumentasi diperbarui.

## Next Focus

**Basic Payroll Foundation**, dimulai dari salary component, employee salary profile, payroll period, dan draft calculation yang memakai approved overtime sebagai input.
