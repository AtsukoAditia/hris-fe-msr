import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PayrollListTab from './PayrollListTab'

const mocks = vi.hoisted(() => ({
  listPeriods: vi.fn(),
  listPayrolls: vi.fn(),
  review: vi.fn(),
}))

vi.mock('../../services/payrollService', () => ({
  default: {
    listPayrollPeriods: mocks.listPeriods,
    listPayrolls: mocks.listPayrolls,
    getPayroll: vi.fn(),
    recalculatePayroll: vi.fn(),
    reviewPayroll: mocks.review,
    finalizePayroll: vi.fn(),
    markPayrollPaid: vi.fn(),
    cancelPayroll: vi.fn(),
  },
}))

const payroll = {
  id: 7,
  employee_id: 2,
  employee: { name: 'Budi', employee_number: 'EMP-002' },
  payroll_period_id: 1,
  period: { id: 1, name: 'June 2026' },
  status: 'draft',
  currency: 'IDR',
  total_earnings: '11000000.00',
  total_deductions: '500000.00',
  net_salary: '10500000.00',
}

describe('PayrollListTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mocks.listPeriods.mockResolvedValue({ data: { data: [{ id: 1, name: 'June 2026' }] } })
    mocks.listPayrolls.mockResolvedValue({
      data: {
        data: [payroll],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      },
    })
    mocks.review.mockResolvedValue({ data: { data: { ...payroll, status: 'reviewed' } } })
  })

  it('renders draft payroll and performs review action', async () => {
    const user = userEvent.setup()
    render(<PayrollListTab />)

    expect(await screen.findAllByText('Budi')).not.toHaveLength(0)
    await user.click(screen.getAllByRole('button', { name: 'Review' })[0])

    await waitFor(() => expect(mocks.review).toHaveBeenCalledWith(7))
  })
})
