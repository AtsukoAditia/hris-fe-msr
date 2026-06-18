import api from '../lib/axios'

const profileChangeService = {
  listMine: (params = {}) => api.get('/profile/change-requests', { params }),
  create: (data) => api.post('/profile/change-requests', data),
  getMine: (id) => api.get(`/profile/change-requests/${id}`),
  cancel: (id) => api.delete(`/profile/change-requests/${id}`),

  listReviews: (params = {}) => api.get('/profile-change-requests', { params }),
  getReview: (id) => api.get(`/profile-change-requests/${id}`),
  approve: (id, data = {}) => api.post(`/profile-change-requests/${id}/approve`, data),
  reject: (id, data) => api.post(`/profile-change-requests/${id}/reject`, data),
}

export default profileChangeService
