import api from '../lib/axios'

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
}

const documentService = {
  getCategories: () => api.get('/document-categories'),

  getMine: (params) => api.get('/documents/my', { params }),
  getMineSummary: (params) => api.get('/documents/my/summary', { params }),
  getMineDetail: (documentId) => api.get(`/documents/my/${documentId}`),
  downloadMine: (documentId) => api.get(`/documents/my/${documentId}/download`, { responseType: 'blob' }),

  getAll: (params) => api.get('/employee-documents', { params }),
  getSummary: (params) => api.get('/employee-documents/summary', { params }),
  getEmployeeDocuments: (employeeId, params) => api.get(`/employees/${employeeId}/documents`, { params }),
  getEmployeeDocumentDetail: (employeeId, documentId) => api.get(`/employees/${employeeId}/documents/${documentId}`),
  uploadEmployeeDocument: (employeeId, formData) => api.post(`/employees/${employeeId}/documents`, formData, multipartConfig),
  updateEmployeeDocument: (employeeId, documentId, data) => api.patch(`/employees/${employeeId}/documents/${documentId}`, data),
  replaceEmployeeDocument: (employeeId, documentId, formData) => api.post(`/employees/${employeeId}/documents/${documentId}/replace`, formData, multipartConfig),
  deleteEmployeeDocument: (employeeId, documentId) => api.delete(`/employees/${employeeId}/documents/${documentId}`),
  downloadEmployeeDocument: (employeeId, documentId) => api.get(`/employees/${employeeId}/documents/${documentId}/download`, { responseType: 'blob' }),
}

export default documentService
