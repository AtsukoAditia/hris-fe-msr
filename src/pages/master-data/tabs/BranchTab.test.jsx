import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BranchTab from './BranchTab'

const mocks = vi.hoisted(() => ({
  getBranches: vi.fn(),
  createBranch: vi.fn(),
  updateBranch: vi.fn(),
  deleteBranch: vi.fn(),
}))

vi.mock('../../../services/branchService', () => ({
  default: {
    getAll: mocks.getBranches,
    create: mocks.createBranch,
    update: mocks.updateBranch,
    delete: mocks.deleteBranch,
  },
}))

const branches = [
  {
    id: 1,
    code: 'HQ-JKT',
    name: 'Head Office Jakarta',
    address: 'Jakarta',
    latitude: '-6.2000000',
    longitude: '106.8166667',
    radius_meters: 150,
    timezone: 'Asia/Jakarta',
    is_active: true,
    employees_count: 4,
  },
]

describe('BranchTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getBranches.mockResolvedValue({ data: { data: branches } })
    mocks.createBranch.mockResolvedValue({ data: { data: branches[0] } })
  })

  it('loads Branch location data', async () => {
    render(<BranchTab canManage />)

    expect(await screen.findByText('Head Office Jakarta')).toBeInTheDocument()
    expect(screen.getByText('HQ-JKT')).toBeInTheDocument()
    expect(screen.getByText('150 meter')).toBeInTheDocument()
    expect(screen.getByText('Asia/Jakarta')).toBeInTheDocument()
    expect(mocks.getBranches).toHaveBeenCalledWith({ status: 'all' })
  })

  it('creates a Branch with normalized location payload', async () => {
    const user = userEvent.setup()
    render(<BranchTab canManage />)

    await screen.findByText('Head Office Jakarta')
    await user.click(screen.getByRole('button', { name: 'Tambah Cabang' }))
    await user.type(screen.getByLabelText('Kode Cabang'), ' bks ')
    await user.type(screen.getByLabelText('Nama Cabang'), ' Bekasi Branch ')
    await user.type(screen.getByLabelText('Alamat'), ' Bekasi ')
    await user.type(screen.getByLabelText('Latitude'), '-6.2382699')
    await user.type(screen.getByLabelText('Longitude'), '106.9755726')
    await user.clear(screen.getByLabelText('Radius Absensi (meter)'))
    await user.type(screen.getByLabelText('Radius Absensi (meter)'), '200')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    await waitFor(() => {
      expect(mocks.createBranch).toHaveBeenCalledWith({
        code: 'BKS',
        name: 'Bekasi Branch',
        address: 'Bekasi',
        latitude: -6.2382699,
        longitude: 106.9755726,
        radius_meters: 200,
        timezone: 'Asia/Jakarta',
        is_active: true,
      })
    })
  })

  it('renders Manager access as read-only', async () => {
    render(<BranchTab canManage={false} />)

    expect(await screen.findByText('Head Office Jakarta')).toBeInTheDocument()
    expect(screen.getByText(/Manager memiliki akses baca/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tambah Cabang' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit Head Office Jakarta' })).not.toBeInTheDocument()
  })

  it('shows backend validation feedback', async () => {
    const user = userEvent.setup()
    mocks.createBranch.mockRejectedValue({
      response: {
        data: {
          message: 'Data tidak valid.',
          errors: {
            code: ['Kode cabang sudah digunakan.'],
            longitude: ['Longitude wajib diisi bersama latitude.'],
          },
        },
      },
    })

    render(<BranchTab canManage />)
    await screen.findByText('Head Office Jakarta')
    await user.click(screen.getByRole('button', { name: 'Tambah Cabang' }))
    await user.type(screen.getByLabelText('Kode Cabang'), 'HQ-JKT')
    await user.type(screen.getByLabelText('Nama Cabang'), 'Duplicate Head Office')
    await user.type(screen.getByLabelText('Latitude'), '-6.2')
    await user.click(screen.getByRole('button', { name: 'Simpan' }))

    expect(await screen.findByText('Kode cabang sudah digunakan.')).toBeInTheDocument()
    expect(screen.getByText('Longitude wajib diisi bersama latitude.')).toBeInTheDocument()
  })

  it('shows assigned Branch deletion error', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mocks.deleteBranch.mockRejectedValue({
      response: { data: { message: 'Cabang masih digunakan oleh karyawan dan tidak dapat dihapus.' } },
    })

    render(<BranchTab canManage />)
    await screen.findByText('Head Office Jakarta')
    await user.click(screen.getByRole('button', { name: 'Hapus Head Office Jakarta' }))

    expect(await screen.findByText('Cabang masih digunakan oleh karyawan dan tidak dapat dihapus.')).toBeInTheDocument()
  })
})
