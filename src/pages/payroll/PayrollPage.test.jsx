import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PayrollPage from './PayrollPage'

vi.mock('../../store/authStore', () => ({
  useAuthStore: (selector) => selector({ user: { role: 'hr' } }),
}))

vi.mock('./PayrollListTab', () => ({ default: () => <div>Payroll list content</div> }))
vi.mock('./PeriodsTab', () => ({ default: () => <div>Period content</div> }))
vi.mock('./ProfilesTab', () => ({ default: () => <div>Profile content</div> }))
vi.mock('./SalaryComponentsTab', () => ({ default: () => <div>Component content</div> }))

describe('PayrollPage', () => {
  it('renders payroll tabs and switches workspaces', async () => {
    const user = userEvent.setup()
    render(<PayrollPage />)

    expect(screen.getByRole('heading', { name: 'Payroll' })).toBeInTheDocument()
    expect(screen.getByText('Payroll list content')).toBeInTheDocument()
    expect(screen.getByText(/belum menghitung PPh 21/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Periode' }))
    expect(screen.getByText('Period content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Profil Gaji' }))
    expect(screen.getByText('Profile content')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Komponen' }))
    expect(screen.getByText('Component content')).toBeInTheDocument()
  })
})
