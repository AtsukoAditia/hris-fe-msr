import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ReportsTab from './ReportsTab'

const mocks = vi.hoisted(() => ({
  listPayrollPeriods: vi.fn(),
  getPayrollReportSummary: vi.fn(),
  listPayrolls: vi.fn(),
  exportPayrollReport: vi.fn(),
  downloadAdminPayslip: vi.fn(),
  saveBlobResponse: vi.fn(),
}))

vi.mock('../../services/payrollService', () => ({ default: {
  listPayrollPeriods: mocks.listPayrollPeriods,
  getPayrollReportSummary: mocks.getPayrollReportSummary,
  listPayrolls: mocks.listPayrolls,
  exportPayrollReport: mocks.exportPayrollReport,
  downloadAdminPayslip: mocks.downloadAdminPayslip,
} }))
vi.mock('../../utils/downloadResponse', () => ({ saveBlobResponse: mocks.saveBlobResponse }))

const payroll = {
  id: 21,
  status: 'finalized',
  currency: 'IDR',
  net_salary: '9600000.00',
  employee: { employee_number: 'EMP-0021', name: 'Aditia Payroll' },
  period: { id: 3, name: 'Juni 2026' },
}

const summary = {
  records_count: 1,
  active_records_count: 1,
  currency: 'IDR',
  total_earnings: '10000000.00',
  total_deductions: '400000.00',
  total_net_salary: '9600000.00',
  status_counts: { draft: 0, reviewed: 0, finalized: 1, paid: 0, cancelled: 0 },
}

describe('Payroll reports tab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.listPayrollPeriods.mockResolvedValue({ data: { data: [{ id: 3, name: 'Juni 2026' }] } })
    mocks.getPayrollReportSummary.mockResolvedValue({ data: { data: summary } })
    mocks.listPayrolls.mockResolvedValue({ data: { data: [payroll] } })
    mocks.exportPayrollReport.mockResolvedValue({ data: new Blob(['report']), headers: {} })
    mocks.downloadAdminPayslip.mockResolvedValue({ data: new Blob(['payslip']), headers: {} })
  })

  it('loads summary and applies identical filters to preview', async () => {
    const user = userEvent.setup()
    render(<ReportsTab />)

    expect(await screen.findByText('Payroll Aktif')).toBeInTheDocument()
    expect(screen.getAllByText('Aditia Payroll').length).toBeGreaterThan(0)

    await user.selectOptions(screen.getByLabelText('Filter periode payroll'), '3')
    await user.click(screen.getByRole('button', { name: 'Terapkan' }))

    await waitFor(() => expect(mocks.getPayrollReportSummary).toHaveBeenLastCalledWith({ payroll_period_id: '3' }))
    expect(mocks.listPayrolls).toHaveBeenLastCalledWith({ payroll_period_id: '3', per_page: 100 })
  })

  it('exports CSV and PDF through protected blob requests', async () => {
    const user = userEvent.setup()
    render(<ReportsTab />)
    await screen.findByText('Payroll Aktif')

    await user.click(screen.getByRole('button', { name: 'Export CSV' }))
    await waitFor(() => expect(mocks.exportPayrollReport).toHaveBeenCalledWith('csv', {}))
    expect(mocks.saveBlobResponse).toHaveBeenCalledWith(expect.any(Object), 'payroll-report.csv')

    await user.click(screen.getByRole('button', { name: 'Export PDF' }))
    await waitFor(() => expect(mocks.exportPayrollReport).toHaveBeenCalledWith('pdf', {}))
  })

  it('downloads finalized employee document from report preview', async () => {
    const user = userEvent.setup()
    render(<ReportsTab />)
    await screen.findByText('Payroll Aktif')

    await user.click(screen.getAllByRole('button', { name: 'Unduh' })[0])
    await waitFor(() => expect(mocks.downloadAdminPayslip).toHaveBeenCalledWith(21))
  })
})
