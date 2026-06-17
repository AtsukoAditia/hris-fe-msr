import { branches, departments, employees, mobileAdmin, positions } from './organizationData'

const fulfill = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

const filterByStatus = (rows, url) => {
  const status = url.searchParams.get('status')
  const activeOnly = url.searchParams.get('active_only') === 'true'

  return rows.filter((item) => {
    if (activeOnly && !item.is_active) return false
    if (status === 'active' && !item.is_active) return false
    if (status === 'inactive' && item.is_active) return false
    return true
  })
}

export const installOrganizationApiMocks = async (page) => {
  await page.addInitScript((user) => {
    window.localStorage.setItem('hris-auth-storage', JSON.stringify({
      state: {
        user,
        token: 'mobile-acceptance-token',
        isAuthenticated: true,
      },
      version: 0,
    }))
  }, mobileAdmin)

  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.split('/api/v1')[1] || '/'
    const method = request.method()

    if (path === '/auth/me' && method === 'GET') {
      return fulfill(route, { user: mobileAdmin })
    }

    if (path === '/departments' && method === 'GET') {
      return fulfill(route, { success: true, data: filterByStatus(departments, url) })
    }

    if (path === '/positions' && method === 'GET') {
      const departmentId = url.searchParams.get('department_id')
      let rows = filterByStatus(positions, url)
      if (departmentId) rows = rows.filter((item) => String(item.department_id) === departmentId)
      return fulfill(route, { success: true, data: rows })
    }

    if (path === '/branches' && method === 'GET') {
      return fulfill(route, { success: true, data: filterByStatus(branches, url) })
    }

    if (path === '/employees/manager-options' && method === 'GET') {
      const options = employees.map((item) => ({
        id: item.id,
        employee_number: item.employee_number,
        name: item.user.name,
        email: item.user.email,
        role: item.user.role,
        department_id: item.department_id,
        department_code: item.department_code,
        department_name: item.department_name,
        position_id: item.position_id,
        position_code: item.position_code,
        position_name: item.position_name,
        branch_id: item.branch_id,
        branch_code: item.branch_code,
        branch_name: item.branch_name,
        label: `${item.user.name} — ${item.position_name} (${item.employee_number})`,
      }))
      return fulfill(route, { success: true, data: options })
    }

    if (path === '/employees' && method === 'GET') {
      const managerId = url.searchParams.get('manager_id')
      let rows = employees
      if (managerId === 'none') rows = rows.filter((item) => item.manager_id == null)
      else if (managerId) rows = rows.filter((item) => String(item.manager_id) === managerId)

      return fulfill(route, {
        success: true,
        data: {
          data: rows,
          current_page: 1,
          last_page: 1,
          per_page: 10,
          total: rows.length,
        },
      })
    }

    if (path === '/employees' && method === 'POST') {
      const payload = request.postDataJSON()
      return fulfill(route, {
        success: true,
        data: {
          id: 120,
          employee_number: 'IT-0120',
          formatted_employee_number: 'IT-0120',
          ...payload,
          manager_name: 'Engineering Lead',
          manager_employee_number: 'IT-0020',
          manager_position_name: 'Engineering Manager',
          user: { name: payload.name, email: payload.email, role: payload.role },
        },
      }, 201)
    }

    if (method === 'POST') {
      return fulfill(route, { success: true, data: request.postDataJSON() }, 201)
    }

    return fulfill(route, { success: true, data: [] })
  })
}
