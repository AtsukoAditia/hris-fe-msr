import api from '../lib/axios';

const shiftScheduleService = {
  // List schedules with filters
  list(params = {}) {
    return api.get('/shift-schedules', { params });
  },

  // Calendar view - optimized for calendar components
  calendar(params) {
    return api.get('/shift-schedules', {
      params: {
        ...params,
        start_date: params.start_date,
        end_date: params.end_date,
      },
    });
  },

  // My schedule (employee self-service)
  mySchedule(params = {}) {
    return api.get('/shift-schedules/my-schedule', { params });
  },

  // Team schedule (manager view)
  teamSchedule(params = {}) {
    return api.get('/shift-schedules/team-schedule', { params });
  },

  // Single schedule CRUD
  show(id) {
    return api.get(`/shift-schedules/${id}`);
  },

  store(data) {
    return api.post('/shift-schedules', data);
  },

  update(id, data) {
    return api.put(`/shift-schedules/${id}`, data);
  },

  destroy(id) {
    return api.delete(`/shift-schedules/${id}`);
  },

  // Bulk assign
  bulkAssign(data) {
    return api.post('/shift-schedules/bulk', data);
  },

  // Copy week
  copyWeek(data) {
    return api.post('/shift-schedules/copy-week', data);
  },

  // Rotating shifts
  rotating(data) {
    return api.post('/shift-schedules/rotating', data);
  },

  // Get by employee
  getByEmployee(employeeId) {
    return api.get(`/shift-schedules/employee/${employeeId}`);
  },

  // Get by date
  getByDate(date) {
    return api.get(`/shift-schedules/date/${date}`);
  },

  // Helper: List shifts
  listShifts() {
    return api.get('/shifts');
  },

  // Helper: List departments
  listDepartments() {
    return api.get('/departments');
  },

  // Conflict validation
  validateConflicts(data) {
    return api.post('/shift-schedules/validate-conflicts', data);
  },

  // Publish / Unpublish
  publishSchedule(id) {
    return api.post(`/shift-schedules/${id}/publish`);
  },

  unpublishSchedule(id) {
    return api.post(`/shift-schedules/${id}/unpublish`);
  },

  // Shift swap requests
  listSwapRequests(params = {}) {
    return api.get('/shift-swap-requests', { params });
  },

  mySwapRequests(params = {}) {
    return api.get('/shift-swap-requests/my', { params });
  },

  incomingSwapRequests(params = {}) {
    return api.get('/shift-swap-requests/incoming', { params });
  },

  createSwapRequest(data) {
    return api.post('/shift-swap-requests', data);
  },

  approveSwap(id, data = {}) {
    return api.post(`/shift-swap-requests/${id}/approve`, data);
  },

  rejectSwap(id, data = {}) {
    return api.post(`/shift-swap-requests/${id}/reject`, data);
  },

  cancelSwap(id) {
    return api.post(`/shift-swap-requests/${id}/cancel`);
  },
};

export default shiftScheduleService;
