import api from '../lib/axios'

const leaveService = {
  // Leave Types (for employees to choose from when requesting)
  getLeaveTypes: (params = {}) => api.get('/leave-types', { params }),

  // Employee's own leave requests
  listMine: (params = {}) => api.get('/leaves/my', { params }),
  create: (data) => api.post('/leaves', data),
  getMine: (id) => api.get(`/leaves/${id}`),
  cancel: (id) => api.delete(`/leaves/${id}`),

  // Leave balance
  getBalance: (params = {}) => api.get('/leaves/balance', { params }),
}

export default leaveService