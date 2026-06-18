const fulfill = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

const user = {
  id: 10,
  name: 'Mobile HR',
  email: 'mobile.hr@hris.test',
  role: 'hr',
  employee: { id: 10, employee_number: 'EMP-0010' },
}

const request = {
  id: 7,
  employee_id: 10,
  status: 'pending',
  reason: 'Dokumen identitas terbaru sudah terbit.',
  review_note: null,
  can_cancel: true,
  can_review: false,
  created_at: '2026-06-18T08:00:00Z',
  employee: { id: 10, employee_number: 'EMP-0010', name: 'Mobile HR', work_email: 'mobile.hr@hris.test' },
  changes: [{ field: 'nationality', current_value: 'Indonesia', requested_value: 'Malaysia' }],
}

export const installEmployeeSelfServiceApiMocks = async (page) => {
  await page.addInitScript((authUser) => {
    window.localStorage.setItem('hris-auth-storage', JSON.stringify({
      state: { user: authUser, token: 'employee-self-service-token', isAuthenticated: true },
      version: 0,
    }))
  }, user)

  await page.route('**/api/v1/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const path = url.pathname.split('/api/v1')[1] || '/'
    const method = req.method()

    if (path === '/auth/me' && method === 'GET') return fulfill(route, { user })
    if (path === '/auth/change-password' && method === 'POST') return fulfill(route, { success: true })
    if (path === '/profile/change-requests' && method === 'GET') return fulfill(route, { success: true, data: { data: [request], total: 1 } })
    if (path === '/profile/change-requests' && method === 'POST') return fulfill(route, { success: true, data: request }, 201)
    if (path === '/profile-change-requests' && method === 'GET') return fulfill(route, { success: true, data: { data: [{ ...request, can_cancel: false, can_review: true }], total: 1 } })
    if (path.includes('/profile-change-requests/') && method === 'POST') return fulfill(route, { success: true, data: { ...request, status: path.endsWith('/approve') ? 'approved' : 'rejected' } })
    if (path.includes('/profile/change-requests/') && method === 'DELETE') return fulfill(route, { success: true, data: { ...request, status: 'cancelled', can_cancel: false } })

    return fulfill(route, { success: true, data: [] })
  })
}
