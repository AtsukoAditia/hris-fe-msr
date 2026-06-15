import { describe, expect, it } from 'vitest'
import { mapFormDataToPayload, normalizeEmployee } from './employee.helpers'

describe('Employee organization master helpers', () => {
  it('normalizes Department and Position master fields from the API response', () => {
    const employee = normalizeEmployee({
      id: 10,
      department_id: 2,
      department: 'OPS',
      department_code: 'OPS',
      department_name: 'Operations',
      department_master: { id: 2, code: 'OPS', name: 'Operations' },
      position_id: 5,
      position: 'OPS-STAFF',
      position_code: 'OPS-STAFF',
      position_name: 'Staff Operation',
      position_master: { id: 5, code: 'OPS-STAFF', name: 'Staff Operation' },
      is_active: true,
    })

    expect(employee.department_id).toBe(2)
    expect(employee.department).toBe('Operations')
    expect(employee.department_code).toBe('OPS')
    expect(employee.position_id).toBe(5)
    expect(employee.position).toBe('Staff Operation')
    expect(employee.position_code).toBe('OPS-STAFF')
    expect(employee.position_master.name).toBe('Staff Operation')
  })

  it('maps Department and Position IDs to numeric Employee payload fields', () => {
    const payload = mapFormDataToPayload({
      name: ' Test Employee ',
      email: ' employee@hris.test ',
      nik: ' 12345 ',
      phone: '',
      address: '',
      birth_date: '',
      gender: '',
      department_id: '7',
      position_id: '12',
      join_date: '2026-06-15',
      employment_type: 'permanent',
      role: 'employee',
      status: 'active',
    })

    expect(payload.department_id).toBe(7)
    expect(payload.position_id).toBe(12)
    expect(payload).not.toHaveProperty('department')
    expect(payload).not.toHaveProperty('position')
    expect(payload.name).toBe('Test Employee')
  })
})
