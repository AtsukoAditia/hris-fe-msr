import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SmokeComponent from './SmokeComponent'

describe('SmokeComponent', () => {
  it('renders the application label and button', () => {
    render(<SmokeComponent name="HRIS MSR" />)

    expect(screen.getByRole('heading', { name: 'HRIS MSR Frontend' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled()
  })

  it('supports user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(
      <button type="button" onClick={handleClick}>
        Test Action
      </button>,
    )

    await user.click(screen.getByRole('button', { name: 'Test Action' }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
