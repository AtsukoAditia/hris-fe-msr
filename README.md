# HRIS Frontend — hris-fe-msr

React + Vite PWA untuk Smart Attendance HRIS yang terhubung dengan backend Laravel `hris-be-msr`.

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
| Employee Profile & Emergency Contact | ✅ | ✅ | Completed |
| Employee Document Management | ✅ | ✅ | Completed |
| **Employee Self-Service Completion** | ✅ | ✅ | **Completed** |

## Main Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login |
| `/dashboard` | All roles | Dashboard |
| `/profile` | All roles | Direct-edit profile dan emergency contacts |
| `/profile/changes` | All roles | Request perubahan profil dan history |
| `/security` | All roles | Keamanan akun dan forced re-login |
| `/documents` | All roles | Employee documents |
| `/attendance` | All roles | Attendance |
| `/leave` | All roles | Leave |
| `/approval` | Admin, HR, Manager | Leave approval |
| `/profile-change-reviews` | Admin, HR | Review perubahan profil |
| `/report` | Admin, HR, Manager | Reports |
| `/master-data` | Admin, HR, Manager | Department, Position, Branch |
| `/employee` | Admin, HR | Employee management |
| `/employee/:employeeId/profile` | Admin, HR | Employee profile management |
| `/employee/:employeeId/documents` | Admin, HR | Employee document management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |

## Employee Self-Service

Self-profile memisahkan field menjadi dua kategori:

- Direct update: phone, address, personal email, alternate phone, domicile, city, province, postal code.
- Approval required: birth data, gender, identity, marital status, nationality, tax, social security, dan health insurance identifiers.

Employee dapat mengajukan perubahan data sensitif, melihat history/detail, memfilter status, dan membatalkan request pending. Admin/HR dapat mencari request, membandingkan old/new value, approve, atau reject dengan catatan wajib.

Account security update membersihkan Zustand auth state dan mengarahkan user ke login kembali setelah berhasil.

Dokumentasi lengkap:

```text
docs/employee-self-service.md
```

## Employee Document Management

Employee dapat melihat summary, filter expiry, metadata, versi, label, serta download dari private authenticated endpoint. Admin/HR dapat upload, edit metadata, replace, download, dan delete.

Dokumentasi lengkap:

```text
docs/employee-document-management.md
```

## Employee Profile

Profile mendukung self-service, Admin/HR management, completion indicator, dan emergency contacts.

Dokumentasi lengkap:

```text
docs/profile-module.md
```

## API Services

```text
src/services/authService.js
src/services/profileService.js
src/services/profileChangeService.js
src/services/documentService.js
src/services/employeeService.js
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

Mobile acceptance:

| Device | Browser Engine |
|---|---|
| Pixel 5 | Chromium |
| iPhone 13 | WebKit |

Coverage mencakup Organization Master, Profile, Emergency Contact, Employee Documents, Employee Self-Service request/review flows, modal containment, dan document overflow protection.

Frontend CI menjalankan dependency installation, ESLint, Vitest, dan production build. Playwright mengunggah report, screenshots, traces, dan failure video.

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

## Definition of Done

Modul selesai setelah backend, frontend, authorization, request/response contract, validation states, automated tests, CI, mobile acceptance, dan dokumentasi sinkron.

## Next Module

Attendance Correction Request.
