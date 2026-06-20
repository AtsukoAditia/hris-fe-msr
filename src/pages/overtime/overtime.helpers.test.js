import { describe, expect, it } from 'vitest'
import { calculateMinutes, formatMinutes, getPaginationMeta, normalizeRows } from './overtime.helpers'

describe('overtime helpers', () => {
  it('calculates same-day and overnight overtime duration', () => {
    expect(calculateMinutes('18:00', '20:30')).toBe(150)
    expect(calculateMinutes('22:00', '01:00')).toBe(180)
  })

  it('formats overtime duration for the interface', () => {
    expect(formatMinutes(45)).toBe('45 menit')
    expect(formatMinutes(120)).toBe('2 jam')
    expect(formatMinutes(135)).toBe('2 jam 15 menit')
  })

  it('normalizes Laravel resource collections and pagination metadata', () => {
    const payload = {
      data: [{ id: 1 }],
      meta: { current_page: 2, last_page: 4, total: 61 },
    }

    expect(normalizeRows(payload)).toEqual([{ id: 1 }])
    expect(getPaginationMeta(payload)).toEqual({ currentPage: 2, lastPage: 4, total: 61 })
  })
})
