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
| `/attendance` | `AttendancePage` | `attendanceService` | Check-in/out, QR, history, and role-based monitoring |
| `/leave` | `LeavePage` | `leaveService` | Leave request, balance, history, and cancellation |
| `/overtime` | `OvertimePage` | `overtimeService` | Employee request plus reviewer/policy workspace based on role |
| `/profile` | `ProfilePage` | `profileService` | Own profile and emergency contacts |
| `/profile/changes` | `ProfileChangeRequestsPage` | `profileChangeService` | Own profile-change requests |
| `/security` | `AccountSecurityPage` | `authService` | Change password |
| `/documents` | `DocumentsPage` | `documentService` | Own employee documents |
| `/correction` | `CorrectionPage` | `correctionService` | Attendance correction request or review based on role |

## Admin, HR, and Manager

| Route | Page | Main Services | Purpose |
|---|---|---|---|
| `/approval` | `ApprovalPage` | `leaveService` | Leave approval and rejection |
| `/report` | `ReportPage` | Report service | Attendance, leave, and employee reports |
| `/master-data` | `MasterDataPage` | `departmentService`, `positionService`, `branchService` | Organization master data; write actions depend on backend authorization |

## Admin and HR

| Route | Page | Main Services | Purpose |
|---|---|---|---|
| `/employee` | `EmployeeManagementPage` | `employeeService` | Employee administration |
| `/employee/:employeeId/profile` | `ProfilePage` | `profileService` | Managed employee profile |
| `/employee/:employeeId/documents` | `DocumentsPage` | `documentService` | Managed employee documents |
| `/profile-change-reviews` | `ProfileChangeRequestsPage` | `profileChangeService` | Review sensitive profile changes |
| `/shift` | `ShiftPage` | Shift service | Shift administration |
| `/shift-schedule` | `ShiftSchedulePage` | Shift-schedule service | Shift assignment |
| `/leave-master` | `LeaveMasterPage` | `leaveAdminService` | Leave types, policies, holidays, and balances |
| `/audit-log` | `AuditLogPage` | `activityLogService` | Activity log list and detail |

## Fallback

| Route | Behavior |
|---|---|
| `*` | Redirect to `/dashboard` |
| `/` | Redirect to `/dashboard` after authentication |

## Planned Payroll Routes

The final shape must follow the backend contract. Recommended options:

```text
/payroll
/payroll/components
/payroll/salaries
/payroll/reports
/payslips
```

A tabbed `/payroll` workspace may be used instead of multiple routes if it keeps role access and mobile navigation clear.

## Route Rules

- Every private page must be nested under `ProtectedRoute`.
- Role guards are UX controls, not the security source of truth.
- Navigation visibility must match route access.
- Direct URL access must render an authorized page or redirect safely.
- A route addition must update this matrix, sidebar/navigation configuration, tests, and backend documentation.
