import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MasterDataPage from './MasterDataPage'

const mocks = vi.hoisted(() => ({
  user: { role: 'admin' },
  getDepartments: vi.fn(),
  createDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  getPositions: vi.fn(),
  createPosition: vi.fn(),
  updatePosition: vi.fn(),
  deletePosition: vi.fn(),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: mocks.user }),
}))

vi.mock('../../services/departmentService', () => ({
  default: {
    getAll: mocks.getDepartments,
    create: mocks.createDepartment,
    update: mocks.updateDepartment,
    delete: mocks.deleteDepartment,
  },
}))

vi.mock('../../services/positionService', () => ({
  default: {
    getAll: mocks.getPositions,
    create: mocks.createPosition,
    update: mocks.updatePosition,
    delete: mocks.deletePosition,
  },
}))

const departments = [
  {
    id: 1,
    code: 'IT',
    name: 'Information Technology',
    description: 'Technology systems',
    is_active: true,
  },
  {
    id: 2,
    code: 'OPS',
    name: 'Operations',
    description: null,
    is_active: false,
  },
]

const positions = [
  {
    id: 10,
    department_id: 1,
    code: 'SOFTWARE-ENGINEER',
    name: 'Software Engineer',
    description: 'Build company systems',
    is_active: true,
    department: departments[0],
  },
]

describe('MasterDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { role: 'admin' }
    mocks.getDepartments.mockResolvedValue({ data: { data: departments } })
    mocks.getPositions.mockResolvedValue({ data: { data: positions } })
    mocks.createDepartment.mockResolvedValue({ data: { data: departments[0] } })
  })

  it('loads Department master data on the default tab', async () => {
    render(<MasterDataPage />)

    expect(await screen.findByText('Information Technology')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(mocks.getDepartments).toHaveBeenCalledWith({ status: 'all' })
  })

  it('switches to the Position tab', async () => {
    const user = userEvent.setup()
    render(<MasterDataPage />)

    await screen.findByText('Information Technology')
    await user.click(screen.getByRole('button', { name: 'Jabatan' }))

    expect(await screen.findByText('Software Engineer')).toBeInTheDocument()
    expect(mocks.getPositions).toHaveBeenCalledWith({ status: 'all' })
  })

  it('allows Admin to create a Department with normalized payload', async () => {
    const user = userEvent.setup()
    render(<MasterDataPage />)

    await screen.findByText('Information Technology')
    await user.click(screen.getByRole('button', { name: 'Tambah Departemen' }))
    await user.type(screen.getByLabelText('Kode'), 'qa')
    await user.type(screen.getByLabelText('Nama Departemen'), ' Quality Assurance ')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    await waitFor(() => {
      expect(mocks.createDepartment).toHaveBeenCalledWith({
        code: 'QA',
        name: 'Quality Assurance',
        description: null,
        is_active: true,
      })
    })
  })

  it('renders Manager Department access as read-only', async () => {
    mocks.user = { role: 'manager' }
    render(<MasterDataPage />)

    expect(await screen.findByText('Information Technology')).toBeInTheDocument()
    expect(screen.getByText('Manager memiliki akses baca.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah Departemen' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Information Technology' })).not.toBeInTheDocument()
  })

  it('shows Laravel validation errors in the Department form', async () => {
    const user = userEvent.setup()
    mocks.createDepartment.mockRejectedValue({
      response: {
        data: {
          message: 'Data tidak valid.',
          errors: { code: ['Kode departemen sudah digunakan.'] },
        },
      },
    })

    render(<MasterDataPage />)
    await screen.findByText('Information Technology')
    await user.click(screen.getByRole('button', { name: 'Tambah Departemen' }))
    await user.type(screen.getByLabelText('Kode'), 'IT')
    await user.type(screen.getByLabelText('Nama Departemen'), 'Duplicate Department')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Kode departemen sudah digunakan.')).toBeInTheDocument()
  })
})
