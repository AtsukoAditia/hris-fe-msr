# Frontend Service Inventory

Last updated: 2026-06-30

## API Services (`src/services/`)

| Service        | File                      | Backend Endpoints                  | Notes                                        |
| -------------- | ------------------------- | ---------------------------------- | -------------------------------------------- |
| Auth           | `authService.js`          | `/api/v1/auth/*`                   | Login, logout, current user                  |
| Profile        | `profileService.js`       | `/api/v1/profile/*`                | Employee self-service profile                |
| Profile Change | `profileChangeService.js` | `/api/v1/profile-changes/*`        | Profile change requests & review             |
| Attendance     | `attendanceService.js`    | `/api/v1/attendance/*`             | Clock in/out, history                        |
| Correction     | `correctionService.js`    | `/api/v1/attendance-corrections/*` | Correction requests                          |
| Leave          | `leaveService.js`         | `/api/v1/leaves/*`                 | Employee leave requests                      |
| Leave Admin    | `leaveAdminService.js`    | `/api/v1/admin/leaves/*`           | Admin leave management                       |
| Overtime       | `overtimeService.js`      | `/api/v1/overtime/*`               | Overtime requests                            |
| Payroll        | `payrollService.js`       | `/api/v1/admin/payroll/*`          | Payroll periods & payslips                   |
| Employee       | `employeeService.js`      | `/api/v1/employees/*`              | Employee CRUD (admin)                        |
| Shift          | `shiftService.js`         | `/api/v1/shifts/*`                 | Shift management                             |
| Shift Schedule | `shiftScheduleService.js` | `/api/v1/shift-schedules/*`        | Shift schedule assignments                   |
| Branch         | `branchService.js`        | `/api/v1/branches/*`               | Branch master data                           |
| Department     | `departmentService.js`    | `/api/v1/departments/*`            | Department master data                       |
| Position       | `positionService.js`      | `/api/v1/positions/*`              | Position master data                         |
| Document       | `documentService.js`      | `/api/v1/documents/*`              | Employee documents                           |
| Dashboard      | `dashboardService.js`     | `/api/v1/dashboard/*`              | Dashboard aggregation                        |
| Report         | `reportService.js`        | `/api/v1/reports/*`                | Attendance, leave, employee reports with CSV |
| Activity Log   | `activityLogService.js`   | `/api/v1/activity-logs/*`          | Audit log                                    |
| Approval       | `approvalService.js`      | `/api/v1/approvals/*`              | Unified approval flow                        |
| Shift Schedule | `shiftScheduleService.js` | `/api/v1/shift-schedules/*`        | CRUD, bulk, copy-week, calendar, my-schedule |

## Utility

| File             | Purpose                                                 |
| ---------------- | ------------------------------------------------------- |
| `queryParams.js` | Query string builder for paginated/filterable endpoints |

## Stores (`src/store/`)

| Store                  | Purpose                  |
| ---------------------- | ------------------------ |
| `authStore.js`         | Auth state, user, token  |
| `attendanceStore.js`   | Attendance clock state   |
| `notificationStore.js` | Toast/notification queue |

## Routes (`src/routes/`)

| File                 | Purpose                            |
| -------------------- | ---------------------------------- |
| `index.jsx`          | Route definitions with role guards |
| `ProtectedRoute.jsx` | Auth + role-based route wrapper    |
