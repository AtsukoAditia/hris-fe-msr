import api from '../lib/axios'
import { normalizeQueryParams } from './queryParams'

const departmentService = {
  getAll: (params = {}) => api.get('/departments', { params: normalizeQueryParams(params) }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
}

export default departmentService
