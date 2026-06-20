import api from '../lib/axios'

export const extractCollectionRows = (response) => {
  const payload = response?.data?.data

  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data

  return []
}

const normalizeCollectionResponse = (response, mapper = (item) => item) => ({
  ...response,
  data: {
    ...response?.data,
    data: extractCollectionRows(response).map(mapper),
  },
})

export const normalizeLeaveBalance = (item = {}) => ({
  ...item,
  employee: item.employee
    ? {
        ...item.employee,
        user: item.employee.user || {
          name: item.employee.full_name || `Employee #${item.employee_id}`,
          email: item.employee.email || '',
        },
      }
    : item.employee,
  total_entitled: Number(item.total_entitled ?? item.total_days ?? item.opening_days ?? 0),
  total_used: Number(item.total_used ?? item.used_days ?? 0),
  total_pending: Number(item.total_pending ?? item.pending_days ?? item.remaining_days ?? 0),
  carried_forward: Number(item.carried_forward ?? 0),
})

export const mapLeaveBalanceCreatePayload = (data) => ({
  employee_id: Number(data.employee_id),
  leave_type_id: Number(data.leave_type_id),
  year: Number(data.year),
  total_days: Number(data.total_entitled ?? data.total_days ?? 0),
  used_days: Number(data.total_used ?? data.used_days ?? 0),
})

export const mapLeaveBalanceUpdatePayload = (data) => ({
  total_days: Number(data.total_entitled ?? data.total_days ?? 0),
  used_days: Number(data.total_used ?? data.used_days ?? 0),
  remaining_days: Number(data.total_pending ?? data.remaining_days ?? 0),
})

const getBalanceId = async (data) => {
  if (data.leave_balance_id) return Number(data.leave_balance_id)

  const response = await api.get('/admin/leave-balances', {
    params: {
      employee_id: data.employee_id,
      leave_type_id: data.leave_type_id,
      year: data.year,
    },
  })
  const balance = extractCollectionRows(response)[0]

  if (!balance?.id) {
    throw new Error('Leave balance tidak ditemukan untuk penyesuaian.')
  }

  return Number(balance.id)
}

const leaveAdminService = {
  // Leave Types
  getLeaveTypes: async (params = {}) => normalizeCollectionResponse(await api.get('/admin/leave-types', { params })),
  createLeaveType: (data) => api.post('/admin/leave-types', data),
  getLeaveType: (id) => api.get(`/admin/leave-types/${id}`),
  updateLeaveType: (id, data) => api.put(`/admin/leave-types/${id}`, data),
  deleteLeaveType: (id) => api.delete(`/admin/leave-types/${id}`),

  // Leave Policies
  getLeavePolicies: async (params = {}) => normalizeCollectionResponse(await api.get('/admin/leave-policies', { params })),
  createLeavePolicy: (data) => api.post('/admin/leave-policies', data),
  getLeavePolicy: (id) => api.get(`/admin/leave-policies/${id}`),
  updateLeavePolicy: (id, data) => api.put(`/admin/leave-policies/${id}`, data),
  deleteLeavePolicy: (id) => api.delete(`/admin/leave-policies/${id}`),

  // Holidays
  getHolidays: async (params = {}) => normalizeCollectionResponse(await api.get('/admin/holidays', { params })),
  createHoliday: (data) => api.post('/admin/holidays', data),
  getHoliday: (id) => api.get(`/admin/holidays/${id}`),
  updateHoliday: (id, data) => api.put(`/admin/holidays/${id}`, data),
  deleteHoliday: (id) => api.delete(`/admin/holidays/${id}`),

  // Employees (for balance filters/forms)
  getEmployees: async (params = {}) => normalizeCollectionResponse(await api.get('/employees', { params })),

  // Leave Balances
  getLeaveBalances: async (params = {}) => normalizeCollectionResponse(
    await api.get('/admin/leave-balances', { params }),
    normalizeLeaveBalance,
  ),
  createLeaveBalance: (data) => api.post('/admin/leave-balances', mapLeaveBalanceCreatePayload(data)),
  getLeaveBalance: (id) => api.get(`/admin/leave-balances/${id}`),
  updateLeaveBalance: (id, data) => api.put(`/admin/leave-balances/${id}`, mapLeaveBalanceUpdatePayload(data)),
  deleteLeaveBalance: (id) => api.delete(`/admin/leave-balances/${id}`),
  adjustLeaveBalance: async (data) => api.post('/admin/leave-balances/adjust', {
    leave_balance_id: await getBalanceId(data),
    adjustment_days: Number(data.adjustment ?? data.adjustment_days),
    reason: data.note?.trim() || data.reason?.trim() || 'Manual leave balance adjustment',
  }),
}

export default leaveAdminService
