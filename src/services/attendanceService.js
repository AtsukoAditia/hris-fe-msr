import api from '../lib/axios'

const toFormData = (data = {}) => {
  const formData = new FormData()

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  })

  return formData
}

const postAttendance = (url, data = {}) => {
  if (data.photo) {
    return api.post(url, toFormData(data), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }

  return api.post(url, data)
}

export const attendanceService = {
  getMyAttendances: (params) => api.get('/attendance/my', { params }),
  getToday: () => api.get('/attendance/today'),

  checkIn: (data) => postAttendance('/attendance/check-in', data),
  checkOut: (data) => postAttendance('/attendance/check-out', data),
  checkInQr: (data) => postAttendance('/attendance/check-in/qr', data),
  checkOutQr: (data) => postAttendance('/attendance/check-out/qr', data),

  getByEmployee: (employeeId, params) => api.get(`/attendance/employee/${employeeId}`, { params }),
  getAll: (params) => api.get('/attendance', { params }),

  getSettings: () => api.get('/attendance/settings'),
  updateSettings: (data) => api.put('/attendance/settings', data),
  generateQr: (data = {}) => api.post('/attendance/qr/generate', data),

  exportExcel: (params) => api.get('/attendance/export', {
    params,
    responseType: 'blob',
  }),
}
