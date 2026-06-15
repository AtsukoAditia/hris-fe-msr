import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import EmployeeFormModal from './components/EmployeeFormModal'
import { initialFormData } from './employee.helpers'

const baseProps = {
  isEditing: false,
  departments: [{ id: 1, code: 'IT', name: 'Information Technology' }],
  errors: {},
  isSubmitting: false,
  isLoadingDepartments: false,
  isLoadingPositions: false,
  onChange: vi.fn(),
  onClose: vi.fn(),
  onSubmit: vi.fn(),
}

describe('Employee Position selection', () => {
  it('keeps Position disabled before Department is selected', () => {
    render(<EmployeeFormModal {...baseProps} formData={initialFormData} positions={[]} />)

    const positionField = screen.getAllByRole('combobox').find((field) => field.name === 'position_id')
    expect(positionField).toBeDisabled()
  })

  it('shows Position options after Department is selected', () => {
    render(
      <EmployeeFormModal
        {...baseProps}
        formData={{ ...initialFormData, department_id: '1' }}
        positions={[{ id: 10, department_id: 1, code: 'SOFTWARE-ENGINEER', name: 'Software Engineer' }]}
      />,
    )

    const positionField = screen.getAllByRole('combobox').find((field) => field.name === 'position_id')
    expect(positionField).toBeEnabled()
    expect(screen.getByText('SOFTWARE-ENGINEER — Software Engineer')).toBeInTheDocument()
  })
})
