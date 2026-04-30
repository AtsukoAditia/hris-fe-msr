import api from '../lib/axios';

const approvalService = {
  // Get all pending leave requests (admin/hr/manager)
  getPending: (params = {}) => api.get('/leaves', { params: { ...params, status: 'pending' } }),

  // Get all leave requests with filters (admin/hr/manager)
  getAll: (params = {}) => api.get('/leaves', { params }),

  // Get leave by ID
  getById: (id) => api.get(`/leaves/${id}`),

  // Approve a leave request - POST
  approve: (id, data = {}) => api.post(`/leaves/${id}/approve`, data),

  // Reject a leave request - POST
  reject: (id, data) => api.post(`/leaves/${id}/reject`, data),

  // Get approval history (non-pending)
  getHistory: (params = {}) => api.get('/leaves', { params: { ...params, status: 'approved,rejected' } }),
};

export default approvalService;
