# Route Matrix — Smart Attendance HRIS Frontend

> Verified against `src/routes/index.jsx` on 20 June 2026.

## Public Route

| Route | Access | Page | Purpose |
|---|---|---|---|
| `/login` | Public | `LoginPage` | User authentication |

## All Authenticated Roles

| Route | Page | Main Services | Purpose |
|---|---|---|---|
| `/dashboard` | `DashboardPage` | Dashboard service | Role-based summary |
| `/attendance` | `AttendancePage` | `attendanceService` | Check-in/out, QR, history, and monitoring |
| `/leave` | `LeavePage` | `leaveService` | Leave request, balance, history, and cancellation |
| `/overtime` | `OvertimePage` | `overtimeService` | Request, review, actual minutes, and policy by role |
| `/profile` | `ProfilePage` | `profileService` | Own profile and emergency contacts |
| `/profile/changes` | `ProfileChangeRequestsPage` | `profileChangeService` | Own profile-change requests |
| `/security` | `AccountSecurityPage` | `authService` | Change password |
| `/documents` | `DocumentsPage` | `documentService` | Own employee documents |
| `/correction` | `CorrectionPage` | `correctionService` | Attendance correction by role |

## Admin, HR, and Manager

| Route | Page | Main Services | Purpose |
|---|---|---|---|
| `/approval` | `ApprovalPage` | `leaveService` | Leave approval and rejection |
| `/report` | `ReportPage` | Report service | Attendance, leave, and employee reports |
| `/master-data` | `MasterDataPage` | Department, position, branch services | Organization master data |

## Admin and HR

| Route | Page | Main Services | Purpose |
|---|---|---|---|
| `/employee` | `EmployeeManagementPage` | `employeeService` | Employee administration |
| `/employee/:employeeId/profile` | `ProfilePage` | `profileService` | Managed employee profile |
| `/employee/:employeeId/documents` | `DocumentsPage` | `documentService` | Managed employee documents |
| `/profile-change-reviews` | `ProfileChangeRequestsPage` | `profileChangeService` | Review sensitive profile changes |
| `/shift` | `ShiftPage` | Shift service | Shift administration |
| `/shift-schedule` | `ShiftSchedulePage` | Shift-schedule service | Shift assignment |
| `/leave-master` | `LeaveMasterPage` | `leaveAdminService` | Leave administration |
| `/payroll` | `PayrollPage` | `payrollService`, `employeeService` | Components, salary profiles, periods, and payroll processing |
| `/audit-log` | `AuditLogPage` | `activityLogService` | Activity log list and detail |

## Payroll Workspace Tabs

| Tab | Main Component | Backend Contract | Purpose |
|---|---|---|---|
| Payroll | `PayrollListTab` | `/admin/payrolls` | Filters, summaries, detail, and lifecycle actions |
| Periode | `PeriodsTab` | `/admin/payroll-periods` | Period CRUD and draft generation |
| Profil Gaji | `ProfilesTab` | `/admin/employees/{employee}/salary-profiles` | Effective salary and component assignments |
| Komponen | `SalaryComponentsTab` | `/admin/salary-components` | Earning/deduction master administration |

## Fallback

| Route | Behavior |
|---|---|
| `*` | Redirect to `/dashboard` |
| `/` | Redirect to `/dashboard` after authentication |

## Route Rules

- Every private page must be nested under `ProtectedRoute`.
- Role guards are UX controls, not the backend security source of truth.
- Navigation visibility must match route access.
- Payroll salary data is visible only to Admin and HR in this foundation.
- Direct URL access must render an authorized page or redirect safely.
- A route addition must update this matrix, sidebar configuration, tests, and backend documentation.
