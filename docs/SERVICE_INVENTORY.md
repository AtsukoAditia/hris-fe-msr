# Frontend Service Inventory

Last updated: 2026-07-08

## API Services (`src/services/`)

| Service | File | Backend Endpoints | Notes |
|---|---|---|---|
| Auth | `authService.js` | `/api/v1/auth/*` | Login, logout, current user |
| Profile | `profileService.js` | `/api/v1/profile/*`, `/api/v1/employees/{employee}/profile` | Employee self-service and Admin/HR profile view/edit |
| Profile Change | `profileChangeService.js` | `/api/v1/profile-change-requests/*` | Profile change requests and Admin/HR review |
| Attendance | `attendanceService.js` | `/api/v1/attendance/*` | Clock in/out, today, history, QR |
| Correction | `correctionService.js` | `/api/v1/attendance-corrections/*` | Correction requests and review |
| Leave | `leaveService.js` | `/api/v1/leaves/*`, `/api/v1/leave-types/*` | Employee leave requests |
| Leave Admin | `leaveAdminService.js` | `/api/v1/admin/leave-*` | Admin leave master data |
| Overtime | `overtimeService.js` | `/api/v1/overtime-requests/*`, `/api/v1/overtime-policies/*` | Overtime requests and policy lookup |
| Payroll | `payrollService.js` | `/api/v1/admin/salary-*`, `/api/v1/admin/payroll-*`, `/api/v1/payslips/*` | Payroll foundation, reports, payslips, downloads |
| Employee | `employeeService.js` | `/api/v1/employees/*` | Employee CRUD, manager options, face enrollment |
| Shift | `shiftService.js` | `/api/v1/shifts/*` | Shift management |
| Shift Schedule | `shiftScheduleService.js` | `/api/v1/shift-schedules/*` | CRUD, bulk, copy-week, rotating, team schedule, my schedule |
| Branch | `branchService.js` | `/api/v1/branches/*` | Branch master data |
| Department | `departmentService.js` | `/api/v1/departments/*` | Department master data |
| Position | `positionService.js` | `/api/v1/positions/*` | Position master data |
| Document | `documentService.js` | `/api/v1/documents/*`, `/api/v1/employee-documents/*` | Employee documents and admin document management |
| Dashboard | `dashboardService.js` | `/api/v1/dashboard/*` | Dashboard aggregation |
| Report | `reportService.js` | `/api/v1/reports/*` | Attendance, leave, employee reports with CSV export |
| Activity Log | `activityLogService.js` | `/api/v1/activity-logs/*` | Audit log |
| Approval | `approvalService.js` | `/api/v1/leaves/*/approve`, `/api/v1/leaves/*/reject` | Approval workflow shortcuts |

## Shift Schedule Contract Details

| Method | Service Function | Endpoint |
|---|---|---|
| GET | `shiftScheduleService.list` | `/shift-schedules` |
| POST | `shiftScheduleService.store` | `/shift-schedules` |
| PUT | `shiftScheduleService.update` | `/shift-schedules/{id}` |
| DELETE | `shiftScheduleService.destroy` | `/shift-schedules/{id}` |
| POST | `shiftScheduleService.bulkAssign` | `/shift-schedules/bulk` |
| POST | `shiftScheduleService.copyWeek` | `/shift-schedules/copy-week` |
| POST | `shiftScheduleService.assignRotating` | `/shift-schedules/rotating` |
| GET | `shiftScheduleService.getMySchedule` | `/shift-schedules/my-schedule` |
| GET | `shiftScheduleService.getTeamSchedule` | `/shift-schedules/team-schedule` |

## Utility

| File | Purpose |
|---|---|
| `queryParams.js` | Query string builder for paginated/filterable endpoints |

## Stores (`src/store/`)

| Store | Purpose |
|---|---|
| `authStore.js` | Auth state, user, token |
| `attendanceStore.js` | Attendance clock state |
| `notificationStore.js` | Toast/notification queue |

## Routes (`src/routes/`)

| File | Purpose |
|---|---|
| `index.jsx` | Route definitions with role guards |
| `ProtectedRoute.jsx` | Auth + role-based route wrapper |
