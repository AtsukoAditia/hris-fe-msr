import { describe, expect, it } from 'vitest'
import {
  initialProfileForm,
  mapContactFormToPayload,
  mapProfileFormToPayload,
  normalizeProfileResponse,
  toContactForm,
  toProfileForm,
} from './profile.helpers'

describe('profile helpers', () => {
  it('normalizes nested API profile data and maps it to form values', () => {
    const normalized = normalizeProfileResponse({
      data: {
        data: {
          employee: { id: 7, phone: '0812', birth_date: '1998-01-02' },
          profile: { personal_email: 'person@example.com', city: 'Jakarta' },
          emergency_contacts: [{ id: 1, name: 'Parent' }],
          completion: { percentage: 50, total_fields: 12 },
        },
      },
    })

    expect(normalized.employee.id).toBe(7)
    expect(normalized.emergency_contacts).toHaveLength(1)
    expect(toProfileForm(normalized)).toMatchObject({
      phone: '0812',
      birth_date: '1998-01-02',
      personal_email: 'person@example.com',
      city: 'Jakarta',
    })
  })

  it('returns safe defaults for incomplete responses', () => {
    const normalized = normalizeProfileResponse({ data: { data: null } })

    expect(normalized.employee).toEqual({})
    expect(normalized.profile).toEqual({})
    expect(normalized.emergency_contacts).toEqual([])
    expect(toProfileForm(normalized)).toEqual(initialProfileForm)
  })

  it('trims values and maps blank optional fields to null', () => {
    expect(mapProfileFormToPayload({
      phone: ' 08123 ',
      personal_email: ' ',
    })).toEqual({
      phone: '08123',
      personal_email: null,
    })

    expect(mapContactFormToPayload({
      name: ' Parent ',
      relationship: 'parent',
      phone: ' 0812 ',
      alternate_phone: '',
      email: ' parent@example.com ',
      address: ' ',
      is_primary: true,
      notes: '',
    })).toEqual({
      name: 'Parent',
      relationship: 'parent',
      phone: '0812',
      alternate_phone: null,
      email: 'parent@example.com',
      address: null,
      is_primary: true,
      notes: null,
    })
  })

  it('normalizes contact values for editing', () => {
    expect(toContactForm({
      id: 10,
      name: 'Parent',
      is_primary: 1,
      phone: null,
    })).toMatchObject({
      id: 10,
      name: 'Parent',
      phone: '',
      is_primary: true,
    })
  })
})
