import { mobileAdmin } from './organizationData'

const fulfill = (route, body, status = 200) => route.fulfill({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

const employee = {
  id: 2,
  employee_number: 'EMP-002',
  basic_salary: '10000000.00',
  department_name: 'Information Technology',
  position_name: 'Backend Developer',
  user: { name: 'Budi Santoso', email: 'budi@example.com', role: 'employee' },
}

const period = {
  id: 1,
  name: 'June 2026',
  start_date: '2026-06-01',
  end_date: '2026-06-30',
  cutoff_start_date: '2026-06-01',
  cutoff_end_date: '2026-06-25',
  status: 'open',
  payrolls_count: 1,
}

const components = [
  {
    id: 1,
    code: 'TRANSPORT',
    name: 'Transport Allowance',
    type: 'earning',
    calculation_type: 'fixed',
    default_amount: '500000.00',
    percentage: null,
    formula: null,
    description: null,
    is_active: true,
  },
]

const payroll = {
  id: 7,
  payroll_period_id: 1,
  employee_id: 2,
  employee_salary_profile_id: 4,
  status: 'draft',
  currency: 'IDR',
  basic_salary: '10000000.00',
  total_earnings: '10500000.00',
  total_deductions: '454545.45',
  net_salary: '10045454.55',
  attendance_days: 20,
  absent_days: 1,
  late_minutes: 15,
  unpaid_leave_days: 0,
  overtime_minutes: 60,
  generated_at: '2026-06-20T08:00:00Z',
  employee: {
    id: employee.id,
    employee_number: employee.employee_number,
    name: employee.user.name,
    email: employee.user.email,
    department_name: employee.department_name,
    position_name: employee.position_name,
  },
  period,
  items: [
    { id: 1, code: 'BASIC', name: 'Basic Salary', type: 'earning', source: 'basic_salary', amount: '10000000.00' },
    { id: 2, code: 'TRANSPORT', name: 'Transport Allowance', type: 'earning', source: 'salary_component', amount: '500000.00' },
    { id: 3, code: 'ABSENCE', name: 'Absence Deduction', type: 'deduction', source: 'attendance', amount: '454545.45' },
  ],
}

const salaryProfile = {
  id: 4,
  employee_id: employee.id,
  basic_salary: '10000000.00',
  currency: 'IDR',
  effective_from: '2026-06-01',
  effective_to: null,
  is_active: true,
  notes: 'Current salary profile',
  components: [
    {
      id: 10,
      salary_component_id: 1,
      amount: '500000.00',
      percentage: null,
      formula: null,
      salary_component: components[0],
    },
  ],
}

const paginator = (rows) => ({
  data: rows,
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: rows.length,
  },
})

export const installPayrollApiMocks = async (page) => {
  await page.addInitScript((user) => {
    window.localStorage.setItem('hris-auth-storage', JSON.stringify({
      state: {
        user,
        token: 'payroll-mobile-token',
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

    if (path === '/auth/me' && method === 'GET') return fulfill(route, { user: mobileAdmin })
    if (path === '/employees' && method === 'GET') return fulfill(route, { data: { data: [employee], current_page: 1, last_page: 1, per_page: 100, total: 1 } })
    if (path === '/admin/payroll-periods' && method === 'GET') return fulfill(route, paginator([period]))
    if (path === '/admin/payrolls' && method === 'GET') return fulfill(route, paginator([payroll]))
    if (path === '/admin/payrolls/7' && method === 'GET') return fulfill(route, { data: payroll })
    if (path === '/admin/salary-components' && method === 'GET') return fulfill(route, paginator(components))
    if (path === '/admin/employees/2/salary-profiles' && method === 'GET') return fulfill(route, { data: [salaryProfile] })

    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return fulfill(route, { data: request.postDataJSON?.() || {} })
    }

    return fulfill(route, { data: [] })
  })
}
