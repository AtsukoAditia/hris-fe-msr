# Route Matrix — Smart Attendance HRIS Frontend

> Verified against `src/routes/index.jsx` on 20 June 2026.

## Public

| Route | Access | Page |
|---|---|---|
| `/login` | Public | `LoginPage` |

## Authenticated Self-Service

| Route | Access | Page | Purpose |
|---|---|---|---|
| `/dashboard` | All roles | `DashboardPage` | Role summary |
| `/attendance` | All roles | `AttendancePage` | Attendance |
| `/leave` | All roles | `LeavePage` | Leave requests |
| `/overtime` | All roles | `OvertimePage` | Overtime workflow |
| `/profile` | All roles | `ProfilePage` | Profile |
| `/documents` | All roles | `DocumentsPage` | Personal documents |
| `/correction` | All roles | `CorrectionPage` | Attendance corrections |
| `/payslips` | Employee | `PayslipsPage` | Finalized/paid payslip history, detail, and PDF download |

## Reviewer Routes

| Route | Access | Page |
|---|---|---|
| `/approval` | Admin, HR, Manager | `ApprovalPage` |
| `/report` | Admin, HR, Manager | `ReportPage` |
| `/master-data` | Admin, HR, Manager | `MasterDataPage` |

## Admin and HR

| Route | Page | Purpose |
|---|---|---|
| `/employee` | `EmployeeManagementPage` | Employee administration |
| `/profile-change-reviews` | `ProfileChangeRequestsPage` | Review profile changes |
| `/shift` | `ShiftPage` | Shift administration |
| `/shift-schedule` | `ShiftSchedulePage` | Schedule administration |
| `/leave-master` | `LeaveMasterPage` | Leave administration |
| `/payroll` | `PayrollPage` | Payroll processing and reporting |
| `/audit-log` | `AuditLogPage` | Activity log |

## Payroll Workspace Tabs

| Tab | Component | Backend Contract |
|---|---|---|
| Payroll | `PayrollListTab` | `/admin/payrolls` |
| Laporan | `ReportsTab` | `/admin/payroll-reports/*` |
| Periode | `PeriodsTab` | `/admin/payroll-periods` |
| Profil Gaji | `ProfilesTab` | `/admin/employees/{employee}/salary-profiles` |
| Komponen | `SalaryComponentsTab` | `/admin/salary-components` |

## Rules

- Private pages are nested under `ProtectedRoute`.
- Navigation visibility matches route guards.
- Backend authorization remains authoritative.
- Employees access only their own finalized or paid payslips.
- Admin and HR manage payroll and payroll reports.
- Manager cannot access salary data.
- Unknown routes redirect to `/dashboard`.
