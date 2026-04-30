import api from '../lib/axios';

const shiftScheduleService = {
  // Get all shift schedules with optional filters
  getAll: async (params = {}) => {
    const response = await api.get('/shift-schedules', { params });
    return response.data;
  },

  // Get single shift schedule by ID
  getById: async (id) => {
    const response = await api.get(`/shift-schedules/${id}`);
    return response.data;
  },

  // Get shift schedules by employee
  getByEmployee: async (employeeId) => {
    const response = await api.get(`/shift-schedules/employee/${employeeId}`);
    return response.data;
  },

  // Get shift schedules by date
  getByDate: async (date) => {
    const response = await api.get(`/shift-schedules/date/${date}`);
    return response.data;
  },

  // Create single shift schedule
  create: async (data) => {
    const response = await api.post('/shift-schedules', data);
    return response.data;
  },

  // Create multiple shift schedules
  bulkCreate: async (schedules) => {
    const response = await api.post('/shift-schedules/bulk', { schedules });
    return response.data;
  },

  // Update shift schedule
  update: async (id, data) => {
    const response = await api.put(`/shift-schedules/${id}`, data);
    return response.data;
  },

  // Delete shift schedule
  remove: async (id) => {
    const response = await api.delete(`/shift-schedules/${id}`);
    return response.data;
  },
};

export default shiftScheduleService;
