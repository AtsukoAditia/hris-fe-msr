export const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
}

export const STATUS_LABEL = {
  pending: 'Menunggu',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  cancelled: 'Dibatalkan',
}

export const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

export const getPaginationMeta = (payload) => {
  const source = payload?.meta || payload?.data?.meta || payload?.data || {}
  return {
    currentPage: Number(source.current_page || 1),
    lastPage: Number(source.last_page || 1),
    total: Number(source.total || 0),
  }
}

export const calculateMinutes = (start, end) => {
  if (!start || !end) return 0
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  if ([startHour, startMinute, endHour, endMinute].some(Number.isNaN)) return 0

  const startValue = startHour * 60 + startMinute
  let endValue = endHour * 60 + endMinute
  if (endValue <= startValue) endValue += 24 * 60
  return endValue - startValue
}

export const formatMinutes = (minutes) => {
  const value = Number(minutes || 0)
  const hours = Math.floor(value / 60)
  const remainder = value % 60
  if (hours === 0) return `${remainder} menit`
  if (remainder === 0) return `${hours} jam`
  return `${hours} jam ${remainder} menit`
}

export const formatDate = (value) => {
  if (!value) return '-'
  return new Date(`${value}`.slice(0, 10) + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateTime = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getErrorMessage = (error, fallback = 'Terjadi kesalahan.') => {
  const errors = error?.response?.data?.errors
  if (errors) {
    const firstKey = Object.keys(errors)[0]
    const firstMessage = errors[firstKey]?.[0]
    if (firstMessage) return firstMessage
  }
  return error?.response?.data?.message || fallback
}

export const emptyRequestForm = {
  overtime_policy_id: '',
  overtime_date: '',
  planned_start_time: '',
  planned_end_time: '',
  reason: '',
}

export const emptyPolicyForm = {
  name: '',
  description: '',
  daily_max_minutes: 180,
  weekly_max_minutes: 900,
  rate_multiplier: 1.5,
  is_active: true,
}
