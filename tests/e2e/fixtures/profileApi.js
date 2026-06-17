const adminUser = {
  id: 1,
  name: 'Profile Admin',
  email: 'profile.admin@hris.test',
  role: 'admin',
  is_active: true,
}

const createProfile = () => ({
  employee: {
    id: 42,
    user_id: 42,
    employee_number: 'IT-0042',
    name: 'Mobile Profile Employee',
    work_email: 'mobile.profile@hris.test',
    phone: '081200000042',
    address: 'Jakarta',
    birth_date: '1998-01-02',
    gender: 'male',
    join_date: '2025-01-01',
    employment_type: 'permanent',
    is_active: true,
    department: { id: 1, code: 'IT', name: 'Information Technology' },
    position: { id: 2, code: 'SOFTWARE-ENGINEER', name: 'Software Engineer' },
    branch: { id: 1, code: 'HQ-JKT', name: 'Head Office Jakarta' },
    manager: null,
  },
  profile: {
    id: 1,
    employee_id: 42,
    personal_email: 'personal.mobile@example.com',
    alternate_phone: null,
    place_of_birth: 'Jakarta',
    marital_status: 'single',
    blood_type: 'O+',
    religion: 'Islam',
    nationality: 'Indonesia',
    identity_address: 'Jakarta',
    domicile_address: 'Jakarta',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '10110',
    tax_number: null,
    social_security_number: null,
    health_insurance_number: null,
  },
  emergency_contacts: [
    {
      id: 7,
      employee_id: 42,
      name: 'Mobile Parent',
      relationship: 'parent',
      phone: '0811111111',
      alternate_phone: null,
      email: null,
      address: 'Jakarta',
      is_primary: true,
      notes: null,
    },
  ],
  completion: {
    percentage: 83,
    completed_fields: ['phone', 'address', 'birth_date', 'gender', 'personal_email'],
    total_fields: 12,
    missing_fields: ['tax_number', 'social_security_number'],
  },
})

const fulfill = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

export const installProfileApiMocks = async (page) => {
  const profile = createProfile()

  await page.addInitScript((user) => {
    window.localStorage.setItem('hris-auth-storage', JSON.stringify({
      state: {
        user,
        token: 'profile-mobile-token',
        isAuthenticated: true,
      },
      version: 0,
    }))
  }, adminUser)

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.split('/api/v1')[1] || '/'
    const method = request.method()

    if (path === '/auth/me') return fulfill(route, { user: adminUser })

    if ((path === '/profile/me' || path === '/employees/42/profile') && method === 'GET') {
      return fulfill(route, { success: true, data: profile })
    }

    if ((path === '/profile/me' || path === '/employees/42/profile') && ['PUT', 'PATCH'].includes(method)) {
      const payload = request.postDataJSON()
      for (const [key, value] of Object.entries(payload)) {
        if (Object.hasOwn(profile.employee, key)) profile.employee[key] = value
        else profile.profile[key] = value
      }
      return fulfill(route, { success: true, data: profile })
    }

    const selfContactMatch = path.match(/^\/profile\/me\/emergency-contacts(?:\/(\d+))?$/)
    const employeeContactMatch = path.match(/^\/employees\/42\/emergency-contacts(?:\/(\d+))?$/)
    const contactMatch = selfContactMatch || employeeContactMatch

    if (contactMatch && method === 'POST') {
      const payload = request.postDataJSON()
      if (payload.is_primary) profile.emergency_contacts.forEach((item) => { item.is_primary = false })
      const contact = { id: 8, employee_id: 42, ...payload, is_primary: payload.is_primary || profile.emergency_contacts.length === 0 }
      profile.emergency_contacts.push(contact)
      return fulfill(route, { success: true, data: contact }, 201)
    }

    if (contactMatch && ['PUT', 'PATCH'].includes(method)) {
      const contactId = Number(contactMatch[1])
      const payload = request.postDataJSON()
      const contact = profile.emergency_contacts.find((item) => item.id === contactId)
      if (payload.is_primary) profile.emergency_contacts.forEach((item) => { item.is_primary = item.id === contactId })
      Object.assign(contact, payload)
      return fulfill(route, { success: true, data: contact })
    }

    if (contactMatch && method === 'DELETE') {
      const contactId = Number(contactMatch[1])
      profile.emergency_contacts = profile.emergency_contacts.filter((item) => item.id !== contactId)
      return fulfill(route, { success: true, data: null })
    }

    return fulfill(route, { success: true, data: [] })
  })
}
