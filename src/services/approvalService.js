import api from '../lib/axios';

const approvalService = {
  // Get all pending approvals
  getPending: (params = {}) => api.get('/approvals/pending', { params }),

  // Get all approvals (with filters)
  getAll: (params = {}) => api.get('/approvals', { params }),

  // Get approval by ID
  getById: (id) => api.get(`/approvals/${id}`),

  // Approve a request
  approve: (id, data = {}) => api.put(`/approvals/${id}/approve`, data),

  // Reject a request
  reject: (id, data) => api.put(`/approvals/${id}/reject`, data),

  // Get approval history
  getHistory: (params = {}) => api.get('/approvals/history', { params }),

  // Get overtime requests pending approval
  getOvertimePending: (params = {}) => api.get('/approvals/overtime', { params }),

  // Approve overtime
  approveOvertime: (id, data = {}) => api.put(`/approvals/overtime/${id}/approve`, data),

  // Reject overtime
  rejectOvertime: (id, data) => api.put(`/approvals/overtime/${id}/reject`, data),
};

export default approvalService;
