# HRIS Frontend — `hris-fe-msr`

React + Vite PWA untuk **Smart Attendance HRIS**, terhubung dengan backend Laravel `hris-be-msr`.

> Status terakhir diverifikasi: 20 Juni 2026  
> Branch utama: `main`

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| State | Zustand |
| HTTP | Axios |
| Testing | Vitest, React Testing Library, Playwright |
| PWA | vite-plugin-pwa + Workbox |
| CI | GitHub Actions |

## Current Project Status

| Module | Backend | Frontend | Status |
|---|:---:|:---:|---|
| Authentication, RBAC, and Dashboard | ✅ | ✅ | Completed |
| Organization and Employee Management | ✅ | ✅ | Completed |
| Profile, Documents, and Self-Service | ✅ | ✅ | Completed |
| Shift, Attendance, and Correction | ✅ | ✅ | Completed |
| Leave and Overtime | ✅ | ✅ | Completed |
| Reports and Activity Log | ✅ | ✅ | Completed |
| Basic Payroll Foundation | ✅ | ✅ | Completed |
| Payslip and Payroll Reporting | ⬜ | ⬜ | Planned Sprint 2 |

## Basic Payroll Foundation

Admin and HR can open `/payroll` to manage the basic payroll workflow.

The workspace contains four tabs:

- **Payroll:** list, filters, page summary, employee detail, component breakdown, recalculation, review, finalization, mark paid, and cancellation.
- **Periode:** payroll period and cutoff CRUD plus draft generation.
- **Profil Gaji:** effective-dated basic salary, currency, notes, and employee component assignments.
- **Komponen:** earning/deduction components with fixed, percentage, and formula-ready calculation types.

Frontend safeguards and states:

- Protected Admin/HR route.
- Role-aware sidebar navigation.
- API calls isolated in `src/services/payrollService.js`.
- Loading, empty, error, validation, confirmation, and conflict feedback.
- Desktop tables and mobile cards.
- Duplicate-submit prevention during lifecycle actions.
- Status actions aligned with `draft`, `reviewed`, `finalized`, `paid`, and `cancelled`.

The foundation does not yet include employee payslips, payroll report export, automatic PPh 21/BPJS calculation, or post-finalization adjustments.

## Main Routes

| Route | Access | Description |
|---|---|---|
| `/login` | Public | Login |
| `/dashboard` | All roles | Role-based dashboard |
| `/profile` | All roles | Self-profile and emergency contacts |
| `/documents` | All roles | Document self-service |
| `/attendance` | All roles | Attendance and history |
| `/correction` | All roles | Attendance correction by role |
| `/leave` | All roles | Leave request and history |
| `/overtime` | All roles | Overtime workspace by role |
| `/approval` | Admin, HR, Manager | Leave approval |
| `/report` | Admin, HR, Manager | Operational reports |
| `/master-data` | Admin, HR, Manager | Organization master data |
| `/employee` | Admin, HR | Employee management |
| `/shift` | Admin, HR | Shift management |
| `/shift-schedule` | Admin, HR | Shift assignment |
| `/leave-master` | Admin, HR | Leave administration |
| `/payroll` | Admin, HR | Payroll Foundation workspace |
| `/audit-log` | Admin, HR | Activity log viewer |

The complete route and role map is available in `docs/ROUTE_MATRIX.md`.

## API Services

Primary service files:

```text
src/services/authService.js
src/services/attendanceService.js
src/services/correctionService.js
src/services/leaveService.js
src/services/leaveAdminService.js
src/services/overtimeService.js
src/services/payrollService.js
src/services/activityLogService.js
src/services/profileService.js
src/services/profileChangeService.js
src/services/documentService.js
src/services/employeeService.js
src/services/departmentService.js
src/services/positionService.js
src/services/branchService.js
```

## Responsive and PWA Requirements

- Mobile-first layouts.
- Responsive tables and cards.
- Loading, error, empty, and validation states.
- Protected routes based on role.
- Backend remains the authorization source of truth.
- Modal and table content must not overflow mobile viewports.
- PWA foundation through service worker and web app manifest.

## Testing and CI

Run locally:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Frontend CI validates:

1. Dependency installation.
2. ESLint on changed source files.
3. Full Vitest component test suite.
4. Vite production build.

Mobile acceptance uses Chromium with a Pixel 5 profile and WebKit with an iPhone 13 profile.

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

## Documentation

```text
docs/PROJECT_STATUS.md
docs/MODULES.md
docs/ROADMAP.md
docs/ROUTE_MATRIX.md
```

## Definition of Done

A module is complete after backend and frontend contracts are synchronized, route guards and UI states are available, tests and build pass, mobile behavior is accepted, and documentation is current.

## Next Focus

**Payslip and Payroll Reporting:** employee payslip ownership, history/detail, authenticated download, period reports, CSV export, and PDF support after the backend contract is stable.
