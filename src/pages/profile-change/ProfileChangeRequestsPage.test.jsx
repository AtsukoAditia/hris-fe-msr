import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileChangeRequestsPage from './ProfileChangeRequestsPage'

const mocks = vi.hoisted(() => ({
  listMine: vi.fn(),
  create: vi.fn(),
  cancel: vi.fn(),
  listReviews: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
}))

vi.mock('../../services/profileChangeService', () => ({ default: mocks }))
vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector) => selector({ user: { id: 10, role: 'hr' } }),
}))

const request = {
  id: 7,
  status: 'pending',
  reason: 'Data legal berubah.',
  created_at: '2026-06-18T08:00:00Z',
  can_cancel: true,
  can_review: true,
  employee: { name: 'Budi Santoso', employee_number: 'EMP-0007', work_email: 'budi@hris.test' },
  changes: [{ field: 'nationality', current_value: 'Indonesia', requested_value: 'Malaysia' }],
}

const response = () => ({ data: { data: [request], total: 1 } })

const renderPage = (reviewMode = false) => render(
  <MemoryRouter>
    <ProfileChangeRequestsPage reviewMode={reviewMode} />
  </MemoryRouter>,
)

describe('Profile change requests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listMine.mockResolvedValue(response())
    mocks.listReviews.mockResolvedValue(response())
    mocks.create.mockResolvedValue({ data: { data: request } })
    mocks.cancel.mockResolvedValue({ data: { data: { ...request, status: 'cancelled' } } })
    mocks.approve.mockResolvedValue({ data: { data: { ...request, status: 'approved' } } })
    mocks.reject.mockResolvedValue({ data: { data: { ...request, status: 'rejected' } } })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('creates and cancels an Employee request', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Perubahan Profil' })).toBeInTheDocument()
    await user.type(screen.getByLabelText('Kewarganegaraan'), 'Malaysia')
    await user.type(screen.getByLabelText('Alasan Perubahan'), 'Dokumen baru sudah terbit.')
    await user.click(screen.getByRole('button', { name: 'Ajukan Perubahan' }))

    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({
      changes: { nationality: 'Malaysia' },
      reason: 'Dokumen baru sudah terbit.',
    }))

    await user.click(screen.getByRole('button', { name: /Permintaan #7/ }))
    const dialog = screen.getByText('Detail Permintaan #7').closest('div.fixed')
    await user.click(within(dialog).getByRole('button', { name: 'Batalkan Permintaan' }))
    await waitFor(() => expect(mocks.cancel).toHaveBeenCalledWith(7))
  })

  it('allows HR to approve and requires a note when rejecting', async () => {
    const user = userEvent.setup()
    renderPage(true)

    expect(await screen.findByRole('heading', { name: 'Review Perubahan Profil' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Budi Santoso/ }))
    const dialog = screen.getByText('Detail Permintaan #7').closest('div.fixed')

    await user.click(within(dialog).getByRole('button', { name: 'Tolak' }))
    expect(await screen.findByText('Catatan penolakan wajib diisi.')).toBeInTheDocument()

    await user.type(within(dialog).getByLabelText('Catatan Review'), 'Dokumen belum lengkap.')
    await user.click(within(dialog).getByRole('button', { name: 'Tolak' }))
    await waitFor(() => expect(mocks.reject).toHaveBeenCalledWith(7, { review_note: 'Dokumen belum lengkap.' }))
  })
})
