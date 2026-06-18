# Employee Self-Service Frontend

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/profile` | All roles | Direct profile updates |
| `/profile/changes` | All roles | Submit and manage change requests |
| `/security` | All roles | Account security update |
| `/profile-change-reviews` | Admin, HR | Review Employee requests |

## Field Policy

Direct update:

```text
phone
address
personal_email
alternate_phone
domicile_address
city
province
postal_code
```

Approval required:

```text
birth_date
gender
place_of_birth
marital_status
blood_type
religion
nationality
identity_address
tax_number
social_security_number
health_insurance_number
```

Sensitive fields remain visible but locked on self-profile. Admin and HR Employee profile management remains editable.

## Employee Flow

Employee can submit changed fields with a reason, view history, filter status, open detail, and cancel a pending request when the backend returns `can_cancel=true`.

## Admin and HR Flow

Admin and HR can search, filter, compare current and requested values, approve with an optional note, and reject with a required note. The UI respects `can_review` from the backend.

## Account Security

After a successful account security update, the local authentication state is cleared and the user is redirected to `/login`.

## Tests

Component tests cover request submission, cancellation, review listing, rejection validation, and action contracts. Playwright mobile acceptance runs on Pixel 5 Chromium and iPhone 13 WebKit.
