export const normalizeRows = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const normalizePagination = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response
  const meta = response?.data?.meta ?? payload?.meta ?? payload

  return {
    current_page: Number(meta?.current_page || 1),
    last_page: Number(meta?.last_page || 1),
    per_page: Number(meta?.per_page || 15),
    total: Number(meta?.total || normalizeRows(response).length),
  }
}

export const getErrorMessage = (error, fallback = 'Terjadi kesalahan.') => (
  error?.response?.data?.message || error?.message || fallback
)

export const getValidationErrors = (error) => error?.response?.data?.errors || {}

export const formatCurrency = (value, currency = 'IDR') => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0)
}

export const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

export const statusClass = (status) => ({
  draft: 'bg-gray-100 text-gray-700',
  reviewed: 'bg-blue-100 text-blue-700',
  finalized: 'bg-purple-100 text-purple-700',
  paid: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
}[status] || 'bg-gray-100 text-gray-700')

export const salaryComponentInitial = {
  code: '',
  name: '',
  type: 'earning',
  calculation_type: 'fixed',
  default_amount: '',
  percentage: '',
  formula: '',
  description: '',
  is_active: true,
}

export const mapSalaryComponentPayload = (form) => ({
  code: form.code.trim().toUpperCase(),
  name: form.name.trim(),
  type: form.type,
  calculation_type: form.calculation_type,
  default_amount: form.default_amount === '' ? 0 : Number(form.default_amount),
  percentage: form.calculation_type === 'percentage' && form.percentage !== '' ? Number(form.percentage) : null,
  formula: form.calculation_type === 'formula' ? form.formula.trim() || null : null,
  description: form.description.trim() || null,
  is_active: Boolean(form.is_active),
})

export const payrollPeriodInitial = {
  name: '',
  start_date: '',
  end_date: '',
  cutoff_start_date: '',
  cutoff_end_date: '',
  status: 'open',
}

export const salaryProfileInitial = {
  basic_salary: '',
  currency: 'IDR',
  effective_from: '',
  effective_to: '',
  is_active: true,
  notes: '',
  components: [],
}

export const mapSalaryProfilePayload = (form) => ({
  basic_salary: Number(form.basic_salary || 0),
  currency: form.currency.trim().toUpperCase(),
  effective_from: form.effective_from,
  effective_to: form.effective_to || null,
  is_active: Boolean(form.is_active),
  notes: form.notes.trim() || null,
  components: form.components.map((item) => ({
    salary_component_id: Number(item.salary_component_id),
    amount: item.amount === '' || item.amount == null ? null : Number(item.amount),
    percentage: item.percentage === '' || item.percentage == null ? null : Number(item.percentage),
    formula: item.formula?.trim() || null,
  })),
})

export const nextPayrollActions = (status) => ({
  canRecalculate: status === 'draft',
  canReview: status === 'draft',
  canFinalize: status === 'reviewed',
  canMarkPaid: status === 'finalized',
  canCancel: ['draft', 'reviewed', 'finalized'].includes(status),
})
