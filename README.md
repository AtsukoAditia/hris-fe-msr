# HRIS Frontend — hris-fe-msr

> React + Vite + PWA frontend untuk Smart Attendance HRIS.

Frontend ini terhubung langsung dengan backend Laravel [`hris-be-msr`](https://github.com/AtsukoAditia/hris-be-msr). Setiap modul hanya dinyatakan selesai setelah fitur backend, frontend, role access, tests, CI, dan dokumentasi sudah sinkron.

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| HTTP Client | Axios |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| PWA | vite-plugin-pwa + Workbox |

## Current Status

| Module | Backend | Frontend | Status |
|---|:---:|:---:|:---:|
| Authentication & Role Access | ✅ | ✅ | Synced |
| Dashboard | ✅ | ✅ | Synced |
| Employee Management | ✅ | ✅ | Synced |
| Shift Management | ✅ | ✅ | Synced |
| Shift Schedule | ✅ | ✅ | Synced |
| Attendance GPS, Photo, Radius & QR | ✅ | ✅ | Synced |
| Leave Request & Approval | ✅ | ✅ | Synced |
| Reports & CSV Export | ✅ | ✅ | Synced |
| **Department Master Data** | ✅ | ✅ | **Completed & Synced** |
| Position Master Data | ⬜ | ⬜ | Next Module |
| Branch / Work Location | ⬜ | ⬜ | Planned |

## Department Master Data

Route:

```text
/master-data
```

Fitur yang sudah tersedia:

- Department list dari API tanpa mock data.
- Search berdasarkan kode, nama, dan deskripsi.
- Filter semua, aktif, dan nonaktif.
- Statistik data yang sedang ditampilkan.
- Create Department.
- Update Department.
- Soft delete Department.
- Loading state.
- Empty state.
- Error dan success feedback.
- Laravel field validation feedback.
- Responsive table dan modal.
- Role-aware action buttons.

### Role Access Department

| Action | Admin | HR | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| View Department | ✅ | ✅ | ✅ | ❌ |
| Search & Filter | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |

Manager melihat informasi bahwa aksesnya bersifat read-only. Tombol create, edit, dan delete tidak dirender untuk Manager.

## Employee–Department Integration

Employee Management sudah menggunakan Department master data.

### Form Employee

Dropdown Department diambil dari:

```http
GET /api/v1/departments?active_only=true
```

Pilihan Department tidak lagi ditulis secara hardcoded di frontend.

Payload create dan update Employee:

```json
{
  "department_id": 1
}
```

Frontend mengirim `department_id` sebagai number dan tidak lagi mengirim input Department berbentuk teks bebas.

### Employee Response

Frontend menormalisasi field berikut:

```json
{
  "department_id": 1,
  "department_code": "IT",
  "department_name": "Information Technology",
  "department_master": {
    "id": 1,
    "code": "IT",
    "name": "Information Technology"
  }
}
```

### Employee Filter

```http
GET /api/v1/employees?department_id=1
```

Employee table menampilkan nama dan kode Department dari relationship backend.

## Application Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login |
| `/dashboard` | All roles | Dashboard berdasarkan role |
| `/attendance` | All roles | Attendance pribadi atau monitoring |
| `/leave` | All roles | Leave request dan history |
| `/approval` | Admin, HR, Manager | Leave approval |
| `/report` | Admin, HR, Manager | Reports dan CSV export |
| `/master-data` | Admin, HR, Manager | Department master data |
| `/employee` | Admin, HR | Employee management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |

## Department API Service

File:

```text
src/services/departmentService.js
```

Endpoints yang digunakan:

```text
GET    /api/v1/departments
POST   /api/v1/departments
GET    /api/v1/departments/{department}
PUT    /api/v1/departments/{department}
DELETE /api/v1/departments/{department}
```

## Project Structure

```text
src/
├── components/layout/
├── lib/axios.js
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── employee/
│   ├── master-data/
│   │   ├── MasterDataPage.jsx
│   │   ├── department.helpers.js
│   │   └── components/
│   │       ├── DepartmentFormModal.jsx
│   │       └── DepartmentTable.jsx
│   ├── attendance/
│   ├── leave/
│   ├── approval/
│   ├── report/
│   ├── shift/
│   └── shift-schedule/
├── routes/
├── services/
│   ├── departmentService.js
│   └── employeeService.js
└── store/
```

## Testing

Department tests mencakup:

- Load dan render Department dari API.
- Admin create flow.
- Normalisasi payload Department.
- Manager read-only access.
- Laravel validation feedback.
- Normalisasi relationship Department pada Employee response.
- Payload Employee menggunakan numeric `department_id`.

Jalankan:

```bash
npm test
npm run lint
npm run build
```

Frontend CI menjalankan:

1. Dependency installation.
2. ESLint untuk source yang berubah.
3. Vitest component tests.
4. Production build.

## Environment

Buat `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Untuk backend melalui ngrok:

```env
VITE_API_BASE_URL=https://your-backend-ngrok-url.ngrok-free.app/api/v1
```

## Local Setup

```bash
npm install
npm run dev
```

Akses default:

```text
http://localhost:3000
```

Untuk mobile testing:

```bash
npm run dev -- --host 0.0.0.0
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hris.test` | `password123` |
| HR | `hr@hris.test` | `password123` |
| Manager | `manager@hris.test` | `password123` |
| Employee | `employee@hris.test` | `password123` |

## Module Development Workflow

Urutan pengembangan wajib untuk setiap modul:

```text
1. Backend migration dan model
2. Backend validation, controller, routes, seeder, dan tests
3. Backend CI hijau dan merge
4. Frontend service dan UI
5. Frontend role access, loading, empty, error, success, dan validation state
6. Integrasi frontend ke API tanpa mock atau hardcoded data
7. Frontend tests dan CI hijau
8. Update README backend dan frontend
9. Merge frontend
10. Baru lanjut ke modul berikutnya
```

## Definition of Done

Sebuah modul HRIS dianggap selesai hanya apabila:

- Backend dan frontend sudah tersedia.
- Contract request dan response sinkron.
- Tidak ada data dropdown yang masih hardcoded.
- Role access sama di backend dan frontend.
- Loading, empty, error, success, dan validation feedback tersedia.
- Responsive pada desktop dan mobile.
- Backend tests lulus.
- Frontend tests lulus.
- Backend dan frontend CI hijau.
- README kedua repository sudah diperbarui.

## Next Module

Module berikutnya setelah Department:

```text
Position Master Data
```

Position baru dimulai setelah Department frontend PR selesai di-merge dan README backend/frontend telah sinkron.
