import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    user: { name: 'Admin User', role: 'admin' },
    logout: vi.fn(),
  }),
}))

describe('payroll navigation', () => {
  it('shows the payroll link for an admin user', () => {
    render(
      <MemoryRouter initialEntries={['/payroll']}>
        <Sidebar isOpen onClose={vi.fn()} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /Payroll/i })).toHaveAttribute('href', '/payroll')
  })
})
