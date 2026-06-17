import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EmployeeManagementPage from './EmployeeManagementPage'

const mocks = vi.hoisted(() => ({
  getEmployees: vi.fn(),
  getManagerOptions: vi.fn(),
  getDepartments: vi.fn(),
  getPositions: vi.fn(),
  getBranches: vi.fn(),
  updateEmployee: vi.fn(),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: { role: 'admin' } }),
}))

vi.mock('../../services/employeeService', () => ({
  default: {
    getAll: mocks.getEmployees,
    getManagerOptions: mocks.getManagerOptions,
    create: vi.fn(),
    update: mocks.updateEmployee,
    delete: vi.fn(),
    enrollFace: vi.fn(),
  },
}))

vi.mock('../../services/departmentService', () => ({
  default: { getAll: mocks.getDepartments },
}))

vi.mock('../../services/positionService', () => ({
  default: { getAll: mocks.getPositions },
}))

vi.mock('../../services/branchService', () => ({
  default: { getAll: mocks.getBranches },
}))

const departments = [{ id: 1, code: 'IT', name: 'Information Technology', is_active: true }]
const positions = [{ id: 10, department_id: 1, code: 'SOFTWARE-ENGINEER', name: 'Software Engineer', is_active: true }]
const branches = [{ id: 1, code: 'HQ-JKT', name: 'Head Office Jakarta', is_active: true }]
const managers = [
  {
    id: 20,
    employee_number: 'IT-0020',
    name: 'Engineering Lead',
    position_name: 'Engineering Manager',
    label: 'Engineering Lead — Engineering Manager (IT-0020)',
  },
  {
    id: 99,
    employee_number: 'IT-0099',
    name: 'Managed Employee',
    position_name: 'Software Engineer',
    label: 'Managed Employee — Software Engineer (IT-0099)',
  },
]

const employeePage = {
  data: [
    {
      id: 99,
      employee_number: 'IT-0099',
      nik: '3171000000000099',
      department_id: 1,
      department_name: 'Information Technology',
      department_code: 'IT',
      position_id: 10,
      position_name: 'Software Engineer',
      position_code: 'SOFTWARE-ENGINEER',
      branch_id: 1,
      branch_name: 'Head Office Jakarta',
      branch_code: 'HQ-JKT',
      branch: branches[0],
      manager_id: 20,
      manager_name: 'Engineering Lead',
      manager_employee_number: 'IT-0020',
      manager_position_name: 'Engineering Manager',
      user: { name: 'Managed Employee', email: 'managed.employee@hris.test', role: 'employee' },
      join_date: '2026-06-17',
      employment_type: 'permanent',
      is_active: true,
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 1,
}

describe('Employee Manager frontend integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getDepartments.mockResolvedValue({ data: { data: departments } })
    mocks.getPositions.mockResolvedValue({ data: { data: positions } })
    mocks.getBranches.mockResolvedValue({ data: { data: branches } })
    mocks.getManagerOptions.mockResolvedValue({ data: { data: managers } })
    mocks.getEmployees.mockResolvedValue({ data: { data: employeePage } })
    mocks.updateEmployee.mockResolvedValue({ data: { data: employeePage.data[0] } })
  })

  it('loads manager options and displays the direct manager in the Employee table', async () => {
    render(<EmployeeManagementPage />)

    expect((await screen.findAllByText('Managed Employee')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Engineering Lead').length).toBeGreaterThan(0)
    expect(screen.getByText('Engineering Manager')).toBeInTheDocument()
    expect(mocks.getManagerOptions).toHaveBeenCalledTimes(1)
  })

  it('sends manager_id and unassigned manager filters to the Employee API', async () => {
    const user = userEvent.setup()
    render(<EmployeeManagementPage />)

    await screen.findAllByText('Managed Employee')
    await screen.findByRole('option', { name: 'Semua Atasan' })
    const managerFilter = screen.getAllByRole('combobox').find((field) => Array.from(field.options).some((option) => option.textContent === 'Semua Atasan'))

    await user.selectOptions(managerFilter, '20')
    await waitFor(() => {
      expect(mocks.getEmployees).toHaveBeenCalledWith(expect.objectContaining({ manager_id: '20' }))
    })

    await user.selectOptions(managerFilter, 'none')
    await waitFor(() => {
      expect(mocks.getEmployees).toHaveBeenCalledWith(expect.objectContaining({ manager_id: 'none' }))
    })
  })

  it('preselects the current manager and removes the Employee from their own manager options', async () => {
    const user = userEvent.setup()
    render(<EmployeeManagementPage />)

    await screen.findAllByText('Managed Employee')
    await user.click(screen.getByTitle('Edit'))

    const managerField = screen.getAllByRole('combobox').find((field) => field.name === 'manager_id')
    expect(managerField).toHaveValue('20')
    expect(screen.getByRole('option', { name: 'Engineering Lead — Engineering Manager (IT-0020)' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Managed Employee — Software Engineer (IT-0099)' })).not.toBeInTheDocument()
  })
})
