import { useEffect, useMemo, useState } from 'react'
import { useAttendanceStore } from '../../store/attendanceStore'
import { attendanceService } from '../../services/attendanceService'
import { useAuthStore } from '../../store/authStore'

const initialFilters = {
  employee_id: '',
  date_from: '',
  date_to: '',
  status: '',
  search: '',
}

const AttendancePage = () => {
  const { user } = useAuthStore()
  const isAdminLike = ['admin', 'hr', 'manager'].includes(String(user?.role || '').toLowerCase())

  const {
    todayAttendance,
    attendanceList = [],
    setAttendanceList,
    setTodayAttendance,
  } = useAttendanceStore()

  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [message, setMessage] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    if (isAdminLike) {
      fetchAdminAttendances()
      return
    }

    fetchInitialData()
    getCurrentLocation()
  }, [])

  const normalizeAttendanceList = (payload) => {
    if (payload?.data?.data) return payload.data.data
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload)) return payload
    return []
  }

  const fetchInitialData = async () => {
    setIsLoading(true)
    await Promise.all([fetchAttendances(), fetchTodayAttendance()])
    setIsLoading(false)
  }

  const shouldSuppressAttendanceError = (err) => {
    const status = err?.response?.status
    return isAdminLike && [404, 403, 422].includes(status)
  }

  const fetchAttendances = async () => {
    try {
      const res = await attendanceService.getMyAttendances()
      const list = normalizeAttendanceList(res.data)
      setAttendanceList(list)
    } catch (err) {
      console.error(err)
      setAttendanceList([])

      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat riwayat absensi.' })
      }
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const res = await attendanceService.getToday()
      setTodayAttendance(res.data?.data || null)
    } catch (err) {
      console.error(err)
      setTodayAttendance(null)

      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat absensi hari ini.' })
      }
    }
  }

  const fetchAdminAttendances = async () => {
    try {
      setIsLoading(true)
      setMessage(null)

      const params = {}
      if (filters.employee_id) params.employee_id = filters.employee_id
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.status) params.status = filters.status

      const res = await attendanceService.getAll(params)
      const list = normalizeAttendanceList(res.data)
      setAttendanceList(list)
    } catch (err) {
      console.error(err)
      setAttendanceList([])
      setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memuat daftar absensi karyawan.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.error('Location error:', err)
    )
  }

  const handleCheckIn = async () => {
    try {
      setActionLoading(true)
      setMessage(null)
      const payload = {
        latitude: location?.lat,
        longitude: location?.lng,
      }
      const res = await attendanceService.checkIn(payload)
      setTodayAttendance(res.data?.data || null)
      setMessage({ type: 'success', text: res.data?.message || 'Check-in berhasil.' })
      await fetchAttendances()
    } catch (err) {
      console.error(err)
      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in gagal.' })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setActionLoading(true)
      setMessage(null)
      const payload = {
        latitude: location?.lat,
        longitude: location?.lng,
      }
      const res = await attendanceService.checkOut(payload)
      setTodayAttendance(res.data?.data || null)
      setMessage({ type: 'success', text: res.data?.message || 'Check-out berhasil.' })
      await fetchAttendances()
    } catch (err) {
      console.error(err)
      if (!shouldSuppressAttendanceError(err)) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Check-out gagal.' })
      }
    } finally {
      setActionLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyFilters = () => {
    fetchAdminAttendances()
  }

  const handleResetFilters = () => {
    const nextFilters = initialFilters
    setFilters(nextFilters)
    setTimeout(() => fetchAdminAttendances(), 0)
  }

  const canCheckIn = useMemo(
    () => !todayAttendance?.check_in_time,  // Ubah dari check_in
    [todayAttendance]
  )

  const canCheckOut = useMemo(
    () => !!todayAttendance?.check_in_time && !todayAttendance?.check_out_time,  // Ubah dari check_in/check_out
    [todayAttendance]
  )

  const filteredAdminAttendanceList = useMemo(() => {
    if (!isAdminLike) return attendanceList
    if (!filters.search) return attendanceList

    const keyword = filters.search.toLowerCase()

    return attendanceList.filter((attendance) => {
      const employeeName = attendance.employee?.name || ''
      const department = attendance.employee?.department || ''
      const position = attendance.employee?.position || ''
      const status = attendance.status || ''
      const date = attendance.attendance_date || ''

      return [employeeName, department, position, status, date]
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [attendanceList, filters.search, isAdminLike])

  if (isAdminLike) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Absensi Karyawan</h1>
          <p className="text-gray-600 mt-1">Admin hanya melihat daftar absensi karyawan tanpa form check-in atau check-out. [memory:27]</p>
        </div>

        {message && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Filter Absensi</h2>
            <p className="text-sm text-gray-500 mt-1">Filter yang saya rekomendasikan: employee ID, rentang tanggal, status, dan pencarian nama/departemen/jabatan. [memory:27]</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={filters.employee_id}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Contoh: 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
              <input
                type="date"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Akhir</label>
              <input
                type="date"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Semua status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pencarian Cepat</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Nama, departemen, jabatan"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Terapkan Filter
            </button>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Absensi</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Departemen</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Memuat daftar absensi...</td>
                  </tr>
                ) : filteredAdminAttendanceList.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Belum ada data absensi karyawan.</td>
                  </tr>
                ) : (
                  filteredAdminAttendanceList.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{attendance.employee?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{attendance.employee?.department || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{attendance.employee?.position || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{attendance.attendance_date || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{attendance.check_in_time || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{attendance.check_out_time || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {attendance.status || '-'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
        <p className="text-gray-600 mt-1">Lakukan check-in dan check-out serta lihat riwayat absensi harian.</p>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Absensi Hari Ini</h2>
            <p className="text-sm text-gray-500 mt-1">
              {todayAttendance
                ? `Status hari ini: ${todayAttendance.status || 'present'}`
                : 'Belum ada absensi hari ini.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || !canCheckIn}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Memproses...' : 'Check In'}
            </button>
            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !canCheckOut}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Memproses...' : 'Check Out'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Tanggal</p>
            <p className="mt-1 font-semibold text-gray-900">{todayAttendance?.attendance_date || '-'}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Check In</p>
            <p className="mt-1 font-semibold text-gray-900">{todayAttendance?.check_in_time || '-'}</p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm text-gray-500">Check Out</p>
            <p className="mt-1 font-semibold text-gray-900">{todayAttendance?.check_out_time || '-'}</p>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          {location
            ? `Lokasi terdeteksi: ${location.lat}, ${location.lng}`
            : 'Lokasi belum tersedia. Absensi tetap bisa dicoba, tetapi sebaiknya izinkan akses lokasi.'}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Riwayat Absensi</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Memuat data absensi...</td>
                </tr>
              ) : attendanceList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">Belum ada riwayat absensi.</td>
                </tr>
              ) : (
                attendanceList.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{attendance.attendance_date || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{attendance.check_in_time || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{attendance.check_out_time || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {attendance.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AttendancePage
