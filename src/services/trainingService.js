import api from '../lib/axios'

const trainingService = {
  list: (params = {}) => api.get('/training', { params }),
  get: (id) => api.get(`/training/${id}`),
  create: (data) => api.post('/training', data),
  update: (id, data) => api.put(`/training/${id}`, data),
  delete: (id) => api.delete(`/training/${id}`),
  publish: (id) => api.post(`/training/${id}/publish`),
  enroll: (id) => api.post(`/training/${id}/enroll`),
  cancelEnrollment: (id, enrollmentId) => api.post(`/training/${id}/enrollment/${enrollmentId}/cancel`),
  myEnrollments: (params = {}) => api.get('/training/my-enrollments', { params }),
  getEnrollments: (id) => api.get(`/training/${id}/enrollments`),
}

export default trainingService
