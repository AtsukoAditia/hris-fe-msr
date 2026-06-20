# Project Status — Smart Attendance HRIS Frontend

> Last verified: 20 June 2026  
> Repository: `AtsukoAditia/hris-fe-msr`  
> Main branch: `main`

## Module Status

| Module | Frontend | Backend Contract | Status |
|---|:---:|:---:|---|
| Authentication, protected routes, and role menus | ✅ | ✅ | Completed |
| Role-based dashboard | ✅ | ✅ | Completed |
| Department, position, and branch master data | ✅ | ✅ | Completed |
| Employee management and direct manager | ✅ | ✅ | Completed |
| Employee profile, documents, and self-service | ✅ | ✅ | Completed |
| Shift and basic schedule assignment | ✅ | ✅ | Completed |
| Attendance, GPS/photo/radius/QR, and correction | ✅ | ✅ | Completed |
| Leave request, approval, balance, and administration | ✅ | ✅ | Completed |
| Overtime policy and request workflow | ✅ | ✅ | Completed |
| Reports, CSV export, and activity log | ✅ | ✅ | Completed |
| Basic Payroll Foundation | ✅ | ✅ | Completed |
| Payslip and Payroll Reporting | ⬜ | ⬜ | Planned Sprint 2 |

## Basic Payroll Foundation

The Admin/HR payroll workspace is available at `/payroll` with four responsive tabs:

- **Payroll:** list, filters, summary, item detail, recalculation, review, finalization, mark paid, and cancellation.
- **Periode:** payroll-period CRUD and draft generation for active employees.
- **Profil Gaji:** effective-dated basic salary and employee component assignments.
- **Komponen:** earning/deduction master with fixed, percentage, and formula-ready configuration.

The workspace includes:

- Admin/HR route protection and sidebar visibility.
- API access isolated in `src/services/payrollService.js`.
- Loading, error, empty, validation, confirmation, and conflict states.
- Desktop tables and mobile cards.
- Currency and date formatting.
- Lifecycle actions aligned with backend statuses: `draft`, `reviewed`, `finalized`, `paid`, and `cancelled`.
- Component and helper tests for form mapping, navigation, generation, and review actions.

## Payroll Limitations

The foundation intentionally excludes:

- Employee payslip access.
- Payroll CSV/PDF reporting.
- Automatic PPh 21 and BPJS calculation.
- Post-finalization adjustment workflow.
- Multi-level payroll approval.

These remain part of Payroll Sprint 2 or later settings work.

## Current Routes

Primary routes include:

- `/login`
- `/dashboard`
- `/attendance`
- `/correction`
- `/leave`
- `/overtime`
- `/profile`
- `/documents`
- `/approval`
- `/report`
- `/master-data`
- `/employee`
- `/shift`
- `/shift-schedule`
- `/leave-master`
- `/payroll`
- `/audit-log`

Role details are maintained in `docs/ROUTE_MATRIX.md` and `src/routes/index.jsx`.

## Testing and CI

Frontend verification commands:

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

The payroll milestone is validated by:

1. ESLint on changed JavaScript and JSX files.
2. Full Vitest component test suite.
3. Vite production build.
4. Existing Pixel 5 and iPhone 13 acceptance workflow.

## Current Focus

### Sprint 2 — Payslip and Payroll Reporting

Planned next scope:

- Employee-owned payslip history.
- Authenticated payslip detail/download.
- Payroll report filters and summaries.
- CSV export.
- PDF payslip after backend support is stable.
- Regression and mobile acceptance tests.

## Source of Truth

- Routes and guards: `src/routes/index.jsx`
- Payroll page: `src/pages/payroll/PayrollPage.jsx`
- Payroll API service: `src/services/payrollService.js`
- Module inventory: `docs/MODULES.md`
- Roadmap: `docs/ROADMAP.md`
- Route matrix: `docs/ROUTE_MATRIX.md`
