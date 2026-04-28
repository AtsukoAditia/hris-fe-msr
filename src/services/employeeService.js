import api from '../lib/axios';

const employeeService = {
  // Get all employees
  getAll: (params = {}) => api.get('/employees', { params }),

  // Get employee by ID
  getById: (id) => api.get(`/employees/${id}`),

  // Create new employee
  create: (data) => api.post('/employees', data),

  // Update employee
  update: (id, data) => api.put(`/employees/${id}`, data),

  // Delete employee
  delete: (id) => api.delete(`/employees/${id}`),

  // Get employee profile (current user)
  getProfile: () => api.get('/employees/profile'),

  // Update employee profile
  updateProfile: (data) => api.put('/employees/profile', data),

  // Get employees by department
  getByDepartment: (departmentId) => api.get(`/employees`, { params: { department_id: departmentId } }),

  // Get employee statistics
  getStats: () => api.get('/employees/stats'),
};

export default employeeService;
