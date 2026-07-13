import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PayrollPage from './PayrollPage'

// Mock services
vi.mock('../../services/payrollService', () => ({
  default: {
    listPayrollPeriods: vi.fn().mockResolvedValue({ data: { data: [] } }),
    listPayrolls: vi.fn().mockResolvedValue({ data: { data: [], meta: { current_page: 1, last_page: 1, per_page: 15, total: 0 } } }),
    getPayroll: vi.fn(),
    submitPayroll: vi.fn(),
    approvePayroll: vi.fn(),
    simulatePayroll: vi.fn(),
    lockPayrollPeriod: vi.fn(),
    unlockPayrollPeriod: vi.fn(),
    listAdjustments: vi.fn().mockResolvedValue({ data: { data: [] } }),
    addAdjustment: vi.fn(),
    deleteAdjustment: vi.fn(),
    createPayrollPeriod: vi.fn(),
    updatePayrollPeriod: vi.fn(),
    deletePayrollPeriod: vi.fn(),
    generatePayroll: vi.fn(),
    recalculatePayroll: vi.fn(),
    reviewPayroll: vi.fn(),
    finalizePayroll: vi.fn(),
    markPayrollPaid: vi.fn(),
    cancelPayroll: vi.fn(),
  },
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn((selector) => selector({ user: { role: 'admin', name: 'Test Admin' } })),
}))

describe('PayrollPage', () => {
  it('renders payroll tabs', () => {
    render(
      <MemoryRouter>
        <PayrollPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Payroll')).toBeInTheDocument()
    expect(screen.getByText('Laporan')).toBeInTheDocument()
    expect(screen.getByText('Periode')).toBeInTheDocument()
    expect(screen.getByText('Profil Gaji')).toBeInTheDocument()
    expect(screen.getByText('Komponen')).toBeInTheDocument()
  })

  it('switches between tabs', async () => {
    render(
      <MemoryRouter>
        <PayrollPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText('Periode'))
    await waitFor(() => {
      expect(screen.getByText('Tambah Periode')).toBeInTheDocument()
    })
  })

  it('shows user access badge', () => {
    render(
      <MemoryRouter>
        <PayrollPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/admin/i)).toBeInTheDocument()
  })
})

describe('PayrollListTab integration', () => {
  it('shows empty state when no payrolls', async () => {
    render(
      <MemoryRouter>
        <PayrollPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Belum ada payroll')).toBeInTheDocument()
    })
  })

  it('shows filters', async () => {
    render(
      <MemoryRouter>
        <PayrollPage />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Nama atau nomor karyawan')).toBeInTheDocument()
    })
  })
})
