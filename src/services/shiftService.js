import api from '../lib/axios';

const shiftService = {
  // ==================== SHIFT TYPES ====================
  getAll: (params = {}) => api.get('/shifts', { params }),
  getOne: (id) => api.get(`/shifts/${id}`),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  remove: (id) => api.delete(`/shifts/${id}`),

  // ==================== SHIFT SCHEDULES ====================
  getSchedules: (params = {}) => api.get('/shift-schedules', { params }),
  getMySchedule: (params = {}) => api.get('/shift-schedules/my', { params }),
  assignShift: (data) => api.post('/shift-schedules', data),
  removeSchedule: (id) => api.delete(`/shift-schedules/${id}`),
};

export default shiftService;
