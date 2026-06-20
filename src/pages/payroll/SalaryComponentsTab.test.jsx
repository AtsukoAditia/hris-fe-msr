import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SalaryComponentsTab from './SalaryComponentsTab'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}))

vi.mock('../../services/payrollService', () => ({
  default: {
    listSalaryComponents: mocks.list,
    createSalaryComponent: mocks.create,
    updateSalaryComponent: mocks.update,
    deleteSalaryComponent: mocks.remove,
  },
}))

describe('SalaryComponentsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.list.mockResolvedValue({
      data: {
        data: [{ id: 1, code: 'MEAL', name: 'Meal Allowance', type: 'earning', calculation_type: 'fixed', default_amount: '300000.00', is_active: true }],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
      },
    })
    mocks.create.mockResolvedValue({ data: { data: { id: 2 } } })
  })

  it('loads components and submits a normalized create payload', async () => {
    const user = userEvent.setup()
    render(<SalaryComponentsTab />)

    expect(await screen.findAllByText('Meal Allowance')).not.toHaveLength(0)
    await user.click(screen.getByRole('button', { name: /Tambah Komponen/i }))
    await user.type(screen.getByLabelText(/Kode/i), 'transport')
    await user.type(screen.getByLabelText(/^Nama/i), 'Transport Allowance')
    await user.type(screen.getByLabelText(/Nominal Default/i), '500000')
    await user.click(screen.getByRole('button', { name: /^Simpan$/i }))

    await waitFor(() => {
      expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({
        code: 'TRANSPORT',
        name: 'Transport Allowance',
        type: 'earning',
        default_amount: 500000,
      }))
    })
  })
})
