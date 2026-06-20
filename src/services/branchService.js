import api from '../lib/axios'
import { normalizeQueryParams } from './queryParams'

const branchService = {
  getAll: (params = {}) => api.get('/branches', { params: normalizeQueryParams(params) }),
  getById: (id) => api.get(`/branches/${id}`),
  create: (data) => api.post('/branches', data),
  update: (id, data) => api.put(`/branches/${id}`, data),
  delete: (id) => api.delete(`/branches/${id}`),
}

export default branchService
