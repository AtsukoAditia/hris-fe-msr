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
3. **Create a new branch** for every update — branch name must describe the change (e.g., `feat/shift-calendar-ui`, `fix/leave-form-validation`).
4. Add or update a domain service in `src/services`.
5. Build reusable components before overloading a page component.
6. Add route and navigation access where required.
7. Implement validation and all UI states.
8. Test desktop and mobile layouts.
9. Add component, critical-flow, and E2E tests.
10. Run lint, tests, E2E, and production build.
11. **Merge branch to `main`** only after all tests pass.
12. Update documentation in both repositories.

### Branch Rules

- **Never commit directly to `main`.**
- Create one branch per feature/fix in **both** `hris-be-msr` and `hris-fe-msr`.
- Use consistent naming: `feat/<module>`, `fix/<module>`, `docs/<module>`, `refactor/<module>`.
- Merge to `main` only after lint, unit tests, E2E tests, and production build pass.
- Branch per repo, commit per repo — do not mix backend and frontend in one commit.
- **Never `git add .`** — always `git add` per-file.

### Merge to Main (exact sequence)

```text
1. Buat branch baru:     git checkout -b feat/module-name
2. Edit & test file.
3. git add <file>        # per file, jangan per folder.
4. git commit -m "feat(module): description"
5. Ulangi step 2-4 sampai semua file ter-commit.
6. git checkout main
7. git pull origin main
8. git merge feat/module-name --no-ff -m "Merge branch 'feat/module-name' into main"
9. git push origin main
10. git checkout feat/module-name   # kembali ke branch aktif
```

**Peraturan:**
- Branch per repo, commit per repo.
- Jangan pernah `git add .` atau `git add -A`.
- Satu commit = satu file atau satu unit logis.
- Selalu pull main sebelum merge agar up-to-date.

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
# Unit tests
npm test
npm run lint

# Production build
npm run build

# E2E tests (Playwright)
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

### E2E Testing with Playwright

Every sprint that touches UI must include Playwright E2E tests for:

- **Critical happy-path flows** — login, create, submit, approve.
- **Role-based access** — Admin vs Employee sees correct UI and sidebar.
- **Form validation** — required fields, error messages, backend validation display.
- **Navigation & routing** — direct URL access, role-guarded routes, 403/404 pages.
- **Mobile responsive flows** — test in mobile viewport for attendance, camera, QR.

Run E2E tests before merging to `main`:

```bash
npx playwright install        # install browsers (once)
npm run test:e2e              # run all E2E tests
npx playwright show-report    # view HTML report
```

E2E tests run against real browsers (Chromium, Firefox, WebKit). If environment blocks E2E (e.g., no display, no camera), document the limitation explicitly.

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

## Database Changes (Backend Coordination)

**SETIAP** fitur baru yang butuh kolom/tabel baru, frontend harus koordinasi dengan backend untuk memastikan:

1. **Migration**: Backend buat migration
2. **Seeder**: Backend update seeder dengan data dummy
3. **Factory**: Backend update factory untuk testing
4. **API Contract**: Update `docs/API_MATRIX.md` dengan endpoint baru
5. **Test Data**: Pastikan data dummy tersedia untuk testing frontend

### Frontend Checklist:
- [ ] Confirm backend has migration + seeder
- [ ] API contract updated in docs
- [ ] Test data available (ask backend team)
- [ ] Frontend service layer updated
- [ ] Frontend tests use seeded data

### Important:
**JANGAN LUPA SEED!** Data dummy penting untuk development dan testing frontend. Kalau backend lupa seed, minta mereka update seeder.

**Example Flow:**
1. Backend: buat migration + model + seeder + factory
2. Backend: run `php artisan migrate:fresh --seed`
3. Backend: update API docs
4. Frontend: consume API dengan data dummy yang sudah di-seed
5. Frontend: test dengan data dummy

**JANGAN LUPA SEED!** (Important enough to repeat)
