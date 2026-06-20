# Frontend Development Guide

## Local Setup

```bash
git clone https://github.com/AtsukoAditia/hris-fe-msr.git
cd hris-fe-msr
npm install
cp .env.example .env
npm run dev
```

Default environment:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Development Workflow

1. Read the active milestone in `docs/ROADMAP.md`.
2. Confirm the backend endpoint and authorization contract.
3. Add or update a domain service in `src/services`.
4. Build reusable components before overloading a page component.
5. Add route and navigation access where required.
6. Implement validation and all UI states.
7. Test desktop and mobile layouts.
8. Add component and critical-flow tests.
9. Run lint, tests, and production build.
10. Update documentation in both repositories.

## Component Rules

- Pages orchestrate data; reusable UI belongs in components.
- Avoid large pages containing unrelated tabs, forms, tables, and modal logic without extraction.
- Keep form defaults and payload transformation explicit.
- Avoid duplicating status labels and role checks across modules; centralize reusable mappings.
- Disable repeated submission while a request is pending.
- Show confirmation before sensitive actions such as approval, rejection, deletion, finalization, or payroll payment.

## API Service Rules

- Use the shared Axios instance.
- Keep endpoint paths in service modules rather than JSX.
- Normalize query parameters and remove empty values where appropriate.
- Preserve backend validation messages.
- Use blob handling for authenticated downloads.
- Never hard-code database IDs for policy or master-data options.
- Keep response-shape assumptions covered by tests.

## Route and Role Checklist

For every new page:

- Is authentication required?
- Which roles should see the route?
- Does sidebar/navigation visibility match?
- What happens on direct URL access?
- How are `401`, `403`, and scoped `404` responses displayed?
- Does the backend enforce the same or stricter rule?

## Required UI States

Every async screen must support:

- Loading.
- Empty data.
- Successful data.
- Validation errors.
- Forbidden access.
- Not found.
- Conflict or invalid status transition.
- Network/server error.
- Success feedback after mutation.

## Forms

- Use React Hook Form and Zod where consistent with the existing module.
- Display field-level validation near the related input.
- Map backend validation errors to fields when possible.
- Preserve entered values after recoverable errors.
- Use correct input types for date, time, number, currency, email, and file.
- Confirm destructive or irreversible operations.

## Responsive Acceptance

Minimum checks:

- No page-level horizontal overflow.
- Tables remain usable through cards or controlled scrolling.
- Filters and actions remain reachable on small screens.
- Modals fit inside the viewport.
- Buttons have adequate touch targets.
- Camera, QR, file upload, and geolocation flows are tested in mobile emulation or a real device.

## Testing

Run locally:

```bash
npm test
npm run lint
npm run build
npm run test:e2e
```

Minimum component-test coverage:

- Loading and empty state.
- Successful data rendering.
- Validation failure.
- API failure.
- Role-based action visibility.
- Form submission payload.
- Sensitive action confirmation.

Critical Playwright paths should include login, attendance, leave, correction, overtime, and payroll after implementation.

## PWA Rules

- Do not report offline attendance as successful without server confirmation.
- Avoid durable caching of authenticated or sensitive API responses.
- Verify service-worker updates and stale asset behavior.
- Test installability and standalone display.

## Documentation Checklist

When completing a module, update:

- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/MODULES.md`
- `docs/ROADMAP.md`
- `docs/ROUTE_MATRIX.md`
- Related backend documentation

## Definition of Done

A frontend module is complete when:

- Backend contract and authorization are stable.
- Route, navigation, and role guard are correct.
- API calls are isolated in services.
- Form validation and backend errors are clear.
- Loading, error, empty, success, and conflict states exist.
- Desktop and mobile behavior are accepted.
- Tests, lint, and production build pass.
- Critical flow acceptance passes.
- Documentation is synchronized.
