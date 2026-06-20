import { describe, expect, it } from 'vitest'
import { extractCollectionRows, mapLeaveBalanceCreatePayload, mapLeaveBalanceUpdatePayload, normalizeLeaveBalance } from './leaveAdminService'

describe('leaveAdminService helpers', () => {
  it('extracts nested paginator rows', () => {
    expect(extractCollectionRows({ data: { data: { data: [{ id: 1 }] } } })).toEqual([{ id: 1 }])
  })

  it('normalizes balance fields', () => {
    const result = normalizeLeaveBalance({
      employee_id: 2,
      employee: { full_name: 'Budi', email: 'budi@example.test' },
      total_days: 12,
      used_days: 3,
      pending_days: 9,
    })

    expect(result.total_entitled).toBe(12)
    expect(result.total_used).toBe(3)
    expect(result.total_pending).toBe(9)
    expect(result.employee.user.name).toBe('Budi')
  })

  it('maps form fields to backend fields', () => {
    const form = { employee_id: '2', leave_type_id: '3', year: '2026', total_entitled: '12', total_used: '2', total_pending: '10' }

    expect(mapLeaveBalanceCreatePayload(form)).toEqual({ employee_id: 2, leave_type_id: 3, year: 2026, total_days: 12, used_days: 2 })
    expect(mapLeaveBalanceUpdatePayload(form)).toEqual({ total_days: 12, used_days: 2, remaining_days: 10 })
  })
})
