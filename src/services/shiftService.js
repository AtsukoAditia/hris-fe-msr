import api from '../lib/axios';

const shiftService = {
  // Get all shifts
  getAll: (params = {}) => api.get('/shifts', { params }),

  // Get shift by ID
  getById: (id) => api.get(`/shifts/${id}`),

  // Create shift (admin only)
  create: (data) => api.post('/shifts', data),

  // Update shift (admin only)
  update: (id, data) => api.put(`/shifts/${id}`, data),

  // Delete shift (admin only)
  delete: (id) => api.delete(`/shifts/${id}`),

  // Assign shift to employee
  assignToEmployee: (data) => api.post('/shift-assignments', data),

  // Get shift assignments
  getAssignments: (params = {}) => api.get('/shift-assignments', { params }),

  // Get employee shift schedule
  getEmployeeSchedule: (employeeId, params = {}) =>
    api.get(`/shift-assignments/employee/${employeeId}`, { params }),
};

export default shiftService;
