# Project Status — Smart Attendance HRIS Frontend

> Last verified: 20 June 2026  
> Repository: `AtsukoAditia/hris-fe-msr`  
> Main branch: `main`

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ | Completed and integrated |
| 🟡 | Available but still needs enhancement |
| 🔵 | Current development focus |
| ⬜ | Planned |

## Module Status

| Module | Frontend | Backend Contract | Status |
|---|:---:|:---:|---|
| Authentication, protected routes, and role menus | ✅ | ✅ | Completed |
| Role-based dashboard | ✅ | ✅ | Completed |
| Department, position, and branch master data | ✅ | ✅ | Completed |
| Employee management and direct manager | ✅ | ✅ | Completed |
| Employee profile and emergency contacts | ✅ | ✅ | Completed |
| Employee document management | ✅ | ✅ | Completed |
| Employee self-service and profile change review | ✅ | ✅ | Completed |
| Shift management and basic schedule assignment | ✅ | ✅ | Completed |
| Attendance with camera, GPS, radius, and QR | ✅ | ✅ | Completed |
| Attendance correction and manual correction | ✅ | ✅ | Completed |
| Activity log viewer | ✅ | ✅ | Completed |
| Leave request, approval, balance, and history | ✅ | ✅ | Completed |
| Leave master administration | ✅ | ✅ | Completed |
| Attendance, leave, and employee reports with CSV | ✅ | ✅ | Completed |
| Overtime policy and request workflow | ✅ | ✅ | Completed |
| Payroll workspace | ⬜ | ⬜ | Next milestone |

## Current Routes

The application currently exposes:

- `/login`
- `/dashboard`
- `/attendance`
- `/leave`
- `/overtime`
- `/profile`
- `/profile/changes`
- `/security`
- `/documents`
- `/correction`
- `/approval`
- `/report`
- `/master-data`
- `/employee`
- `/employee/:employeeId/profile`
- `/employee/:employeeId/documents`
- `/profile-change-reviews`
- `/shift`
- `/shift-schedule`
- `/leave-master`
- `/audit-log`

Role access details are maintained in `docs/ROUTE_MATRIX.md` and `src/routes/index.jsx`.

## Completed Frontend Capabilities

### Platform

- React Router protected routes.
- Zustand authentication state.
- Axios instance and authenticated API calls.
- Loading, error, empty, pagination, filter, and modal states across core modules.
- PWA foundation with service worker and manifest.

### Employee and organization

- Department, position, and branch master-data workspace.
- Employee list, filter, create, edit, detail, manager relation, and face enrollment.
- Self-profile and managed employee profile.
- Emergency contacts.
- Sensitive profile change request and Admin/HR review.
- Private employee document listing, upload, metadata, replacement, and authenticated download.

### Time management

- Attendance check-in/check-out with camera and browser geolocation.
- QR scan and attendance radius feedback.
- Attendance history and monitoring.
- Attendance correction request, review, attachment, and manual correction.
- Shift CRUD and basic shift assignment.

### Leave and overtime

- Leave request, balance, history, cancellation, approval, and rejection.
- Leave type, policy, holiday, and balance administration.
- Overtime request, filters, cancellation, approval/rejection, actual-minute recording, and policy administration.

### Reporting and audit

- Attendance, leave, and employee report tabs.
- Filter, summary, table, pagination, and CSV download behavior.
- Activity log list, filters, and detail presentation.

## Testing and CI

Expected local verification:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

CI should cover:

1. Dependency installation.
2. ESLint.
3. Vitest component tests.
4. Production build.
5. Playwright mobile acceptance where configured.

## Current Focus

### Basic Payroll Foundation

Planned frontend scope:

- Salary component administration.
- Employee salary profile.
- Payroll-period workspace.
- Generate and recalculate draft payroll.
- Payroll detail with earning and deduction items.
- Review, finalize, paid, and cancel actions according to role.
- Employee payslip history.
- Payroll filters, reports, and export.
- Responsive table/card modes and mobile acceptance.

## Known Gaps

- No payroll route or UI has been implemented.
- Shift scheduling lacks a complete weekly/monthly calendar experience.
- Export is focused on CSV; Excel and PDF remain planned.
- Notification center and generic approval workflow remain planned.
- Final production deployment and broad end-to-end coverage remain incomplete.

## Source of Truth

- Routes and guards: `src/routes/index.jsx`
- API services: `src/services/`
- Current repository summary: `README.md`
- Module inventory: `docs/MODULES.md`
- Implementation sequence: `docs/ROADMAP.md`
- Route integration map: `docs/ROUTE_MATRIX.md`
