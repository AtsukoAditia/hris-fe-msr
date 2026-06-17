const user = {
  id: 1,
  name: 'Document Admin',
  email: 'document.admin@hris.test',
  role: 'admin',
  is_active: true,
}

const item = {
  id: 7,
  employee_id: 42,
  category: 'employment',
  category_label: 'Kepegawaian',
  title: 'Mobile Employment Contract',
  description: 'Permanent employment contract.',
  labels: ['contract', 'permanent'],
  file: { original_name: 'mobile-contract.pdf', mime_type: 'application/pdf', extension: 'pdf', size_bytes: 2048, version: 1 },
  issue_date: '2026-01-01',
  expiry_date: '2026-07-01',
  expiry_status: 'expiring',
  days_until_expiry: 14,
  is_confidential: true,
}

const json = (route, data, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(data),
})

export const installDocumentApiMocks = async (page) => {
  await page.addInitScript((authUser) => {
    localStorage.setItem('hris-auth-storage', JSON.stringify({
      state: { user: authUser, token: 'document-mobile-token', isAuthenticated: true },
      version: 0,
    }))
  }, user)

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname.split('/api/v1')[1] || '/'
    const method = request.method()

    if (path === '/auth/me') return json(route, { user })
    if (path === '/document-categories') return json(route, { success: true, data: [
      { value: 'identity', label: 'Identitas' },
      { value: 'employment', label: 'Kepegawaian' },
    ] })
    if (path === '/employees/42/profile') return json(route, { success: true, data: { employee: {
      id: 42,
      name: 'Mobile Document Employee',
      employee_number: 'EMP-0042',
    } } })

    if ((path === '/documents/my' || path === '/employees/42/documents') && method === 'GET') {
      return json(route, { success: true, data: {
        data: [item], current_page: 1, last_page: 1, per_page: 15, total: 1,
      } })
    }

    if ((path === '/documents/my/summary' || path === '/employee-documents/summary') && method === 'GET') {
      return json(route, { success: true, data: {
        total: 1, valid: 0, expiring: 1, expired: 0, without_expiry: 0, warning_days: 30,
      } })
    }

    if (/\/download$/.test(path) && method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: { 'Content-Disposition': 'attachment; filename="mobile-contract.pdf"' },
        body: 'mobile document bytes',
      })
    }

    if (path === '/employees/42/documents' && method === 'POST') {
      return json(route, { success: true, data: { ...item, id: 8 } }, 201)
    }

    if (/\/employees\/42\/documents\/\d+$/.test(path) && ['PATCH', 'DELETE'].includes(method)) {
      return json(route, { success: true, data: method === 'DELETE' ? null : item })
    }

    if (/\/replace$/.test(path) && method === 'POST') {
      return json(route, { success: true, data: { ...item, file: { ...item.file, version: 2 } } })
    }

    return json(route, { success: true, data: [] })
  })
}
