import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PositionTab from './PositionTab'

const mocks = vi.hoisted(() => ({
  getDepartments: vi.fn(),
  getPositions: vi.fn(),
  createPosition: vi.fn(),
  updatePosition: vi.fn(),
  deletePosition: vi.fn(),
}))

vi.mock('../../../services/departmentService', () => ({
  default: { getAll: mocks.getDepartments },
}))

vi.mock('../../../services/positionService', () => ({
  default: {
    getAll: mocks.getPositions,
    create: mocks.createPosition,
    update: mocks.updatePosition,
    delete: mocks.deletePosition,
  },
}))

const departments = [
  { id: 1, code: 'IT', name: 'Information Technology', is_active: true },
  { id: 2, code: 'HR', name: 'Human Resources', is_active: true },
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

describe('PositionTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getDepartments.mockResolvedValue({ data: { data: departments } })
    mocks.getPositions.mockResolvedValue({ data: { data: positions } })
    mocks.createPosition.mockResolvedValue({ data: { data: positions[0] } })
  })

  it('loads Position data with its Department', async () => {
    render(<PositionTab canManage />)

    expect(await screen.findByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Information Technology')).toBeInTheDocument()
    expect(mocks.getPositions).toHaveBeenCalledWith({ status: 'all' })
  })

  it('creates a Position with normalized Department payload', async () => {
    const user = userEvent.setup()
    render(<PositionTab canManage />)

    await screen.findByText('Software Engineer')
    await user.click(screen.getByRole('button', { name: 'Tambah Jabatan' }))
    await user.selectOptions(screen.getByDisplayValue('Pilih Departemen'), '1')
    await user.type(screen.getByPlaceholderText('Contoh: SOFTWARE-ENGINEER'), 'qa')
    await user.type(screen.getByPlaceholderText('Contoh: Software Engineer'), ' Quality Assurance ')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    await waitFor(() => {
      expect(mocks.createPosition).toHaveBeenCalledWith({
        department_id: 1,
        code: 'QA',
        name: 'Quality Assurance',
        description: null,
        is_active: true,
      })
    })
  })

  it('renders Manager access as read-only', async () => {
    render(<PositionTab canManage={false} />)

    expect(await screen.findByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText(/Manager memiliki akses baca/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah Jabatan' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Software Engineer' })).not.toBeInTheDocument()
  })

  it('shows backend validation feedback', async () => {
    const user = userEvent.setup()
    mocks.createPosition.mockRejectedValue({
      response: {
        data: {
          message: 'Data tidak valid.',
          errors: { code: ['Kode jabatan sudah digunakan.'] },
        },
      },
    })

    render(<PositionTab canManage />)
    await screen.findByText('Software Engineer')
    await user.click(screen.getByRole('button', { name: 'Tambah Jabatan' }))
    await user.selectOptions(screen.getByDisplayValue('Pilih Departemen'), '1')
    await user.type(screen.getByPlaceholderText('Contoh: SOFTWARE-ENGINEER'), 'QA')
    await user.type(screen.getByPlaceholderText('Contoh: Software Engineer'), 'Duplicate QA')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Kode jabatan sudah digunakan.')).toBeInTheDocument()
  })
})
