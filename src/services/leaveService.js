import api from '../lib/axios'

const leaveService = {
  getLeaveTypes: async (params = {}) => {
    const response = await api.get('/leave-types', { params })
    const rows = response.data?.data?.data ?? response.data?.data ?? []
    const options = rows.map((item) => ({
      ...item,
      value: String(item.id),
      label: item.name,
    }))

    return { ...response, data: { ...response.data, data: options } }
  },

  listMine: (params = {}) => api.get('/leaves/my', { params }),

  create: (data) => api.post('/leaves', {
    leave_type_id: Number(data.leave_type_id ?? data.leave_type),
    start_date: data.start_date,
    end_date: data.end_date,
    reason: data.reason,
  }),

  getMine: (id) => api.get(`/leaves/${id}`),
  cancel: (id) => api.delete(`/leaves/${id}`),

  getBalance: async (params = {}) => {
    const response = await api.get('/leaves/balance', { params })
    const payload = response.data?.data
    const balances = Array.isArray(payload?.balances) ? payload.balances : []
    const summary = balances.reduce((result, item) => ({
      ...result,
      total: result.total + Number(item.total || 0),
      used: result.used + Number(item.used || 0),
      remaining: result.remaining + Number(item.remaining || 0),
    }), { total: 0, used: 0, remaining: 0, year: payload?.year })

    return balances.length > 0
      ? { ...response, data: { ...response.data, data: summary } }
      : response
  },
}

export default leaveService
