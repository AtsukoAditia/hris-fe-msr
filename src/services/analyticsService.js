import api from '../lib/axios'

const analyticsService = {
  executiveSummary: () => api.get('/analytics/executive-summary'),
  departmentCosts: (params = {}) => api.get('/analytics/department-costs', { params }),
  attendanceSummary: (params = {}) => api.get('/analytics/attendance-summary', { params }),
  headcount: () => api.get('/analytics/headcount'),
}

export default analyticsService
