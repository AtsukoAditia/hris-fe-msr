import api from '../lib/axios';

const leaveService = {
  // Get all leave requests
  getAll: (params = {}) => api.get('/leaves', { params }),

  // Get leave by ID
  getById: (id) => api.get(`/leaves/${id}`),

  // Create leave request
  create: (data) => api.post('/leaves', data),

  // Update leave request
  update: (id, data) => api.put(`/leaves/${id}`, data),

  // Cancel leave request
  cancel: (id) => api.put(`/leaves/${id}/cancel`),

  // Approve leave request (manager/admin)
  approve: (id, data) => api.put(`/leaves/${id}/approve`, data),

  // Reject leave request (manager/admin)
  reject: (id, data) => api.put(`/leaves/${id}/reject`, data),

  // Get leave types
  getTypes: () => api.get('/leave-types'),

  // Get leave balance
  getBalance: (employeeId) => api.get(`/leaves/balance/${employeeId}`),

  // Get leave history
  getHistory: (params = {}) => api.get('/leaves/history', { params }),
};

export default leaveService;
