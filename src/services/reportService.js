import api from '../lib/axios';

const reportService = {
  // Get attendance report
  getAttendanceReport: (params = {}) => api.get('/reports/attendance', { params }),

  // Get leave report
  getLeaveReport: (params = {}) => api.get('/reports/leave', { params }),

  // Get employee report
  getEmployeeReport: (params = {}) => api.get('/reports/employees', { params }),

  // Get payroll report
  getPayrollReport: (params = {}) => api.get('/reports/payroll', { params }),

  // Export report to Excel
  exportToExcel: (type, params = {}) =>
    api.get(`/reports/${type}/export`, {
      params,
      responseType: 'blob',
    }),

  // Export report to PDF
  exportToPDF: (type, params = {}) =>
    api.get(`/reports/${type}/export-pdf`, {
      params,
      responseType: 'blob',
    }),

  // Get dashboard summary stats
  getDashboardStats: () => api.get('/reports/dashboard'),
};

export default reportService;
