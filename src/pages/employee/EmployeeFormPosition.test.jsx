import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import EmployeeFormModal from './components/EmployeeFormModal'
import { initialFormData } from './employee.helpers'

const branches = [{ id: 1, code: 'HQ-JKT', name: 'Head Office Jakarta' }]

const baseProps = {
  isEditing: false,
  departments: [{ id: 1, code: 'IT', name: 'Information Technology' }],
  branches,
  errors: {},
  isSubmitting: false,
  isLoadingDepartments: false,
  isLoadingPositions: false,
  isLoadingBranches: false,
  onChange: vi.fn(),
  onClose: vi.fn(),
  onSubmit: vi.fn(),
}

describe('Employee organization selection', () => {
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

  it('shows active Branch options', () => {
    render(
      <EmployeeFormModal
        {...baseProps}
        formData={{ ...initialFormData, department_id: '1', position_id: '10' }}
        positions={[{ id: 10, department_id: 1, code: 'SOFTWARE-ENGINEER', name: 'Software Engineer' }]}
      />,
    )

    const branchField = screen.getAllByRole('combobox').find((field) => field.name === 'branch_id')
    expect(branchField).toBeEnabled()
    expect(screen.getByRole('option', { name: 'HQ-JKT — Head Office Jakarta' })).toBeInTheDocument()
  })

  it('requires Branch before enabling submit', () => {
    render(
      <EmployeeFormModal
        {...baseProps}
        formData={{ ...initialFormData, department_id: '1', position_id: '10', branch_id: '' }}
        positions={[{ id: 10, department_id: 1, code: 'SOFTWARE-ENGINEER', name: 'Software Engineer' }]}
      />,
    )

    expect(screen.getByRole('button', { name: 'Simpan' })).toBeDisabled()
  })
})
