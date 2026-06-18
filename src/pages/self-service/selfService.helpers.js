export const DIRECT_SELF_SERVICE_FIELDS = [
  'phone',
  'address',
  'personal_email',
  'alternate_phone',
  'domicile_address',
  'city',
  'province',
  'postal_code',
]

export const APPROVAL_REQUIRED_FIELDS = [
  'birth_date',
  'gender',
  'place_of_birth',
  'marital_status',
  'blood_type',
  'religion',
  'nationality',
  'identity_address',
  'tax_number',
  'social_security_number',
  'health_insurance_number',
]

export const FIELD_LABELS = {
  phone: 'Nomor Telepon',
  address: 'Alamat Singkat',
  personal_email: 'Email Pribadi',
  alternate_phone: 'Telepon Alternatif',
  domicile_address: 'Alamat Domisili',
  city: 'Kota / Kabupaten',
  province: 'Provinsi',
  postal_code: 'Kode Pos',
  birth_date: 'Tanggal Lahir',
  gender: 'Jenis Kelamin',
  place_of_birth: 'Tempat Lahir',
  marital_status: 'Status Pernikahan',
  blood_type: 'Golongan Darah',
  religion: 'Agama',
  nationality: 'Kewarganegaraan',
  identity_address: 'Alamat Identitas',
  tax_number: 'Nomor Pajak / NPWP',
  social_security_number: 'Nomor Jaminan Sosial',
  health_insurance_number: 'Nomor Jaminan Kesehatan',
}

export const STATUS_LABELS = {
  pending: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
}

export const STATUS_BADGES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
}

export const initialPasswordForm = {
  current_password: '',
  password: '',
  password_confirmation: '',
}

export const initialRequestForm = {
  field: 'birth_date',
  value: '',
  reason: '',
}

export const initialRequestFilters = {
  status: '',
  search: '',
  date_from: '',
  date_to: '',
  sort: 'newest',
}

export const normalizeListResponse = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response ?? {}

  if (Array.isArray(payload)) {
    return { items: payload, pagination: null }
  }

  return {
    items: Array.isArray(payload.data) ? payload.data : [],
    pagination: payload.current_page
      ? {
          current_page: payload.current_page,
          last_page: payload.last_page,
          total: payload.total,
        }
      : null,
  }
}

export const normalizeDetailResponse = (response) => response?.data?.data ?? response?.data ?? response ?? null

const nullableValue = (value) => {
  const normalized = String(value ?? '').trim()
  return normalized === '' ? null : normalized
}

export const buildChangeRequestPayload = (form) => ({
  changes: {
    [form.field]: nullableValue(form.value),
  },
  reason: String(form.reason || '').trim(),
})

export const buildFilterParams = (filters, page = 1) => {
  const params = { page, per_page: 10 }

  Object.entries(filters).forEach(([key, value]) => {
    const normalized = String(value ?? '').trim()
    if (normalized) params[key] = normalized
  })

  return params
}

export const formatFieldValue = (value) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

export const fieldError = (errors, field) => errors?.[field]?.[0] || errors?.[field]

export const changeFieldError = (errors, field) => (
  errors?.[`changes.${field}`]?.[0]
  || errors?.[`changes.${field}`]
  || errors?.changes?.[0]
  || errors?.changes
)
