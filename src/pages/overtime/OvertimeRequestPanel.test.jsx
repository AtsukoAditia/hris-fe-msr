import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import OvertimeRequestPanel from './OvertimeRequestPanel'

const mocks = vi.hoisted(() => ({
  listMine: vi.fn(),
  listForReview: vi.fn(),
  create: vi.fn(),
  cancel: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
  recordActual: vi.fn(),
}))

vi.mock('../../services/overtimeService', () => ({ default: mocks }))

const emptyResponse = {
  data: {
    data: [],
    meta: { current_page: 1, last_page: 1, total: 0 },
  },
}

const policies = [{
  id: 3,
  name: 'Weekday Overtime',
  daily_max_minutes: 240,
  weekly_max_minutes: 1200,
  rate_multiplier: '1.5',
  is_active: true,
}]

describe('OvertimeRequestPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listMine.mockResolvedValue(emptyResponse)
    mocks.listForReview.mockResolvedValue(emptyResponse)
    mocks.create.mockResolvedValue({ data: { data: { id: 10, status: 'pending' } } })
  })

  it('submits an employee overtime request using backend field names', async () => {
    const user = userEvent.setup()
    render(<OvertimeRequestPanel mode="mine" role="employee" user={{ role: 'employee', employee: { id: 8 } }} activePolicies={policies} />)

    expect(await screen.findByText('Belum ada pengajuan lembur.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '+ Ajukan Lembur' }))

    const dialog = screen.getByRole('dialog')
    await user.selectOptions(within(dialog).getByLabelText('Policy lembur'), '3')
    await user.type(within(dialog).getByLabelText('Tanggal lembur'), '2026-06-24')
    await user.type(within(dialog).getByLabelText('Mulai'), '18:00')
    await user.type(within(dialog).getByLabelText('Selesai'), '20:00')
    await user.type(within(dialog).getByLabelText('Alasan lembur'), 'Menutup pekerjaan sprint.')
    await user.click(within(dialog).getByRole('button', { name: 'Kirim' }))

    await waitFor(() => expect(mocks.create).toHaveBeenCalledWith({
      overtime_policy_id: '3',
      overtime_date: '2026-06-24',
      planned_start_time: '18:00',
      planned_end_time: '20:00',
      reason: 'Menutup pekerjaan sprint.',
    }))
  })
})
