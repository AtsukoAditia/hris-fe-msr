import { describe, expect, it } from 'vitest'
import { mapFormDataToPayload, normalizeEmployee, normalizeManagerOptions } from './employee.helpers'

describe('Employee organization master helpers', () => {
  it('normalizes Department, Position, Branch, and Manager fields from the API response', () => {
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
      branch_id: 3,
      branch_code: 'BDG',
      branch_name: 'Bandung Branch',
      branch: { id: 3, code: 'BDG', name: 'Bandung Branch', address: 'Bandung', radius_meters: 150, timezone: 'Asia/Jakarta' },
      manager_id: 20,
      manager_name: 'Operation Manager',
      manager_employee_number: 'OPS-0020',
      manager_position_name: 'Operation Manager',
      manager: { id: 20, employee_number: 'OPS-0020', user: { name: 'Operation Manager' } },
      is_active: true,
    })

    expect(employee.department_id).toBe(2)
    expect(employee.department).toBe('Operations')
    expect(employee.department_code).toBe('OPS')
    expect(employee.position_id).toBe(5)
    expect(employee.position).toBe('Staff Operation')
    expect(employee.position_code).toBe('OPS-STAFF')
    expect(employee.position_master.name).toBe('Staff Operation')
    expect(employee.branch_id).toBe(3)
    expect(employee.branch_name).toBe('Bandung Branch')
    expect(employee.branch_code).toBe('BDG')
    expect(employee.branch.address).toBe('Bandung')
    expect(employee.manager_id).toBe(20)
    expect(employee.manager_name).toBe('Operation Manager')
    expect(employee.manager_employee_number).toBe('OPS-0020')
    expect(employee.manager_position_name).toBe('Operation Manager')
  })

  it('maps organization IDs to numeric Employee payload fields', () => {
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
      branch_id: '3',
      manager_id: '20',
      join_date: '2026-06-15',
      employment_type: 'permanent',
      role: 'employee',
      status: 'active',
    })

    expect(payload.department_id).toBe(7)
    expect(payload.position_id).toBe(12)
    expect(payload.branch_id).toBe(3)
    expect(payload.manager_id).toBe(20)
    expect(payload).not.toHaveProperty('department')
    expect(payload).not.toHaveProperty('position')
    expect(payload.name).toBe('Test Employee')
  })

  it('maps an empty Manager selection to null', () => {
    const payload = mapFormDataToPayload({
      name: 'Director',
      email: 'director@hris.test',
      nik: '100',
      department_id: '1',
      position_id: '1',
      branch_id: '1',
      manager_id: '',
      join_date: '2026-06-17',
      role: 'manager',
      status: 'active',
    })

    expect(payload.manager_id).toBeNull()
  })

  it('normalizes manager option labels returned by the API', () => {
    const options = normalizeManagerOptions({
      data: {
        data: [
          {
            id: 20,
            employee_number: 'IT-0020',
            name: 'Engineering Lead',
            position_name: 'Engineering Manager',
          },
        ],
      },
    })

    expect(options).toHaveLength(1)
    expect(options[0]).toMatchObject({
      id: 20,
      name: 'Engineering Lead',
      employee_number: 'IT-0020',
      label: 'Engineering Lead — Engineering Manager (IT-0020)',
    })
  })
})
