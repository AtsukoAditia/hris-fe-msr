import api from '../lib/axios'

const overtimeService = {
  listActivePolicies: (params = {}) => api.get('/overtime-policies', { params }),
  listPolicies: (params = {}) => api.get('/admin/overtime-policies', { params }),
  createPolicy: (payload) => api.post('/admin/overtime-policies', payload),
  updatePolicy: (id, payload) => api.put(`/admin/overtime-policies/${id}`, payload),
  deletePolicy: (id) => api.delete(`/admin/overtime-policies/${id}`),

  listMine: (params = {}) => api.get('/overtime-requests/my', { params }),
  listForReview: (params = {}) => api.get('/overtime-requests', { params }),
  get: (id) => api.get(`/overtime-requests/${id}`),
  create: (payload) => api.post('/overtime-requests', {
    overtime_policy_id: Number(payload.overtime_policy_id),
    overtime_date: payload.overtime_date,
    planned_start_time: payload.planned_start_time,
    planned_end_time: payload.planned_end_time,
    reason: payload.reason,
    attachment: payload.attachment || undefined,
  }),
  cancel: (id) => api.post(`/overtime-requests/${id}/cancel`),
  approve: (id) => api.post(`/overtime-requests/${id}/approve`),
  reject: (id, rejectionReason) => api.post(`/overtime-requests/${id}/reject`, {
    rejection_reason: rejectionReason,
  }),
  recordActual: (id, actualMinutes) => api.post(`/overtime-requests/${id}/record-actual`, {
    actual_minutes: Number(actualMinutes),
  }),
}

export default overtimeService
