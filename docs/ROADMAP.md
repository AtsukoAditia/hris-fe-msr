# Roadmap — Smart Attendance HRIS Frontend

> Updated: 20 June 2026. Keep this document synchronized with the backend roadmap.

## Phase 0 — Core HRIS UI ✅

- [x] Authentication, protected routes, and role navigation
- [x] Dashboard
- [x] Organization master data
- [x] Employee management, profile, contacts, and documents
- [x] Employee self-service and profile change review
- [x] Shift and basic scheduling
- [x] Attendance with camera, GPS, radius, and QR
- [x] Attendance correction
- [x] Leave request, approval, balance, and master data
- [x] Activity log viewer
- [x] Reports and CSV export
- [x] Overtime workflow
- [x] Responsive and PWA foundation

## Sprint 1 — Basic Payroll Foundation 🔵

- [ ] Decide payroll route and navigation structure
- [ ] Salary component list, filter, create, and edit
- [ ] Earning/deduction and calculation-type forms
- [ ] Employee salary profile and effective date
- [ ] Payroll period list and create/open action
- [ ] Generate and recalculate draft payroll
- [ ] Payroll summary and employee detail
- [ ] Review, finalize, paid, and cancel actions
- [ ] Validation, loading, error, empty, and conflict states
- [ ] Desktop table and mobile card layouts
- [ ] Component tests, build, and mobile acceptance

## Sprint 2 — Payslip and Payroll Reporting

- [ ] Employee payslip history and detail
- [ ] Authenticated download
- [ ] Payroll report filters and summaries
- [ ] CSV export
- [ ] PDF payslip after backend support is stable
- [ ] Regression tests

## Sprint 3 — Shift Schedule Calendar

- [ ] Weekly and monthly views
- [ ] Employee, department, and branch filters
- [ ] Bulk assignment and copy previous week
- [ ] Rotating shifts and day off
- [ ] Conflict feedback
- [ ] Manager team and employee personal schedules

## Sprint 4 — Notification Center

- [ ] Inbox and unread badge
- [ ] Mark read and mark all read
- [ ] Deep links and preferences
- [ ] Leave, correction, profile, overtime, schedule, document, and checkout triggers

## Sprint 5 — Generic Approval Workspace

- [ ] Unified approval inbox
- [ ] Request-type filters
- [ ] Approval timeline
- [ ] Multi-level and delegation states
- [ ] Old/new value comparison
- [ ] Backward-compatible migration from existing screens

## Sprint 6 — Attendance and Leave Enhancements

- [ ] Attendance anomaly and missing-checkout states
- [ ] Early leave, work from home, and business trip
- [ ] Half-day leave and hourly permission
- [ ] Carry-forward display and team leave calendar

## Sprint 7 — Reporting Enhancement

- [ ] Excel and PDF downloads
- [ ] Anomaly, late, overtime, expiry, and turnover reports
- [ ] Consistent filters
- [ ] Background-export progress

## Sprint 8 — System Settings

- [ ] Company profile
- [ ] Timezone, workdays, and date format
- [ ] Attendance, leave, overtime, and payroll defaults
- [ ] Upload limit, QR expiration, and notification preferences

## Sprint 9 — Optional Expansion

- [ ] Organization chart
- [ ] Recruitment
- [ ] Onboarding and offboarding
- [ ] Performance
- [ ] Reimbursement and assets
- [ ] Announcements, training, and employee loans

## Sprint 10 — Production Hardening

- [ ] Production environment and error monitoring
- [ ] PWA install and offline review
- [ ] Accessibility and bundle review
- [ ] Critical end-to-end tests
- [ ] User/admin manual, limitations, and changelog

## Definition of Done

A frontend module is complete when the backend contract is stable, role guards are correct, API access is isolated in services, all UI states are handled, desktop/mobile behavior is accepted, tests and build pass, critical flows pass acceptance, and documentation is synchronized.
