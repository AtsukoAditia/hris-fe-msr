import api from '../lib/axios'

const reportService = {
  getAttendanceReport: (params = {}) => api.get('/reports/attendance', { params }),
  getLeaveReport: (params = {}) => api.get('/reports/leave', { params }),
  getEmployeeReport: (params = {}) => api.get('/reports/employee', { params }),

  exportReport: (type, params = {}) => api.get('/reports/export', {
    params: { ...params, type, format: 'csv' },
    responseType: 'blob',
  }),

  exportAttendance: (params = {}) => reportService.exportReport('attendance', params),
  exportLeave: (params = {}) => reportService.exportReport('leave', params),
  exportEmployee: (params = {}) => reportService.exportReport('employee', params),
}

export default reportService
