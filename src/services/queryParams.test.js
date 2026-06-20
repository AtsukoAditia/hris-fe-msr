import { describe, expect, it } from 'vitest'
import { normalizeQueryParams } from './queryParams'

describe('normalizeQueryParams', () => {
  it('converts boolean query values to numbers', () => {
    expect(normalizeQueryParams({ active_only: true, include_deleted: false, search: 'IT' })).toEqual({
      active_only: 1,
      include_deleted: 0,
      search: 'IT',
    })
  })
})
