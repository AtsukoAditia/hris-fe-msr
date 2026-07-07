# Roadmap — Smart Attendance HRIS Frontend

> Last updated: 8 July 2026  
> Repository: `AtsukoAditia/hris-fe-msr`  
> Keep synchronized with backend roadmap in `AtsukoAditia/hris-be-msr`.

## Completed Phases

| Phase | Status | Frontend Scope |
|---|---|---|
| Phase 0 — Core HRIS | ✅ Complete | Auth, dashboard, organization, employee, profile, documents, attendance, correction, leave, overtime, reports, audit log |
| Sprint 1 — Payroll Foundation | ✅ Complete | Payroll workspace with payroll, report, period, salary profile, and component tabs |
| Sprint 2 — Payslip and Payroll Reporting | ✅ Complete | Employee payslip page and Admin/HR report tab |
| Sprint 3 — Shift Schedule | ✅ Complete | My schedule, Admin/HR grid, Manager team view, bulk, copy-week, rotating shift |

## Next Sprint Roadmap

| Sprint | Priority | Status | Frontend Goal |
|---|---:|---|---|
| Sprint 4 — Stabilization and Contract QA | P0 | 🔵 Next | Full smoke testing, route checks, E2E coverage, stale-doc cleanup |
| Sprint 5 — Payroll Pro UX | P0 | Planned | Adjustment UI, approval timeline, simulation preview, locked-period states |
| Sprint 6 — Advanced Shift Scheduling UX | P1 | Planned | Conflict warnings, coverage heatmap, publish state, version history, shift swap request and approval |
| Sprint 7 — Attendance Intelligence UI | P1 | Planned | Risk dashboard, anomaly list, monthly health summary, manager insights |
| Sprint 8 — Leave and Overtime Policy UX | P1 | Planned | Accrual view, carry-forward, blackout warnings, team capacity warning, overtime comparison |
| Sprint 9 — Notification Center | P2 | Planned | Inbox, unread badge, read actions, preferences, deep links |
| Sprint 10 — Employee Lifecycle UI | P2 | Planned | Onboarding, probation, contract reminders, movement history, offboarding, asset handover, timeline |
| Sprint 11 — Performance and HR Analytics UI | P3 | Planned | KPI/OKR, review forms, feedback, rating history, executive dashboards |
| Sprint 12 — Production Hardening | P0 ongoing | Planned | Accessibility, PWA/offline review, critical E2E, monitoring-ready UX, final manuals |

## Sprint 4 Acceptance Criteria

- `npm run lint`, `npm test`, `npm run build`, and critical E2E flows pass.
- Login, attendance, leave, overtime, payroll, payslip, and shift schedule smoke flows are covered.
- Manager `/shift-schedule` read-only team view is tested.
- Admin/HR shift schedule grid does not overwrite multi-employee schedules.
- Route matrix, service inventory, module inventory, and project status are synchronized.

## Top 3 Product Priorities

1. Payroll Pro UX.
2. Advanced Shift Scheduling UX.
3. Attendance Intelligence and HR Analytics.

## Global Definition of Done

A frontend module is complete only when backend contract is stable, role guards and navigation are correct, service integration is correct, all UI states are handled, desktop/mobile behavior is accepted, tests and build pass, docs are synchronized, and CLINE guidance remains accurate.
