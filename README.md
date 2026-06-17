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
| Testing | Vitest + React Testing Library |
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
| Employee Manager Relation | ⬜ | ⬜ | Next Module |

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

Branch UI menampilkan:

- Kode dan nama lokasi.
- Alamat dan timezone.
- Latitude dan longitude.
- Radius area absensi.
- Jumlah Employee yang menggunakan Branch.
- Status aktif/nonaktif.

Branch yang masih digunakan Employee akan menampilkan error backend saat delete dan tidak dihapus.

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
```

Alur form:

1. Pilih Department.
2. Dropdown Position hanya menampilkan Position milik Department tersebut.
3. Pilih Branch / Work Location aktif.
4. Submit mengirim ID numerik.

```json
{
  "department_id": 1,
  "position_id": 5,
  "branch_id": 1
}
```

Frontend tidak mengirim Department, Position, atau Branch sebagai input teks bebas.

Employee list mendukung:

```http
GET /api/v1/employees?department_id=1&position_id=5&branch_id=1
```

Table dan detail Employee menampilkan:

- `department_name`
- `department_code`
- `position_name`
- `position_code`
- `branch_name`
- `branch_code`
- relationship `department_master`
- relationship `position_master`
- relationship `branch`
- Branch address, radius, dan timezone pada detail Employee

## API Services

```text
src/services/departmentService.js
src/services/positionService.js
src/services/branchService.js
src/services/employeeService.js
```

Branch endpoints:

```text
GET    /api/v1/branches
POST   /api/v1/branches
GET    /api/v1/branches/{branch}
PUT    /api/v1/branches/{branch}
DELETE /api/v1/branches/{branch}
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
| `/employee` | Admin, HR | Employee management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |

## Testing

Coverage Organization Master Data:

- Department regression flow.
- Department, Position, dan Branch tab switching.
- Position list dan Department relationship.
- Branch list, location data, create, normalization, read-only, validation, dan guarded delete feedback.
- Manager read-only access.
- Laravel validation feedback.
- Employee response normalization untuk Department, Position, dan Branch.
- Numeric `department_id`, `position_id`, dan `branch_id` payload.
- Dependent Department → Position selection.
- Active Branch dropdown dan Branch-required Employee submit.
- Employee Branch list display dan `branch_id` filter API integration.

Jalankan:

```bash
npm test
npm run lint
npm run build
```

Frontend CI menjalankan dependency installation, ESLint, Vitest, dan production build.

## Environment

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Local Setup

```bash
npm install
npm run dev
```

Mobile testing:

```bash
npm run dev -- --host 0.0.0.0
```

## Definition of Done

- Backend dan frontend tersedia.
- Request/response contract sinkron.
- Dropdown master tidak hardcoded.
- Role access sama dengan backend.
- Loading, empty, error, success, dan validation feedback tersedia.
- Tests dan CI backend/frontend hijau.
- README kedua repository diperbarui.

## Next Module

```text
Employee Direct Manager Relation
```
