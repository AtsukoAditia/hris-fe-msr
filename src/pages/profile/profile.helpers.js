export const initialProfileForm = {
  phone: '',
  address: '',
  birth_date: '',
  gender: '',
  personal_email: '',
  alternate_phone: '',
  place_of_birth: '',
  marital_status: '',
  blood_type: '',
  religion: '',
  nationality: '',
  identity_address: '',
  domicile_address: '',
  city: '',
  province: '',
  postal_code: '',
  tax_number: '',
  social_security_number: '',
  health_insurance_number: '',
}

export const initialContactForm = {
  name: '',
  relationship: '',
  phone: '',
  alternate_phone: '',
  email: '',
  address: '',
  is_primary: false,
  notes: '',
}

const responsePayload = (response) => response?.data?.data ?? response?.data ?? response ?? {}

export const normalizeProfileResponse = (response) => {
  const payload = responsePayload(response)

  return {
    employee: payload.employee && typeof payload.employee === 'object' ? payload.employee : {},
    profile: payload.profile && typeof payload.profile === 'object' ? payload.profile : {},
    emergency_contacts: Array.isArray(payload.emergency_contacts) ? payload.emergency_contacts : [],
    completion: payload.completion && typeof payload.completion === 'object'
      ? payload.completion
      : { percentage: 0, completed_fields: [], total_fields: 12, missing_fields: [] },
  }
}

export const toProfileForm = (profileData) => {
  const employee = profileData?.employee || {}
  const profile = profileData?.profile || {}

  return Object.keys(initialProfileForm).reduce((form, field) => ({
    ...form,
    [field]: String(employee[field] ?? profile[field] ?? ''),
  }), { ...initialProfileForm })
}

export const toContactForm = (contact) => ({
  ...initialContactForm,
  ...(contact || {}),
  name: String(contact?.name ?? ''),
  relationship: String(contact?.relationship ?? ''),
  phone: String(contact?.phone ?? ''),
  alternate_phone: String(contact?.alternate_phone ?? ''),
  email: String(contact?.email ?? ''),
  address: String(contact?.address ?? ''),
  is_primary: Boolean(contact?.is_primary),
  notes: String(contact?.notes ?? ''),
})

const nullableValue = (value) => {
  if (typeof value !== 'string') return value ?? null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export const mapProfileFormToPayload = (form) => Object.fromEntries(
  Object.entries(form).map(([field, value]) => [field, nullableValue(value)]),
)

export const mapContactFormToPayload = (form) => ({
  name: String(form.name || '').trim(),
  relationship: String(form.relationship || '').trim(),
  phone: String(form.phone || '').trim(),
  alternate_phone: nullableValue(form.alternate_phone),
  email: nullableValue(form.email),
  address: nullableValue(form.address),
  is_primary: Boolean(form.is_primary),
  notes: nullableValue(form.notes),
})

export const normalizeContactsResponse = (response) => {
  const payload = responsePayload(response)
  return Array.isArray(payload) ? payload : []
}
