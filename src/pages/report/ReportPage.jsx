import { useState, useEffect, useCallback } from 'react'
import reportService from '../../services/reportService'

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('attendance')
  const [attendanceReport, setAttendanceReport] = useState([])
  const [leaveReport, setLeaveReport] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const normalizeReportRows = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const fetchAttendanceReport = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await reportService.getAttendanceReport(filters)
      setAttendanceReport(normalizeReportRows(res.data))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchLeaveReport = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await reportService.getLeaveReport(filters)
      setLeaveReport(normalizeReportRows(res.data))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (activeTab === 'attendance') fetchAttendanceReport()
    else fetchLeaveReport()
  }, [activeTab, fetchAttendanceReport, fetchLeaveReport])

  const handleExport = async (type) => {
    try {
      showToast(`Mengunduh laporan ${type}...`)
      if (activeTab === 'attendance') {
        await reportService.exportAttendance({ ...filters, format: type })
      } else {
        await reportService.exportLeave({ ...filters, format: type })
      }
    } catch (err) {
      showToast('Gagal mengunduh laporan', 'error')
    }
  }

  const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  const formatTime = (timeStr) => {
    if (!timeStr) return '-'
    return timeStr.substring(0, 5)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    const map = {
      hadir: 'bg-green-100 text-green-700',
      present: 'bg-green-100 text-green-700',
      late: 'bg-yellow-100 text-yellow-700',
      terlambat: 'bg-yellow-100 text-yellow-700',
      absent: 'bg-red-100 text-red-700',
      alfa: 'bg-red-100 text-red-700',
      approved: 'bg-blue-100 text-blue-700',
      pending: 'bg-gray-100 text-gray-700',
      rejected: 'bg-red-100 text-red-700',
    }
    return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Laporan kehadiran dan cuti karyawan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            📊 Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            📄 PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['attendance', 'leave'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'attendance' ? 'Laporan Kehadiran' : 'Laporan Cuti'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Attendance Report Table */}
          {activeTab === 'attendance' && (
            attendanceReport.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📊</p>
                <p className="font-medium">Tidak ada data kehadiran</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Karyawan</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Check In</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Check Out</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {attendanceReport.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{formatDate(row.date || row.work_date)}</td>
                        <td className="px-4 py-3 text-gray-900 font-medium">{row.employee_name || row.user?.name || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{formatTime(row.check_in || row.checkin_time)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatTime(row.check_out || row.checkout_time)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(row.status)}`}>
                            {row.status || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Leave Report Table */}
          {activeTab === 'leave' && (
            leaveReport.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🗓️</p>
                <p className="font-medium">Tidak ada data cuti</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Karyawan</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Jenis Cuti</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal Mulai</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tanggal Selesai</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leaveReport.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(row.attendance_date || row.date || row.work_date)}
                        </td>

                        <td className="px-4 py-3 text-gray-900 font-medium">
                          {row.employee?.name || row.employee_name || row.user?.name || '-'}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {formatTime(row.check_in_time || row.check_in || row.checkin_time)}
                        </td>

                        <td className="px-4 py-3 text-gray-600">
                          {formatTime(row.check_out_time || row.check_out || row.checkout_time)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(row.status)}`}>
                            {row.status || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default ReportPage
