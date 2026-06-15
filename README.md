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
| Branch / Work Location | ⬜ | ⬜ | Next Module |

## Organization Master Data

Route:

```text
/master-data
```

Tersedia dua tab:

- **Department** — list, search, status filter, create, update, soft-delete action, validation feedback.
- **Position** — list, search, Department filter, status filter, create, update, soft-delete action, validation feedback.

### Role Access

| Action | Admin | HR | Manager | Employee |
|---|:---:|:---:|:---:|:---:|
| View Department & Position | ✅ | ✅ | ✅ | ❌ |
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
```

Alur form:

1. Pilih Department.
2. Dropdown Position hanya menampilkan Position milik Department tersebut.
3. Submit mengirim ID numerik.

```json
{
  "department_id": 1,
  "position_id": 5
}
```

Frontend tidak lagi mengirim Department atau Position sebagai input teks bebas.

Employee list mendukung:

```http
GET /api/v1/employees?department_id=1&position_id=5
```

Table dan detail Employee menampilkan:

- `department_name`
- `department_code`
- `position_name`
- `position_code`
- relationship `department_master`
- relationship `position_master`

## API Services

```text
src/services/departmentService.js
src/services/positionService.js
src/services/employeeService.js
```

Position endpoints:

```text
GET    /api/v1/positions
POST   /api/v1/positions
GET    /api/v1/positions/{position}
PUT    /api/v1/positions/{position}
DELETE /api/v1/positions/{position}
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
| `/master-data` | Admin, HR, Manager | Department & Position master data |
| `/employee` | Admin, HR | Employee management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |

## Testing

Coverage Organization Master Data:

- Department regression flow.
- Department/Position tab switching.
- Position list dan Department relationship.
- Position create dan payload normalization.
- Manager read-only access.
- Laravel validation feedback.
- Employee response normalization untuk Department dan Position.
- Numeric `department_id` dan `position_id` payload.
- Dependent Department → Position selection pada Employee form.

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
- Dropdown tidak hardcoded.
- Role access sama dengan backend.
- Loading, empty, error, success, dan validation feedback tersedia.
- Tests dan CI backend/frontend hijau.
- README kedua repository diperbarui.

## Next Module

```text
Branch / Work Location Master Data
```
