import { describe, expect, it, vi } from 'vitest'
import {
  buildFilterParams,
  downloadBlobResponse,
  extractApiErrorMessage,
  formatFileSize,
  mapMetadataPayload,
  normalizeCategories,
  normalizeDocumentDetail,
  normalizeDocumentList,
  normalizeSummary,
  statusMeta,
  toDocumentForm,
  toUploadFormData,
  validateDocumentFile,
} from './document.helpers'

describe('document helpers', () => {
  it('normalizes paginated, detail, summary, and category responses', () => {
    const list = normalizeDocumentList({ data: { data: {
      data: [{ id: 1, title: 'Contract' }],
      current_page: 2,
      last_page: 3,
      per_page: 15,
      total: 31,
    } } })

    expect(list.items).toEqual([{ id: 1, title: 'Contract' }])
    expect(list.pagination).toEqual({ current_page: 2, last_page: 3, per_page: 15, total: 31 })
    expect(normalizeDocumentDetail({ data: { data: { id: 1, title: 'Contract' } } })).toEqual({ id: 1, title: 'Contract' })
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

  it('formats document fields and expiry filters', () => {
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

  it('matches backend file type and 10 MB constraints', () => {
    expect(validateDocumentFile(null)).toBe('File dokumen wajib dipilih.')
    expect(validateDocumentFile(new File(['pdf'], 'contract.pdf', { type: 'application/pdf' }))).toBe('')
    expect(validateDocumentFile(new File(['pdf'], 'contract.pdf', { type: '' }))).toBe('')
    expect(validateDocumentFile(new File(['exe'], 'payload.exe', { type: 'application/octet-stream' }))).toContain('Format file')

    const oversized = new File([new Uint8Array(10 * 1024 * 1024 + 1)], 'large.pdf', { type: 'application/pdf' })
    expect(validateDocumentFile(oversized)).toBe('Ukuran file maksimal 10 MB.')
  })

  it('downloads blob responses using the exposed server filename', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
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
    click.mockRestore()
  })

  it('extracts backend messages from failed blob downloads', async () => {
    const message = await extractApiErrorMessage({
      response: {
        data: new Blob([JSON.stringify({ message: 'File dokumen tidak ditemukan di penyimpanan.' })], { type: 'application/json' }),
      },
    }, 'Fallback')

    expect(message).toBe('File dokumen tidak ditemukan di penyimpanan.')
    await expect(extractApiErrorMessage({ response: { data: new Blob(['not-json']) } }, 'Fallback')).resolves.toBe('Fallback')
  })
})
