import api from '../lib/axios';

const leaveService = {
  // Get my own leave requests (employee)
  getMyLeaves: (params = {}) => api.get('/leaves/my', { params }),

  // Get all leave requests (admin/hr/manager)
  getAll: (params = {}) => api.get('/leaves', { params }),

  // Get leave by ID
  getById: (id) => api.get(`/leaves/${id}`),

  // Create leave request
  create: (data) => api.post('/leaves', data),

  // Approve leave request (manager/admin) - POST
  approve: (id, data) => api.post(`/leaves/${id}/approve`, data),

  // Reject leave request (manager/admin) - POST
  reject: (id, data) => api.post(`/leaves/${id}/reject`, data),

  // Get leave balance (employee's own balance)
  getBalance: () => api.get('/leaves/balance'),
};

export default leaveService;
