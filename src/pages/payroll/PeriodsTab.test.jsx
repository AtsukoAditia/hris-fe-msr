import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PeriodsTab from './PeriodsTab'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  generate: vi.fn(),
}))

vi.mock('../../services/payrollService', () => ({
  default: {
    listPayrollPeriods: mocks.list,
    createPayrollPeriod: vi.fn(),
    updatePayrollPeriod: vi.fn(),
    deletePayrollPeriod: vi.fn(),
    generatePayroll: mocks.generate,
  },
}))

describe('PeriodsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    mocks.list.mockResolvedValue({
      data: {
        data: [{ id: 1, name: 'June 2026', start_date: '2026-06-01', end_date: '2026-06-30', cutoff_start_date: '2026-06-01', cutoff_end_date: '2026-06-25', status: 'open', payrolls_count: 0 }],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      },
    })
    mocks.generate.mockResolvedValue({ data: { data: [{ id: 9 }], meta: { generated_count: 1 } } })
  })

  it('generates payroll from an open period', async () => {
    const user = userEvent.setup()
    const onGenerated = vi.fn()
    render(<PeriodsTab onGenerated={onGenerated} />)

    expect(await screen.findAllByText('June 2026')).not.toHaveLength(0)
    await user.click(screen.getAllByRole('button', { name: 'Generate' })[0])

    await waitFor(() => {
      expect(mocks.generate).toHaveBeenCalledWith(1)
      expect(onGenerated).toHaveBeenCalled()
    })
  })
})
