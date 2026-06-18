import api from '../lib/axios'

const profileChangeRequestService = {
  getMine: (params = {}) => api.get('/profile/change-requests', { params }),
  createMine: (data) => api.post('/profile/change-requests', data),
  getMineDetail: (id) => api.get(`/profile/change-requests/${id}`),
  cancelMine: (id) => api.delete(`/profile/change-requests/${id}`),

  getReviewList: (params = {}) => api.get('/profile-change-requests', { params }),
  getReviewDetail: (id) => api.get(`/profile-change-requests/${id}`),
  approve: (id, data = {}) => api.post(`/profile-change-requests/${id}/approve`, data),
  reject: (id, data = {}) => api.post(`/profile-change-requests/${id}/reject`, data),
}

export default profileChangeRequestService
