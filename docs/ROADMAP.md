# Roadmap — Smart Attendance HRIS Frontend

> Updated: 20 June 2026. Keep synchronized with the backend roadmap.

## Core HRIS UI ✅

- [x] Authentication, RBAC, dashboard, and PWA foundation
- [x] Organization and employee management
- [x] Employee profile, documents, and self-service
- [x] Shift and basic scheduling
- [x] Attendance, correction, leave, overtime, and activity log
- [x] Core reports and CSV export

## Sprint 1 — Basic Payroll Foundation ✅

- [x] Salary components
- [x] Effective employee salary profiles
- [x] Payroll periods and cutoff dates
- [x] Generate and recalculate draft payroll
- [x] Review, finalize, paid, and cancel actions
- [x] Responsive Admin/HR workspace
- [x] Component tests, lint, build, and mobile acceptance

## Sprint 2 — Payslip and Payroll Reporting ✅

- [x] Employee payslip history and detail
- [x] Authenticated PDF payslip download
- [x] Payroll report filters and server summaries
- [x] CSV and PDF report export
- [x] Admin/HR protected payslip download
- [x] Loading, error, empty, desktop, and mobile states
- [x] Regression tests, lint, build, and mobile acceptance
- [x] Documentation synchronization

## Sprint 3 — Shift Schedule Calendar 🔵

- [ ] Weekly and monthly views
- [ ] Employee, department, and branch filters
- [ ] Bulk assignment and copy previous week
- [ ] Rotating shifts, day off, and conflict feedback
- [ ] Manager team and employee personal schedules

## Sprint 4 — Notification Center

- [ ] Inbox, unread badge, read actions, deep links, and preferences

## Sprint 5 — Generic Approval Workspace

- [ ] Unified inbox, filters, timeline, multi-level approval, and delegation

## Sprint 6 — Attendance and Leave Enhancements

- [ ] Attendance anomaly, missing checkout, half-day leave, hourly permission, and team calendar

## Sprint 7 — Reporting Enhancement

- [ ] Excel and specialized operational reports
- [ ] Consistent filters and background-export progress

## Sprint 8 — System Settings

- [ ] Company, timezone, workdays, attendance, leave, overtime, payroll, upload, and notification settings

## Sprint 9 — Optional Expansion

- [ ] Organization chart, recruitment, onboarding, performance, reimbursement, assets, announcements, training, and loans

## Sprint 10 — Production Hardening

- [ ] Production environment, monitoring, PWA/offline review, accessibility, critical E2E, and final manuals

## Definition of Done

A module is complete when its backend contract is stable, role guards and service integration are correct, all UI states are handled, desktop/mobile behavior is accepted, tests and build pass, and documentation is synchronized.
