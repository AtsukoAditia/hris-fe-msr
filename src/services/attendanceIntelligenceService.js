import api from '../lib/axios';

export const attendanceIntelligenceService = {
  whoIsIn: (departmentId = null) =>
    api.get('/attendance/who-is-in', { params: departmentId ? { department_id: departmentId } : {} }),

  monthlySummary: (year, month, departmentId = null) =>
    api.get('/attendance/monthly-summary', { params: { year, month, ...(departmentId ? { department_id: departmentId } : {}) } }),

  anomalies: (months = 3) =>
    api.get('/attendance/anomalies', { params: { months } }),

  trend: (days = 30, departmentId = null) =>
    api.get('/attendance/trend', { params: { days, ...(departmentId ? { department_id: departmentId } : {}) } }),
};
