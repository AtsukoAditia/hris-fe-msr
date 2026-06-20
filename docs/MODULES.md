# Module Inventory — Smart Attendance HRIS Frontend

> Last updated: 20 June 2026

## Core Platform

| Module | Main UI Capabilities | Main Route | Status |
|---|---|---|---|
| Authentication | Login, logout, session hydration, protected routes | `/login` | Completed |
| Dashboard | Role-based summary and recent activities | `/dashboard` | Completed |
| Account Security | Change password | `/security` | Completed |
| Activity Log | Filtered log list and detail viewer | `/audit-log` | Completed |

## Organization and Employee

| Module | Main UI Capabilities | Main Route | Status |
|---|---|---|---|
| Master Data | Department, position, and branch CRUD workspace | `/master-data` | Completed |
| Employee Management | List, filter, create, edit, detail, manager relation, face enrollment | `/employee` | Completed |
| Employee Profile | Self-profile and Admin/HR-managed profile | `/profile`, `/employee/:employeeId/profile` | Completed |
| Emergency Contacts | Add, edit, delete contact records | Profile routes | Completed |
| Employee Documents | Self-service list/download and Admin/HR document management | `/documents`, `/employee/:employeeId/documents` | Completed |
| Profile Change Request | Submit, history, detail, cancel | `/profile/changes` | Completed |
| Profile Change Review | Compare old/new values, approve, reject | `/profile-change-reviews` | Completed |

## Time and Attendance

| Module | Main UI Capabilities | Main Route | Status |
|---|---|---|---|
| Shift | Shift list, filters, create, edit, deactivate/delete | `/shift` | Completed |
| Shift Schedule | Basic assignment, listing, and deletion | `/shift-schedule` | Enhancement |
| Attendance | Camera, GPS, check-in/out, QR scan, personal history, monitoring by role | `/attendance` | Completed |
| Attendance Correction | Employee request/history and reviewer/manual correction workspace | `/correction` | Completed |

## Leave and Overtime

| Module | Main UI Capabilities | Main Route | Status |
|---|---|---|---|
| Leave | Request, balance, history, cancellation | `/leave` | Completed |
| Leave Approval | Reviewer list, filters, approve, reject | `/approval` | Completed |
| Leave Master | Leave types, policies, holidays, and balances | `/leave-master` | Completed |
| Overtime | Employee requests, reviewer workflow, actual minutes, policy management | `/overtime` | Completed |

## Reporting

| Module | Main UI Capabilities | Main Route | Status |
|---|---|---|---|
| Attendance Report | Filters, summary cards, table, pagination, CSV | `/report` | Completed |
| Leave Report | Filters, status summaries, table, CSV | `/report` | Completed |
| Employee Report | Organization and employee filters, table, CSV | `/report` | Completed |
| Excel/PDF | Downloadable spreadsheet and printable reports | `/report` | Planned |

## Payroll

| Module | Main UI Capabilities | Planned Route | Status |
|---|---|---|---|
| Salary Components | Earning/deduction component CRUD | `/payroll/components` or payroll tabs | Next |
| Employee Salary Profile | Employee salary composition | `/payroll/salaries` or employee payroll tab | Next |
| Payroll Period | Period and cutoff administration | `/payroll` | Next |
| Payroll Processing | Generate, recalculate, review, finalize, paid, cancel | `/payroll` | Next |
| Payslip | Employee payroll breakdown and history | `/payslips` or payroll employee tab | Planned |
| Payroll Report | Period filters, summary, detail, export | `/payroll/reports` or payroll report tab | Planned |

Final route shape should be decided together with the backend API contract before implementation.

## Planned Enhancements

- Weekly and monthly shift calendar.
- Notification center and unread badge.
- Generic approval inbox.
- Attendance anomaly presentation.
- Half-day and hourly leave UX.
- Excel and PDF export.
- Company/system settings.
- Stronger end-to-end regression coverage.

## Optional Modules

- Organization chart
- Recruitment
- Onboarding and offboarding
- Performance management
- Reimbursement
- Asset management
- Announcement and company calendar
- Training and development
- Employee loan

Optional modules should be started only after payroll and production hardening are stable.
