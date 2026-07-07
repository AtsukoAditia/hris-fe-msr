# Route Matrix — Smart Attendance HRIS Frontend

> Verified against `src/routes/index.jsx` on 8 July 2026.

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
| `/profile/changes` | All roles | `ProfileChangeRequestsPage` | Submitted profile change requests |
| `/security` | All roles | `AccountSecurityPage` | Account security |
| `/documents` | All roles | `DocumentsPage` | Personal documents |
| `/correction` | All roles | `CorrectionPage` | Attendance corrections |
| `/my-schedule` | All roles | `MySchedulePage` | Own weekly shift schedule via `/shift-schedules/my-schedule` |
| `/payslips` | Employee | `PayslipsPage` | Finalized/paid payslip history, detail, and PDF download |

## Reviewer Routes

| Route | Access | Page | Purpose |
|---|---|---|---|
| `/approval` | Admin, HR, Manager | `ApprovalPage` | Leave approval |
| `/report` | Admin, HR, Manager | `ReportPage` | Operational reports |
| `/master-data` | Admin, HR, Manager | `MasterDataPage` | Organization read/manage workspace by role |
| `/shift-schedule` | Admin, HR, Manager | `ShiftSchedulePage` | Admin/HR schedule administration; Manager read-only team schedule |

## Admin and HR

| Route | Page | Purpose |
|---|---|---|
| `/employee` | `EmployeeManagementPage` | Employee administration |
| `/employee/:employeeId/profile` | `ProfilePage` | Admin/HR employee profile view/edit |
| `/employee/:employeeId/documents` | `DocumentsPage` | Admin/HR employee document management |
| `/profile-change-reviews` | `ProfileChangeRequestsPage` | Review profile changes |
| `/shift` | `ShiftPage` | Shift administration |
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

## Shift Schedule Contracts

| UI | Backend Contract |
|---|---|
| My schedule | `GET /shift-schedules/my-schedule` |
| Admin/HR schedule grid | `GET /shift-schedules` |
| Manager team schedule grid | `GET /shift-schedules/team-schedule` |
| Single assign/edit/delete | `POST/PUT/DELETE /shift-schedules` |
| Bulk assign | `POST /shift-schedules/bulk` |
| Copy week | `POST /shift-schedules/copy-week` |
| Rotating shift | `POST /shift-schedules/rotating` |

## Rules

- Private pages are nested under `ProtectedRoute`.
- Navigation visibility matches route guards.
- Backend authorization remains authoritative.
- Employees access only their own finalized or paid payslips.
- Admin and HR manage payroll, payroll reports, and shift assignment.
- Manager can view team shift schedules but cannot access salary data or Admin/HR shift assignment actions.
- Unknown routes redirect to `/dashboard`.
