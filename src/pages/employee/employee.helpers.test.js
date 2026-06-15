import { describe, expect, it } from 'vitest'
import { mapFormDataToPayload, normalizeEmployee } from './employee.helpers'

describe('Employee Department helpers', () => {
  it('normalizes Department master fields from the Employee API response', () => {
    const employee = normalizeEmployee({
      id: 10,
      department_id: 2,
      department: 'OPS',
      department_code: 'OPS',
      department_name: 'Operations',
      department_master: {
        id: 2,
        code: 'OPS',
        name: 'Operations',
      },
      is_active: true,
    })

    expect(employee.department_id).toBe(2)
    expect(employee.department).toBe('Operations')
    expect(employee.department_code).toBe('OPS')
    expect(employee.department_master.name).toBe('Operations')
  })

  it('maps the Employee form to a numeric department_id payload', () => {
    const payload = mapFormDataToPayload({
      name: ' Test Employee ',
      email: ' employee@hris.test ',
      nik: ' 12345 ',
      phone: '',
      address: '',
      birth_date: '',
      gender: '',
      position: ' Engineer ',
      department_id: '7',
      join_date: '2026-06-15',
      employment_type: 'permanent',
      role: 'employee',
      status: 'active',
    })

    expect(payload.department_id).toBe(7)
    expect(payload).not.toHaveProperty('department')
    expect(payload.name).toBe('Test Employee')
    expect(payload.position).toBe('Engineer')
  })
})
