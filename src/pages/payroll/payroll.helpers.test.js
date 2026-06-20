import { describe, expect, it } from 'vitest'
import {
  formatCurrency,
  mapSalaryComponentPayload,
  mapSalaryProfilePayload,
  nextPayrollActions,
  normalizePagination,
  normalizeRows,
} from './payroll.helpers'

describe('payroll helpers', () => {
  it('normalizes Laravel collection and paginator responses', () => {
    expect(normalizeRows({ data: { data: [{ id: 1 }] } })).toEqual([{ id: 1 }])
    expect(normalizeRows({ data: { data: { data: [{ id: 2 }] } } })).toEqual([{ id: 2 }])
    expect(normalizePagination({ data: { meta: { current_page: 2, last_page: 4, per_page: 15, total: 50 }, data: [] } })).toEqual({
      current_page: 2,
      last_page: 4,
      per_page: 15,
      total: 50,
    })
  })

  it('maps salary component form values to the API contract', () => {
    expect(mapSalaryComponentPayload({
      code: ' transport ',
      name: ' Transport Allowance ',
      type: 'earning',
      calculation_type: 'percentage',
      default_amount: '',
      percentage: '10',
      formula: 'ignored',
      description: '',
      is_active: true,
    })).toEqual({
      code: 'TRANSPORT',
      name: 'Transport Allowance',
      type: 'earning',
      calculation_type: 'percentage',
      default_amount: 0,
      percentage: 10,
      formula: null,
      description: null,
      is_active: true,
    })
  })

  it('maps salary profiles and component overrides', () => {
    expect(mapSalaryProfilePayload({
      basic_salary: '10000000',
      currency: 'idr',
      effective_from: '2026-06-01',
      effective_to: '',
      is_active: true,
      notes: ' Active profile ',
      components: [{ salary_component_id: '3', amount: '500000', percentage: '', formula: '' }],
    })).toEqual({
      basic_salary: 10000000,
      currency: 'IDR',
      effective_from: '2026-06-01',
      effective_to: null,
      is_active: true,
      notes: 'Active profile',
      components: [{ salary_component_id: 3, amount: 500000, percentage: null, formula: null }],
    })
  })

  it('returns lifecycle actions based on payroll status', () => {
    expect(nextPayrollActions('draft')).toEqual(expect.objectContaining({ canRecalculate: true, canReview: true, canFinalize: false }))
    expect(nextPayrollActions('reviewed')).toEqual(expect.objectContaining({ canFinalize: true, canMarkPaid: false }))
    expect(nextPayrollActions('finalized')).toEqual(expect.objectContaining({ canMarkPaid: true, canCancel: true }))
    expect(nextPayrollActions('paid')).toEqual(expect.objectContaining({ canCancel: false }))
  })

  it('formats IDR values', () => {
    expect(formatCurrency(1000000)).toContain('1.000.000')
  })
})
