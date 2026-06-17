import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import EmployeeManagementPage from './EmployeeManagementPage'

const mocks = vi.hoisted(() => ({
  getEmployees: vi.fn(),
  getDepartments: vi.fn(),
  getPositions: vi.fn(),
  getBranches: vi.fn(),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: { role: 'admin' } }),
}))

vi.mock('../../services/employeeService', () => ({
  default: {
    getAll: mocks.getEmployees,
    create: vi.fn(),
    update: vi.fn(),
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
      user: { name: 'Branch Employee', email: 'branch.employee@hris.test', role: 'employee' },
      is_active: true,
    },
  ],
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 1,
}

describe('Employee Branch integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getDepartments.mockResolvedValue({ data: { data: departments } })
    mocks.getPositions.mockResolvedValue({ data: { data: positions } })
    mocks.getBranches.mockResolvedValue({ data: { data: branches } })
    mocks.getEmployees.mockResolvedValue({ data: { data: employeePage } })
  })

  it('loads active Branch options and displays Employee Branch', async () => {
    render(<EmployeeManagementPage />)

    expect(await screen.findByText('Branch Employee')).toBeInTheDocument()
    expect(screen.getAllByText('Head Office Jakarta').length).toBeGreaterThan(0)
    expect(mocks.getBranches).toHaveBeenCalledWith({ active_only: true })
  })

  it('sends branch_id when filtering Employee data', async () => {
    const user = userEvent.setup()
    render(<EmployeeManagementPage />)

    await screen.findByText('Branch Employee')
    const branchFilter = screen.getAllByRole('combobox').find((field) => field.value === '' && Array.from(field.options).some((option) => option.textContent === 'Semua Cabang'))
    await user.selectOptions(branchFilter, '1')

    await waitFor(() => {
      expect(mocks.getEmployees).toHaveBeenCalledWith(expect.objectContaining({ branch_id: '1' }))
    })
  })
})
