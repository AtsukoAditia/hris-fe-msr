import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MasterDataPage from './MasterDataPage'

const mocks = vi.hoisted(() => ({
  user: { role: 'admin' },
  getAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: mocks.user }),
}))

vi.mock('../../services/departmentService', () => ({
  default: {
    getAll: mocks.getAll,
    create: mocks.create,
    update: mocks.update,
    delete: mocks.delete,
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

describe('MasterDataPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.user = { role: 'admin' }
    mocks.getAll.mockResolvedValue({ data: { data: departments } })
    mocks.create.mockResolvedValue({ data: { data: departments[0] } })
  })

  it('loads and displays Department master data', async () => {
    render(<MasterDataPage />)

    expect(await screen.findByText('Information Technology')).toBeInTheDocument()
    expect(screen.getByText('Operations')).toBeInTheDocument()
    expect(mocks.getAll).toHaveBeenCalledWith({ status: 'all' })
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
      expect(mocks.create).toHaveBeenCalledWith({
        code: 'QA',
        name: 'Quality Assurance',
        description: null,
        is_active: true,
      })
    })
  })

  it('renders Manager access as read-only', async () => {
    mocks.user = { role: 'manager' }
    render(<MasterDataPage />)

    expect(await screen.findByText('Information Technology')).toBeInTheDocument()
    expect(screen.getByText(/Role Manager memiliki akses baca/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah Departemen' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Information Technology' })).not.toBeInTheDocument()
  })

  it('shows Laravel validation errors in the Department form', async () => {
    const user = userEvent.setup()
    mocks.create.mockRejectedValue({
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
