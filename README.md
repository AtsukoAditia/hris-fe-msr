# HRIS Frontend — hris-fe-msr

> React + Vite + PWA frontend untuk Smart Attendance HRIS.

Frontend terhubung dengan backend Laravel [`hris-be-msr`](https://github.com/AtsukoAditia/hris-be-msr). Modul dianggap selesai setelah backend, frontend, authorization, tests, CI, dan dokumentasi sinkron.

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| State | Zustand |
| HTTP | Axios |
| Testing | Vitest + React Testing Library + Playwright |
| PWA | vite-plugin-pwa + Workbox |

## Current Status

| Module | Backend | Frontend | Status |
|---|:---:|:---:|:---:|
| Authentication & Role Access | ✅ | ✅ | Synced |
| Dashboard | ✅ | ✅ | Synced |
| Employee Management | ✅ | ✅ | Synced |
| Attendance, Leave, Shift & Report | ✅ | ✅ | Synced |
| **Department Master Data** | ✅ | ✅ | **Completed & Synced** |
| **Position Master Data** | ✅ | ✅ | **Completed & Synced** |
| **Branch / Work Location** | ✅ | ✅ | **Completed & Synced** |
| **Employee Manager Relation** | ✅ | ✅ | **Completed & Synced** |
| **Organization Mobile Acceptance** | ✅ | ✅ | **Completed** |

## Organization Master Data

Route:

```text
/master-data
```

Tersedia tiga tab:

- **Department** — list, search, status filter, create, update, soft-delete action, validation feedback.
- **Position** — list, search, Department filter, status filter, create, update, soft-delete action, validation feedback.
- **Branch / Work Location** — list, search, status filter, location configuration, create, update, guarded delete, validation feedback.

### Branch Location Fields

```text
code
name
address
latitude
longitude
radius_meters
timezone
is_active
employees_count
```

Branch UI menampilkan kode, nama, alamat, timezone, coordinates, radius area absensi, jumlah Employee, dan status. Branch yang masih digunakan Employee akan menampilkan error backend saat delete dan tidak dihapus.

### Role Access

| Action | Admin | HR | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| View Department, Position & Branch | ✅ | ✅ | ✅ | ❌ |
| Search & Filter | ✅ | ✅ | ✅ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ |

Manager mendapatkan UI read-only. Tombol create, edit, dan delete tidak dirender.

## Employee Organization Integration

Employee form menggunakan master data aktif dari backend:

```http
GET /api/v1/departments?active_only=true
GET /api/v1/positions?active_only=true
GET /api/v1/branches?active_only=true
GET /api/v1/employees/manager-options
```

Alur form:

1. Pilih Department.
2. Dropdown Position hanya menampilkan Position milik Department tersebut.
3. Pilih Branch / Work Location aktif.
4. Pilih Atasan Langsung aktif atau gunakan opsi `Tanpa Atasan Langsung`.
5. Submit mengirim ID numerik dan `manager_id` nullable.

```json
{
  "department_id": 1,
  "position_id": 5,
  "branch_id": 1,
  "manager_id": 8
}
```

Frontend tidak mengirim Department, Position, Branch, atau Manager sebagai input teks bebas. Saat edit, Employee aktif tidak ditampilkan sebagai pilihan manager untuk dirinya sendiri. Validasi circular hierarchy tetap ditangani backend dan ditampilkan sebagai validation feedback pada field Manager.

Employee list mendukung:

```http
GET /api/v1/employees?department_id=1&position_id=5&branch_id=1&manager_id=8
GET /api/v1/employees?manager_id=none
```

Table dan detail Employee menampilkan relational Department, Position, Branch, dan Manager termasuk `manager_name`, `manager_employee_number`, dan `manager_position_name`.

## API Services

```text
src/services/departmentService.js
src/services/positionService.js
src/services/branchService.js
src/services/employeeService.js
```

## Application Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login |
| `/dashboard` | All roles | Dashboard |
| `/attendance` | All roles | Attendance |
| `/leave` | All roles | Leave |
| `/approval` | Admin, HR, Manager | Approval |
| `/report` | Admin, HR, Manager | Reports |
| `/master-data` | Admin, HR, Manager | Department, Position & Branch master data |
| `/employee` | Admin, HR | Employee management dan direct manager relation |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |

## Testing

Coverage component dan integration:

- Department, Position, dan Branch CRUD flows.
- Manager read-only access.
- Laravel validation feedback.
- Employee organization response normalization dan numeric ID payloads.
- Dependent Department → Position selection.
- Active Branch dan Manager dropdowns.
- Current Employee exclusion dari pilihan manager.
- Employee Manager table/detail display.
- Filter berdasarkan manager dan tanpa atasan.

Mobile acceptance menggunakan Playwright pada:

| Device Profile | Browser Engine |
|---|---|
| Pixel 5 | Chromium |
| iPhone 13 | WebKit |

Cakupan mobile meliputi navigation drawer, Department/Position/Branch tabs, forms, filters, tables, Employee Manager create/edit/detail flow, modal containment, internal scrolling, dan document-level overflow protection.

Laporan lengkap:

```text
docs/organization-mobile-acceptance.md
```

Jalankan:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Frontend CI menjalankan dependency installation, ESLint, Vitest, dan production build. Workflow Organization Mobile Acceptance menjalankan Playwright pada Chromium dan WebKit serta mengunggah report, screenshots, traces, dan failure video sebagai artifact.

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

Manual testing dari perangkat satu jaringan:

```bash
npm run dev -- --host 0.0.0.0
```

## Definition of Done

- Backend dan frontend tersedia.
- Request/response contract sinkron.
- Dropdown master tidak hardcoded.
- Role access sama dengan backend.
- Loading, empty, error, success, dan validation feedback tersedia.
- Component, integration, mobile E2E, dan CI hijau.
- README kedua repository diperbarui.

## Next Module

```text
Employee Profile and Emergency Contact
```
