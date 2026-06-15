import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import LoginPage from './LoginPage'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  loginRequest: vi.fn(),
}))

vi.mock('../../store/authStore', () => ({
  useAuthStore: () => ({
    login: mocks.login,
    isAuthenticated: false,
  }),
}))

vi.mock('../../services/authService', () => ({
  authService: {
    login: mocks.loginRequest,
  },
}))

const renderLoginPage = () => render(
  <MemoryRouter>
    <LoginPage />
  </MemoryRouter>
)

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the login form', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'HRIS MSR' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('email@company.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Masukkan password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const passwordInput = screen.getByPlaceholderText('Masukkan password')
    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show' }))

    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  })

  it('shows validation errors for an empty form', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    expect(await screen.findByText('Format email tidak valid')).toBeInTheDocument()
    expect(await screen.findByText('Password minimal 6 karakter')).toBeInTheDocument()
    expect(mocks.loginRequest).not.toHaveBeenCalled()
  })

  it('submits valid credentials and stores the authenticated user', async () => {
    const user = userEvent.setup()
    const authenticatedUser = { id: 1, name: 'Admin HRIS' }

    mocks.loginRequest.mockResolvedValue({
      data: {
        user: authenticatedUser,
        token: 'test-token',
      },
    })

    renderLoginPage()

    await user.type(screen.getByPlaceholderText('email@company.com'), 'admin@hris.test')
    await user.type(screen.getByPlaceholderText('Masukkan password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Masuk' }))

    await waitFor(() => {
      expect(mocks.loginRequest).toHaveBeenCalledWith({
        email: 'admin@hris.test',
        password: 'password123',
      })
    })

    expect(mocks.login).toHaveBeenCalledWith(authenticatedUser, 'test-token')
  })
})
