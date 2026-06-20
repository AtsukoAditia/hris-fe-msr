import api from '../lib/axios'

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
}

export default payrollService
