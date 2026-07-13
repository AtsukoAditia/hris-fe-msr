import api from '../lib/axios'

const blobConfig = { responseType: 'blob' }

const payrollService = {
  listSalaryComponents: (params = {}) => api.get('/admin/salary-components', { params }),
  createSalaryComponent: (data) => api.post('/admin/salary-components', data),
  updateSalaryComponent: (id, data) => api.put(`/admin/salary-components/${id}`, data),
  deleteSalaryComponent: (id) => api.delete(`/admin/salary-components/${id}`),

  listSalaryProfiles: (employeeId) => api.get(`/admin/employees/${employeeId}/salary-profiles`),
  createSalaryProfile: (employeeId, data) => api.post(`/admin/employees/${employeeId}/salary-profiles`, data),
  updateSalaryProfile: (id, data) => api.put(`/admin/salary-profiles/${id}`, data),
  deleteSalaryProfile: (id) => api.delete(`/admin/salary-profiles/${id}`),

  listPayrollPeriods: (params = {}) => api.get('/admin/payroll-periods', { params }),
  createPayrollPeriod: (data) => api.post('/admin/payroll-periods', data),
  updatePayrollPeriod: (id, data) => api.put(`/admin/payroll-periods/${id}`, data),
  deletePayrollPeriod: (id) => api.delete(`/admin/payroll-periods/${id}`),
  lockPayrollPeriod: (id) => api.post(`/admin/payroll-periods/${id}/lock`),
  unlockPayrollPeriod: (id) => api.post(`/admin/payroll-periods/${id}/unlock`),
  generatePayroll: (periodId, employeeIds = []) => api.post(
    `/admin/payroll-periods/${periodId}/generate`,
    employeeIds.length ? { employee_ids: employeeIds } : {},
  ),

  listPayrolls: (params = {}) => api.get('/admin/payrolls', { params }),
  getPayroll: (id) => api.get(`/admin/payrolls/${id}`),
  recalculatePayroll: (id) => api.post(`/admin/payrolls/${id}/recalculate`),
  reviewPayroll: (id) => api.post(`/admin/payrolls/${id}/review`),
  finalizePayroll: (id) => api.post(`/admin/payrolls/${id}/finalize`),
  markPayrollPaid: (id) => api.post(`/admin/payrolls/${id}/paid`),
  cancelPayroll: (id, reason) => api.post(`/admin/payrolls/${id}/cancel`, { reason }),
  submitPayroll: (id) => api.post(`/admin/payrolls/${id}/submit`),
  approvePayroll: (id) => api.post(`/admin/payrolls/${id}/approve`),
  simulatePayroll: (data) => api.post('/admin/payrolls/simulate', data),

  listAdjustments: (payrollId) => api.get(`/admin/payrolls/${payrollId}/adjustments`),
  addAdjustment: (payrollId, data) => api.post(`/admin/payrolls/${payrollId}/adjustments`, data),
  deleteAdjustment: (id) => api.delete(`/admin/adjustments/${id}`),

  listMyPayslips: (params = {}) => api.get('/payslips', { params }),
  getMyPayslip: (id) => api.get(`/payslips/${id}`),
  downloadMyPayslip: (id) => api.get(`/payslips/${id}/download`, blobConfig),

  getPayrollReportSummary: (params = {}) => api.get('/admin/payroll-reports/summary', { params }),
  exportPayrollReport: (format, params = {}) => api.get('/admin/payroll-reports/export', {
    params: { ...params, format },
    ...blobConfig,
  }),
  downloadAdminPayslip: (id) => api.get(`/admin/payrolls/${id}/payslip/download`, blobConfig),
}

export default payrollService
