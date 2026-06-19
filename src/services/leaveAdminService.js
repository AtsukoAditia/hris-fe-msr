import api from '../lib/axios'

const leaveAdminService = {
  // Leave Types
  getLeaveTypes: (params = {}) => api.get('/admin/leave-types', { params }),
  createLeaveType: (data) => api.post('/admin/leave-types', data),
  getLeaveType: (id) => api.get(`/admin/leave-types/${id}`),
  updateLeaveType: (id, data) => api.put(`/admin/leave-types/${id}`, data),
  deleteLeaveType: (id) => api.delete(`/admin/leave-types/${id}`),

  // Leave Policies
  getLeavePolicies: (params = {}) => api.get('/admin/leave-policies', { params }),
  createLeavePolicy: (data) => api.post('/admin/leave-policies', data),
  getLeavePolicy: (id) => api.get(`/admin/leave-policies/${id}`),
  updateLeavePolicy: (id, data) => api.put(`/admin/leave-policies/${id}`, data),
  deleteLeavePolicy: (id) => api.delete(`/admin/leave-policies/${id}`),

  // Holidays
  getHolidays: (params = {}) => api.get('/admin/holidays', { params }),
  createHoliday: (data) => api.post('/admin/holidays', data),
  getHoliday: (id) => api.get(`/admin/holidays/${id}`),
  updateHoliday: (id, data) => api.put(`/admin/holidays/${id}`, data),
  deleteHoliday: (id) => api.delete(`/admin/holidays/${id}`),

  // Employees (for balance filters/forms)
  getEmployees: (params = {}) => api.get('/employees', { params }),

  // Leave Balances
  getLeaveBalances: (params = {}) => api.get('/admin/leave-balances', { params }),
  createLeaveBalance: (data) => api.post('/admin/leave-balances', data),
  getLeaveBalance: (id) => api.get(`/admin/leave-balances/${id}`),
  updateLeaveBalance: (id, data) => api.put(`/admin/leave-balances/${id}`, data),
  deleteLeaveBalance: (id) => api.delete(`/admin/leave-balances/${id}`),
  adjustLeaveBalance: (data) => api.post('/admin/leave-balances/adjust', data),
}

export default leaveAdminService