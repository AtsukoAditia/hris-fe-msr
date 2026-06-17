export const initialDocumentForm = {
  category: '',
  title: '',
  description: '',
  labels: '',
  issue_date: '',
  expiry_date: '',
  is_confidential: true,
  file: null,
}

export const initialDocumentFilters = {
  search: '',
  category: '',
  status: '',
  sort: 'newest',
  expires_within_days: 30,
}

const payload = (response) => response?.data?.data ?? response?.data ?? response ?? {}

export const normalizeDocumentList = (response) => {
  const value = payload(response)

  if (Array.isArray(value)) {
    return { items: value, pagination: null }
  }

  return {
    items: Array.isArray(value?.data) ? value.data : [],
    pagination: value && typeof value === 'object' ? {
      current_page: Number(value.current_page || 1),
      last_page: Number(value.last_page || 1),
      per_page: Number(value.per_page || 15),
      total: Number(value.total || 0),
    } : null,
  }
}

export const normalizeSummary = (response) => {
  const value = payload(response)
  return {
    total: Number(value?.total || 0),
    valid: Number(value?.valid || 0),
    expiring: Number(value?.expiring || 0),
    expired: Number(value?.expired || 0),
    without_expiry: Number(value?.without_expiry || 0),
    warning_days: Number(value?.warning_days || 30),
  }
}

export const normalizeCategories = (response) => {
  const value = payload(response)
  return Array.isArray(value) ? value : []
}

export const toDocumentForm = (document) => ({
  ...initialDocumentForm,
  category: String(document?.category ?? ''),
  title: String(document?.title ?? ''),
  description: String(document?.description ?? ''),
  labels: Array.isArray(document?.labels) ? document.labels.join(', ') : '',
  issue_date: String(document?.issue_date ?? ''),
  expiry_date: String(document?.expiry_date ?? ''),
  is_confidential: Boolean(document?.is_confidential),
})

export const mapMetadataPayload = (form) => ({
  category: form.category,
  title: String(form.title || '').trim(),
  description: nullable(form.description),
  labels: parseLabels(form.labels),
  issue_date: nullable(form.issue_date),
  expiry_date: nullable(form.expiry_date),
  is_confidential: Boolean(form.is_confidential),
})

export const toUploadFormData = (form) => {
  const data = new FormData()
  const metadata = mapMetadataPayload(form)

  if (form.file) data.append('file', form.file)
  data.append('category', metadata.category)
  data.append('title', metadata.title)
  if (metadata.description !== null) data.append('description', metadata.description)
  metadata.labels.forEach((label) => data.append('labels[]', label))
  if (metadata.issue_date !== null) data.append('issue_date', metadata.issue_date)
  if (metadata.expiry_date !== null) data.append('expiry_date', metadata.expiry_date)
  data.append('is_confidential', metadata.is_confidential ? '1' : '0')

  return data
}

export const toReplaceFormData = (file) => {
  const data = new FormData()
  if (file) data.append('file', file)
  return data
}

export const buildFilterParams = (filters, page = 1) => {
  const params = { page, expires_within_days: Number(filters.expires_within_days || 30) }
  for (const field of ['search', 'category', 'status', 'sort']) {
    if (filters[field]) params[field] = filters[field]
  }
  return params
}

export const formatFileSize = (bytes) => {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export const statusMeta = (status) => ({
  valid: { label: 'Berlaku', className: 'bg-green-100 text-green-700' },
  expiring: { label: 'Segera Kedaluwarsa', className: 'bg-amber-100 text-amber-700' },
  expired: { label: 'Kedaluwarsa', className: 'bg-red-100 text-red-700' },
  without_expiry: { label: 'Tanpa Kedaluwarsa', className: 'bg-gray-100 text-gray-700' },
}[status] || { label: status || '-', className: 'bg-gray-100 text-gray-700' })

export const downloadBlobResponse = (response, fallbackName = 'document') => {
  const disposition = response?.headers?.['content-disposition'] || response?.headers?.get?.('content-disposition') || ''
  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  const plainMatch = disposition.match(/filename="?([^";]+)"?/i)
  const filename = decodeURIComponent(encodedMatch?.[1] || plainMatch?.[1] || fallbackName)
  const blob = response?.data instanceof Blob ? response.data : new Blob([response?.data])
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return filename
}

const parseLabels = (value) => [...new Set(
  String(value || '')
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean),
)].slice(0, 10)

const nullable = (value) => {
  const trimmed = String(value ?? '').trim()
  return trimmed === '' ? null : trimmed
}
