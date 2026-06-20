# Frontend Architecture — Smart Attendance HRIS

## Overview

`hris-fe-msr` is a React + Vite PWA that consumes the Laravel REST API in `hris-be-msr`.

## Application Flow

```text
User interaction
  -> Page/component
  -> Form validation
  -> Service in src/services
  -> Axios instance
  -> Laravel /api/v1
  -> Normalized UI state
  -> Feedback, table/card, modal, or redirect
```

## Main Layers

| Layer | Responsibility |
|---|---|
| Routes | Route registration and role-based page access |
| Layout | Navigation, responsive shell, and authenticated workspace |
| Pages | Module orchestration and screen-level state |
| Components | Reusable visual and interaction units |
| Services | API contract, request payload, response handling, and file download |
| Store | Authentication and shared client state |
| Hooks | Reusable browser or domain interaction where appropriate |
| Validation | Client-side form validation and field-level feedback |
| Tests | Component, integration, and end-to-end behavior |
| PWA | Manifest, service worker, installability, and safe caching |

## Directory Direction

```text
src/
  components/
  pages/
  routes/
  services/
  store/
  hooks/
  utils/
```

Pages should not duplicate raw Axios configuration. API interaction belongs in `src/services`.

## Authentication and Route Protection

- Authentication state is hydrated before protected content is trusted.
- `ProtectedRoute` prevents unauthorized page access.
- Role-based navigation should match route access.
- Backend authorization remains authoritative.
- A `403` or scoped `404` response must be handled clearly rather than hidden as a generic network error.

## API Service Rules

Each domain should expose a focused service, for example:

```text
authService
employeeService
attendanceService
correctionService
leaveService
leaveAdminService
overtimeService
profileService
profileChangeService
documentService
activityLogService
```

Service responsibilities:

- Build endpoint URLs.
- Normalize query parameters.
- Submit expected payload keys.
- Handle blob downloads.
- Return data in a predictable shape.

Pages remain responsible for user-facing loading, error, empty, and success state.

## UI State Requirements

Every data-driven page should account for:

```text
initial
loading
success with data
success with empty data
validation error
forbidden
not found
conflict
server/network failure
```

Actions that mutate critical data need confirmation and must prevent duplicate submission.

## Responsive Strategy

- Use mobile-first layouts.
- Wide tables should switch to cards or controlled horizontal scrolling on small screens.
- Dialogs must fit within the viewport and preserve access to action buttons.
- Filters should collapse without losing active filter visibility.
- Forms should keep labels, validation messages, and input targets readable on mobile.
- Camera, QR, and geolocation screens require real-device or browser-emulation acceptance.

## PWA and Caching

- Do not cache authenticated API responses as durable public data.
- Service worker updates must not leave incompatible stale assets active indefinitely.
- Offline behavior should provide a clear fallback; attendance submission must not claim success without server confirmation.
- Installability should be tested on supported Android and iOS browser paths.

## Sensitive Data

The frontend must not:

- Persist passwords, tokens, salary data, or private documents in logs.
- Expose private document URLs as public links.
- Treat hidden fields or routes as authorization.
- Calculate authoritative payroll totals independently from the backend.

## Payroll UI Direction

Recommended workspace:

```text
Payroll Overview
Salary Components
Employee Salary Profiles
Payroll Periods
Payroll Detail
Payslips
Reports
```

The backend provides authoritative calculations. The frontend presents inputs, calculation breakdown, warnings, status transitions, and audit context.

## Error Boundary

High-value routes should fail predictably and preserve navigation. Unexpected rendering errors should display a recoverable fallback instead of a blank application.
