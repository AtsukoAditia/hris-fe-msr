import { describe, expect, it, vi } from 'vitest'
import {
  buildFilterParams,
  downloadBlobResponse,
  formatFileSize,
  mapMetadataPayload,
  normalizeCategories,
  normalizeDocumentList,
  normalizeSummary,
  statusMeta,
  toDocumentForm,
  toUploadFormData,
} from './document.helpers'

describe('document helpers', () => {
  it('normalizes paginated document and summary responses', () => {
    const list = normalizeDocumentList({ data: { data: {
      data: [{ id: 1, title: 'Contract' }],
      current_page: 2,
      last_page: 3,
      per_page: 15,
      total: 31,
    } } })

    expect(list.items).toEqual([{ id: 1, title: 'Contract' }])
    expect(list.pagination).toEqual({ current_page: 2, last_page: 3, per_page: 15, total: 31 })
    expect(normalizeSummary({ data: { data: { total: 4, expired: 1, warning_days: 60 } } })).toMatchObject({
      total: 4,
      expired: 1,
      warning_days: 60,
      valid: 0,
    })
    expect(normalizeCategories({ data: { data: [{ value: 'identity', label: 'Identitas' }] } })).toHaveLength(1)
  })

  it('maps metadata and upload form data safely', () => {
    const form = {
      category: 'employment',
      title: ' Contract ',
      description: ' ',
      labels: 'contract, permanent, contract',
      issue_date: '2026-01-01',
      expiry_date: '',
      is_confidential: false,
      file: new File(['pdf'], 'contract.pdf', { type: 'application/pdf' }),
    }

    expect(mapMetadataPayload(form)).toEqual({
      category: 'employment',
      title: 'Contract',
      description: null,
      labels: ['contract', 'permanent'],
      issue_date: '2026-01-01',
      expiry_date: null,
      is_confidential: false,
    })

    const data = toUploadFormData(form)
    expect(data.get('file').name).toBe('contract.pdf')
    expect(data.getAll('labels[]')).toEqual(['contract', 'permanent'])
    expect(data.get('is_confidential')).toBe('0')
    expect(data.has('description')).toBe(false)
  })

  it('formats document fields and filters', () => {
    expect(toDocumentForm({ labels: ['one', 'two'], is_confidential: true })).toMatchObject({ labels: 'one, two', is_confidential: true })
    expect(buildFilterParams({ search: '', category: 'identity', status: 'expired', sort: 'expiry_asc', expires_within_days: 45 }, 2)).toEqual({
      page: 2,
      category: 'identity',
      status: 'expired',
      sort: 'expiry_asc',
      expires_within_days: 45,
    })
    expect(formatFileSize(1536)).toBe('1.5 KB')
    expect(statusMeta('expiring').label).toBe('Segera Kedaluwarsa')
  })

  it('downloads blob responses using the server filename', () => {
    const click = vi.fn()
    const appendChild = vi.spyOn(document.body, 'appendChild')
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      remove: vi.fn(),
      href: '',
      download: '',
    })
    const createObjectURL = vi.fn(() => 'blob:test')
    const revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const filename = downloadBlobResponse({
      data: new Blob(['file']),
      headers: { 'content-disposition': 'attachment; filename="contract.pdf"' },
    })

    expect(filename).toBe('contract.pdf')
    expect(click).toHaveBeenCalled()
    expect(createObjectURL).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test')

    appendChild.mockRestore()
    createElement.mockRestore()
  })
})
