# Module Inventory — Smart Attendance HRIS Frontend

> Last updated: 20 June 2026

## Completed Modules

| Module | Main Route | Status |
|---|---|---|
| Authentication and RBAC | `/login` | Completed |
| Dashboard | `/dashboard` | Completed |
| Organization Master Data | `/master-data` | Completed |
| Employee Management | `/employee` | Completed |
| Profile, Contacts, Documents, and Change Review | Profile routes | Completed |
| Shift and Basic Schedule | `/shift`, `/shift-schedule` | Completed / Enhancement |
| Attendance and Correction | `/attendance`, `/correction` | Completed |
| Leave and Leave Administration | `/leave`, `/approval`, `/leave-master` | Completed |
| Overtime | `/overtime` | Completed |
| Reports and Activity Log | `/report`, `/audit-log` | Completed |

## Payroll Foundation

| Module | Main UI Capabilities | Route | Status |
|---|---|---|---|
| Salary Components | Filter, create, edit, delete, earning/deduction calculation types | `/payroll` → Komponen | Completed |
| Employee Salary Profile | Effective salary and component assignments | `/payroll` → Profil Gaji | Completed |
| Payroll Period | Period and cutoff CRUD plus draft generation | `/payroll` → Periode | Completed |
| Payroll Processing | Summary, filters, detail, recalculate, review, finalize, paid, cancel | `/payroll` → Payroll | Completed |
| Payslip | Employee-owned history and breakdown | Planned | Planned |
| Payroll Report | Period summary and CSV/PDF export | Planned | Planned |

Payroll Foundation is restricted to Admin and HR. Payslip ownership and reporting are deferred to Sprint 2.

## Planned Enhancements

- Payslip and payroll reporting.
- Weekly and monthly shift calendar.
- Notification center.
- Generic approval inbox.
- Attendance and leave enhancements.
- Excel and PDF exports.
- System settings.
- Production hardening and broader end-to-end coverage.

## Optional Modules

Organization chart, recruitment, onboarding/offboarding, performance, reimbursement, assets, announcements, training, and employee loans remain deferred until core payroll and production readiness are stable.
