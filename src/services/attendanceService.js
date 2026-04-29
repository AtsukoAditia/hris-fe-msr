import api from '../lib/axios'

export const attendanceService = {
  /** Riwayat absensi milik user yang sedang login */
  getMyAttendances: (params) => api.get('/attendance/my', { params }),

  /** Absensi hari ini milik user yang sedang login */
  getToday: () => api.get('/attendance/today'),

  /** Check-in (JSON, bukan multipart) */
  checkIn: (data) => api.post('/attendance/check-in', data),

  /** Check-out (JSON, bukan multipart) */
  checkOut: (data) => api.post('/attendance/check-out', data),

  /** Check-in via QR code */
  checkInQr: (data) => api.post('/attendance/check-in/qr', data),

  /** Check-out via QR code */
  checkOutQr: (data) => api.post('/attendance/check-out/qr', data),

  /** Data absensi satu karyawan tertentu (admin/hr) */
  getByEmployee: (employeeId, params) =>
    api.get(`/attendance/employee/${employeeId}`, { params }),

  /** Semua absensi - monitoring admin/hr */
  getAll: (params) => api.get('/attendance', { params }),

  /** Export absensi ke Excel */
  exportExcel: (params) =>
    api.get('/attendance/export', {
      params,
      responseType: 'blob',
    }),
}
