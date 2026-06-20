import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Sidebar from './Sidebar'

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    user: { name: 'Admin User', role: 'admin' },
    logout: vi.fn(),
  }),
}))

const renderSidebar = (path = '/dashboard') => render(
  <MemoryRouter initialEntries={[path]}>
    <Sidebar isOpen onClose={vi.fn()} />
  </MemoryRouter>,
)

describe('Sidebar profile submenu', () => {
  it('groups profile-related pages under Profil Saya', async () => {
    const user = userEvent.setup()
    renderSidebar()

    const profileButton = screen.getByRole('button', { name: /Profil Saya/i })
    expect(profileButton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: /Perubahan Profil/i })).not.toBeInTheDocument()

    await user.click(profileButton)

    expect(profileButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /Data Profil/i })).toHaveAttribute('href', '/profile')
    expect(screen.getByRole('link', { name: /Perubahan Profil/i })).toHaveAttribute('href', '/profile/changes')
    expect(screen.getByRole('link', { name: /Keamanan Akun/i })).toHaveAttribute('href', '/security')
    expect(screen.getByRole('link', { name: /Dokumen Saya/i })).toHaveAttribute('href', '/documents')
  })

  it('opens the group automatically on a profile child route', () => {
    renderSidebar('/security')

    expect(screen.getByRole('button', { name: /Profil Saya/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: /Keamanan Akun/i })).toBeInTheDocument()
  })
})
