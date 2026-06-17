import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfilePage from './ProfilePage'

const mocks = vi.hoisted(() => ({
  getMine: vi.fn(),
  updateMine: vi.fn(),
  getByEmployee: vi.fn(),
  updateByEmployee: vi.fn(),
  createMineContact: vi.fn(),
  updateMineContact: vi.fn(),
  deleteMineContact: vi.fn(),
  createEmployeeContact: vi.fn(),
  updateEmployeeContact: vi.fn(),
  deleteEmployeeContact: vi.fn(),
}))

vi.mock('../../services/profileService', () => ({
  default: {
    getMine: mocks.getMine,
    updateMine: mocks.updateMine,
    getByEmployee: mocks.getByEmployee,
    updateByEmployee: mocks.updateByEmployee,
    createMineContact: mocks.createMineContact,
    updateMineContact: mocks.updateMineContact,
    deleteMineContact: mocks.deleteMineContact,
    createEmployeeContact: mocks.createEmployeeContact,
    updateEmployeeContact: mocks.updateEmployeeContact,
    deleteEmployeeContact: mocks.deleteEmployeeContact,
  },
}))

const profilePayload = {
  employee: {
    id: 42,
    employee_number: 'IT-0042',
    name: 'Profile Employee',
    work_email: 'profile.employee@hris.test',
    phone: '081200000042',
    birth_date: '1998-01-02',
    gender: 'male',
    department: { id: 1, name: 'Information Technology' },
    position: { id: 2, name: 'Software Engineer' },
    branch: { id: 1, name: 'Head Office Jakarta' },
  },
  profile: {
    personal_email: 'personal@example.com',
    city: 'Jakarta',
    province: 'DKI Jakarta',
  },
  emergency_contacts: [
    {
      id: 7,
      name: 'Primary Parent',
      relationship: 'parent',
      phone: '0811111111',
      is_primary: true,
    },
  ],
  completion: {
    percentage: 75,
    completed_fields: ['phone', 'birth_date'],
    total_fields: 12,
    missing_fields: ['domicile_address'],
  },
}

const response = (payload = profilePayload) => ({ data: { data: payload } })

const renderPage = (path = '/profile') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/employee/:employeeId/profile" element={<ProfilePage />} />
      <Route path="/employee" element={<div>Employee List</div>} />
    </Routes>
  </MemoryRouter>,
)

describe('Employee Profile page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getMine.mockResolvedValue(response())
    mocks.getByEmployee.mockResolvedValue(response())
    mocks.updateMine.mockResolvedValue(response())
    mocks.updateByEmployee.mockResolvedValue(response())
    mocks.createMineContact.mockResolvedValue({ data: { data: { id: 8 } } })
    mocks.updateMineContact.mockResolvedValue({ data: { data: { id: 7 } } })
    mocks.deleteMineContact.mockResolvedValue({ data: { success: true } })
    mocks.createEmployeeContact.mockResolvedValue({ data: { data: { id: 8 } } })
    mocks.updateEmployeeContact.mockResolvedValue({ data: { data: { id: 7 } } })
    mocks.deleteEmployeeContact.mockResolvedValue({ data: { success: true } })
  })

  it('loads self profile, completion, and primary emergency contact', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Profil Saya' })).toBeInTheDocument()
    expect(screen.getByText('Profile Employee')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Primary Parent')).toBeInTheDocument()
    expect(screen.getByText('Utama')).toBeInTheDocument()
    expect(mocks.getMine).toHaveBeenCalledTimes(1)
  })

  it('updates self profile using normalized form payload', async () => {
    const user = userEvent.setup()
    renderPage()

    const phone = await screen.findByLabelText('Nomor Telepon')
    await user.clear(phone)
    await user.type(phone, '089900001111')
    await user.click(screen.getByRole('button', { name: 'Simpan Profil' }))

    await waitFor(() => {
      expect(mocks.updateMine).toHaveBeenCalledWith(expect.objectContaining({
        phone: '089900001111',
        personal_email: 'personal@example.com',
      }))
    })
  })

  it('creates a self emergency contact and reloads profile data', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText('Primary Parent')
    await user.click(screen.getByRole('button', { name: 'Tambah Kontak' }))
    await user.type(screen.getByLabelText('Nama Lengkap'), 'Emergency Friend')
    await user.selectOptions(screen.getByLabelText('Hubungan'), 'friend')
    await user.type(screen.getByLabelText('Nomor Telepon'), '0822222222')
    await user.click(screen.getByLabelText('Jadikan kontak utama'))
    await user.click(screen.getByRole('button', { name: 'Simpan', exact: true }))

    await waitFor(() => {
      expect(mocks.createMineContact).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Emergency Friend',
        relationship: 'friend',
        phone: '0822222222',
        is_primary: true,
      }))
      expect(mocks.getMine).toHaveBeenCalledTimes(2)
    })
  })

  it('uses administrative APIs for an Employee profile route', async () => {
    const user = userEvent.setup()
    renderPage('/employee/42/profile')

    expect(await screen.findByRole('heading', { name: 'Profil Karyawan' })).toBeInTheDocument()
    expect(mocks.getByEmployee).toHaveBeenCalledWith('42')
    expect(screen.getByRole('link', { name: 'Kembali ke daftar karyawan' })).toHaveAttribute('href', '/employee')

    await user.click(screen.getByTitle('Edit kontak'))
    await user.clear(screen.getByLabelText('Nama Lengkap'))
    await user.type(screen.getByLabelText('Nama Lengkap'), 'Updated Parent')
    await user.click(screen.getByRole('button', { name: 'Perbarui' }))

    await waitFor(() => {
      expect(mocks.updateEmployeeContact).toHaveBeenCalledWith('42', 7, expect.objectContaining({
        name: 'Updated Parent',
      }))
    })
  })
})
