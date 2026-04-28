import api from '../lib/axios'

export const attendanceService = {
  /** Get my attendance list */
  getMyAttendances: (params) => api.get('/attendance/my', { params }),

  /** Get today's attendance */
  getToday: () => api.get('/attendance/today'),

  /** Check-in with selfie + location */
  checkIn: (data) => api.post('/attendance/check-in', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /** Check-out with selfie + location */
  checkOut: (data) => api.post('/attendance/check-out', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  /** Check-in via QR code */
  checkInQr: (data) => api.post('/attendance/check-in/qr', data),

  /** Check-out via QR code */
  checkOutQr: (data) => api.post('/attendance/check-out/qr', data),

  /** Get attendance by employee (admin) */
  getByEmployee: (employeeId, params) =>
    api.get(`/attendance/employee/${employeeId}`, { params }),

  /** Admin: get all attendances */
  getAll: (params) => api.get('/attendance', { params }),

  /** Export attendance to Excel */
  exportExcel: (params) => api.get('/attendance/export', {
    params,
    responseType: 'blob',
  }),
}
