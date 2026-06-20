import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PayslipsPage from './PayslipsPage'

const mocks = vi.hoisted(() => ({
  listMyPayslips: vi.fn(),
  getMyPayslip: vi.fn(),
  downloadMyPayslip: vi.fn(),
  saveBlobResponse: vi.fn(),
}))

vi.mock('../../services/payrollService', () => ({ default: {
  listMyPayslips: mocks.listMyPayslips,
  getMyPayslip: mocks.getMyPayslip,
  downloadMyPayslip: mocks.downloadMyPayslip,
} }))
vi.mock('../../utils/downloadResponse', () => ({ saveBlobResponse: mocks.saveBlobResponse }))

const payroll = {
  id: 14,
  status: 'paid',
  currency: 'IDR',
  total_earnings: '10000000.00',
  total_deductions: '400000.00',
  net_salary: '9600000.00',
  attendance_days: 20,
  absent_days: 1,
  late_minutes: 10,
  unpaid_leave_days: 0,
  overtime_minutes: 120,
  period: { name: 'Juni 2026', start_date: '2026-06-01', end_date: '2026-06-30' },
  items: [
    { id: 1, code: 'BASIC', name: 'Gaji Pokok', type: 'earning', source: 'basic_salary', amount: '9000000.00' },
    { id: 2, code: 'ALLOWANCE', name: 'Tunjangan', type: 'earning', source: 'salary_component', amount: '1000000.00' },
    { id: 3, code: 'ABSENCE', name: 'Potongan Absen', type: 'deduction', source: 'attendance', amount: '400000.00' },
  ],
}

const listResponse = { data: { data: [payroll], meta: { current_page: 1, last_page: 1, per_page: 12, total: 1 } } }

describe('Payslips page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listMyPayslips.mockResolvedValue(listResponse)
    mocks.getMyPayslip.mockResolvedValue({ data: { data: payroll } })
    mocks.downloadMyPayslip.mockResolvedValue({ data: new Blob(['pdf']), headers: {} })
  })

  it('shows history and detailed earning deduction breakdown', async () => {
    const user = userEvent.setup()
    render(<PayslipsPage />)

    expect(await screen.findByRole('heading', { name: 'Slip Gaji Saya' })).toBeInTheDocument()
    expect(screen.getAllByText('Juni 2026').length).toBeGreaterThan(0)

    await user.click(screen.getAllByRole('button', { name: 'Detail' })[0])
    const dialog = await screen.findByRole('dialog', { name: 'Rincian Slip Gaji' })
    expect(mocks.getMyPayslip).toHaveBeenCalledWith(14)
    expect(within(dialog).getByText('Gaji Pokok')).toBeInTheDocument()
    expect(within(dialog).getByText('Potongan Absen')).toBeInTheDocument()
  })

  it('downloads the document through authenticated blob service', async () => {
    const user = userEvent.setup()
    render(<PayslipsPage />)
    await screen.findAllByText('Juni 2026')

    await user.click(screen.getAllByRole('button', { name: 'Unduh PDF' })[0])

    await waitFor(() => expect(mocks.downloadMyPayslip).toHaveBeenCalledWith(14))
    expect(mocks.saveBlobResponse).toHaveBeenCalledWith(expect.any(Object), 'payslip-14.pdf')
  })

  it('shows empty state when no finalized document exists', async () => {
    mocks.listMyPayslips.mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 1, total: 0 } } })
    render(<PayslipsPage />)

    expect(await screen.findByText('Belum ada slip gaji')).toBeInTheDocument()
  })
})
