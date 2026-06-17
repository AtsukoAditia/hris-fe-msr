import api from '../lib/axios'

const profileService = {
  getMine: () => api.get('/profile/me'),
  updateMine: (data) => api.patch('/profile/me', data),
  getByEmployee: (employeeId) => api.get(`/employees/${employeeId}/profile`),
  updateByEmployee: (employeeId, data) => api.patch(`/employees/${employeeId}/profile`, data),

  getMineContacts: () => api.get('/profile/me/emergency-contacts'),
  createMineContact: (data) => api.post('/profile/me/emergency-contacts', data),
  updateMineContact: (contactId, data) => api.patch(`/profile/me/emergency-contacts/${contactId}`, data),
  deleteMineContact: (contactId) => api.delete(`/profile/me/emergency-contacts/${contactId}`),

  getEmployeeContacts: (employeeId) => api.get(`/employees/${employeeId}/emergency-contacts`),
  createEmployeeContact: (employeeId, data) => api.post(`/employees/${employeeId}/emergency-contacts`, data),
  updateEmployeeContact: (employeeId, contactId, data) => api.patch(`/employees/${employeeId}/emergency-contacts/${contactId}`, data),
  deleteEmployeeContact: (employeeId, contactId) => api.delete(`/employees/${employeeId}/emergency-contacts/${contactId}`),
}

export default profileService
