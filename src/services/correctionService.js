import api from '../lib/axios'

const correctionService = {
  listMine: (params = {}) => api.get('/attendance-corrections/my', { params }),
  create: (data) => api.post('/attendance-corrections', data),
  getMine: (id) => api.get(`/attendance-corrections/${id}`),
  cancel: (id) => api.post(`/attendance-corrections/${id}/cancel`),
  downloadAttachment: (id) => api.get(`/attendance-corrections/${id}/attachment`, { responseType: 'blob' }),

  listReviews: (params = {}) => api.get('/attendance-corrections', { params }),
  getReview: (id) => api.get(`/attendance-corrections/${id}`),
  approve: (id, data = {}) => api.post(`/attendance-corrections/${id}/approve`, data),
  reject: (id, data) => api.post(`/attendance-corrections/${id}/reject`, data),
  manualCorrection: (data) => api.post('/attendance-corrections/manual', data),
}

export default correctionService