# Employee Profile Frontend

Status: Implemented.

Routes:

```text
/profile
/employee/:employeeId/profile
```

Features:

- Self profile for all authenticated Employee users.
- Admin and HR Employee profile management.
- Personal, address, administrative identity, and profile completion data.
- Emergency contact create, edit, delete, and primary-contact state.
- Responsive contact dialog and overflow protection.

Tests:

```text
src/pages/profile/profile.helpers.test.js
src/pages/profile/ProfilePage.test.jsx
tests/e2e/profile-mobile.spec.js
```

Mobile profiles:

- Pixel 5 with Chromium.
- iPhone 13 with WebKit.

Frontend CI also uploads the component test log as an artifact for diagnostics.
