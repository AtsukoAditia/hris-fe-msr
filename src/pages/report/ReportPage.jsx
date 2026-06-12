import { useCallback, useEffect, useMemo, useState } from 'react'
import reportService from '../../services/reportService'

const currentYear = new Date().getFullYear()

const initialFilters = {
  month: new Date().getMonth() + 1,
  year: currentYear,
  date_from: '',
  date_to: '',
  employee_id: '',
  department: '',
  status: '',
  leave_type: '',
  search: '',
  per_page: 30,
}

const REPORT_TABS = [
  ['attendance', 'Kehadiran'],
  ['leave', 'Cuti'],
  ['employee', 'Karyawan'],
]

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const ReportPage = () => {
  const [activeTab, setActiveTab] = useState('attendance')
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({})
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const requestParams = useMemo(() => buildParams(filters, activeTab), [filters, activeTab])

  const fetchReport = useCallback(async () => {
    setIsLoading(true)
    try {
      const serviceMap = {
        attendance: reportService.getAttendanceReport,
        leave: reportService.getLeaveReport,
        employee: reportService.getEmployeeReport,
      }

      const res = await serviceMap[activeTab](requestParams)
      setRows(normalizeRows(res.data))
      setSummary(res.data?.summary || {})
    } catch (err) {
      console.error(err)
      setRows([])
      setSummary({})
      showToast(getErrorMessage(err, 'Gagal memuat laporan.'), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, requestParams])

  useEffect(() => {
    fetchReport()
  }, [fetchReport])

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await reportService.exportReport(activeTab, requestParams)
      downloadBlob(response.data, getExportFilename(activeTab))
      showToast('CSV berhasil diunduh.')
    } catch (err) {
      console.error(err)
      showToast(getErrorMessage(err, 'Gagal mengunduh CSV.'), 'error')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {toast && <Toast toast={toast} />}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Laporan kehadiran, cuti, dan karyawan.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {isExporting ? 'Mengunduh...' : 'Download CSV'}
        </button>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto">
        {REPORT_TABS.map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Laporan {label}
          </button>
        ))}
      </div>

      <SummaryGrid activeTab={activeTab} summary={summary} />

      <ReportFilters
        activeTab={activeTab}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
      />

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium">Tidak ada data laporan.</p>
          </div>
        ) : (
          <ReportTable activeTab={activeTab} rows={rows} />
        )}
      </div>
    </div>
  )
}

const ReportFilters = ({ activeTab, filters, updateFilter, resetFilters }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <FilterInput label="Cari" value={filters.search} onChange={(value) => updateFilter('search', value)} placeholder="Nama, email, NIK, jabatan..." />
      <FilterInput label="Departemen" value={filters.department} onChange={(value) => updateFilter('department', value)} placeholder="Contoh: IT" />
      <MonthSelect value={filters.month} onChange={(value) => updateFilter('month', Number(value))} />
      <YearSelect value={filters.year} onChange={(value) => updateFilter('year', Number(value))} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <FilterInput label="Tanggal Dari" type="date" value={filters.date_from} onChange={(value) => updateFilter('date_from', value)} />
      <FilterInput label="Tanggal Sampai" type="date" value={filters.date_to} onChange={(value) => updateFilter('date_to', value)} />
      <StatusSelect activeTab={activeTab} value={filters.status} onChange={(value) => updateFilter('status', value)} />
      {activeTab === 'leave' ? (
        <LeaveTypeSelect value={filters.leave_type} onChange={(value) => updateFilter('leave_type', value)} />
      ) : activeTab === 'employee' ? (
        <EmployeeStatusSelect value={filters.status} onChange={(value) => updateFilter('status', value)} />
      ) : (
        <FilterInput label="Employee ID" value={filters.employee_id} onChange={(value) => updateFilter('employee_id', value)} placeholder="Opsional" />
      )}
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        onClick={resetFilters}
        className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
      >
        Reset Filter
      </button>
      {filters.date_from && filters.date_to && (
        <p className="text-xs text-gray-500 self-center">Range tanggal aktif. Filter bulan/tahun akan diabaikan backend.</p>
      )}
    </div>
  </div>
)

const SummaryGrid = ({ activeTab, summary }) => {
  const items = {
    attendance: [
      ['Total', summary.total_records ?? 0],
      ['Present', summary.total_present ?? 0],
      ['Late', summary.total_late ?? 0],
      ['Absent', summary.total_absent ?? 0],
      ['Leave', summary.total_leave ?? 0],
      ['Late Min', summary.total_late_minutes ?? 0],
      ['Overtime Min', summary.total_overtime_minutes ?? 0],
    ],
    leave: [
      ['Total', summary.total_records ?? 0],
      ['Approved', summary.total_approved ?? 0],
      ['Pending', summary.total_pending ?? 0],
      ['Rejected', summary.total_rejected ?? 0],
      ['Cancelled', summary.total_cancelled ?? 0],
      ['Total Days', summary.total_days ?? 0],
    ],
    employee: [
      ['Total', summary.total_records ?? 0],
      ['Active', summary.total_active ?? 0],
      ['Inactive', summary.total_inactive ?? 0],
    ],
  }[activeTab]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
      {items.map(([label, value]) => (
        <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      ))}
    </div>
  )
}

const ReportTable = ({ activeTab, rows }) => {
  if (activeTab === 'attendance') return <AttendanceTable rows={rows} />
  if (activeTab === 'leave') return <LeaveTable rows={rows} />
  return <EmployeeTable rows={rows} />
}

const AttendanceTable = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {['Tanggal', 'Karyawan', 'Departemen', 'Shift', 'Check In', 'Check Out', 'Status', 'Late', 'Overtime'].map((head) => <Th key={head}>{head}</Th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <Td>{formatDate(row.attendance_date)}</Td>
            <Td strong>{row.employee_name || '-'}</Td>
            <Td>{row.department || '-'}</Td>
            <Td>{row.shift_name || '-'}</Td>
            <Td>{formatTime(row.check_in_time)}</Td>
            <Td>{formatTime(row.check_out_time)}</Td>
            <Td><StatusBadge status={row.status} /></Td>
            <Td>{row.late_minutes ?? 0}m</Td>
            <Td>{row.overtime_minutes ?? 0}m</Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const LeaveTable = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {['Karyawan', 'Departemen', 'Jenis', 'Mulai', 'Selesai', 'Hari', 'Status', 'Approver', 'Alasan'].map((head) => <Th key={head}>{head}</Th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <Td strong>{row.employee_name || '-'}</Td>
            <Td>{row.department || '-'}</Td>
            <Td>{getLeaveTypeLabel(row.leave_type)}</Td>
            <Td>{formatDate(row.start_date)}</Td>
            <Td>{formatDate(row.end_date)}</Td>
            <Td>{row.total_days ?? 0}</Td>
            <Td><StatusBadge status={row.status} /></Td>
            <Td>{row.approved_by || '-'}</Td>
            <Td>{row.rejection_reason || row.reason || '-'}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const EmployeeTable = ({ rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          {['No. Karyawan', 'Nama', 'Email', 'Departemen', 'Jabatan', 'Tipe', 'Status'].map((head) => <Th key={head}>{head}</Th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50">
            <Td>{row.employee_number || '-'}</Td>
            <Td strong>{row.name || '-'}</Td>
            <Td>{row.email || '-'}</Td>
            <Td>{row.department || '-'}</Td>
            <Td>{row.position || '-'}</Td>
            <Td>{row.employment_type || '-'}</Td>
            <Td><StatusBadge status={row.status} /></Td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const FilterInput = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
)

const MonthSelect = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">Bulan</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
      {MONTHS.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}
    </select>
  </div>
)

const YearSelect = ({ value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">Tahun</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
      {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((year) => <option key={year} value={year}>{year}</option>)}
    </select>
  </div>
)

const StatusSelect = ({ activeTab, value, onChange }) => {
  if (activeTab === 'employee') return null

  const options = activeTab === 'attendance'
    ? [['', 'Semua status'], ['present', 'Present'], ['late', 'Late'], ['absent', 'Absent'], ['leave', 'Leave']]
    : [['', 'Semua status'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['cancelled', 'Cancelled']]

  return <SelectInput label="Status" value={value} onChange={onChange} options={options} />
}

const EmployeeStatusSelect = ({ value, onChange }) => (
  <SelectInput label="Status Karyawan" value={value} onChange={onChange} options={[[ '', 'Semua status' ], [ 'active', 'Active' ], [ 'inactive', 'Inactive' ]]} />
)

const LeaveTypeSelect = ({ value, onChange }) => (
  <SelectInput label="Jenis Cuti" value={value} onChange={onChange} options={[
    ['', 'Semua jenis cuti'],
    ['annual', 'Cuti Tahunan'],
    ['sick', 'Cuti Sakit'],
    ['emergency', 'Cuti Darurat'],
    ['maternity', 'Cuti Melahirkan'],
    ['paternity', 'Cuti Ayah'],
    ['unpaid', 'Cuti Tidak Dibayar'],
    ['other', 'Lainnya'],
  ]} />
)

const SelectInput = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
      {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
    </select>
  </div>
)

const Th = ({ children }) => <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 whitespace-nowrap">{children}</th>
const Td = ({ children, strong = false }) => <td className={`px-4 py-3 whitespace-nowrap ${strong ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{children}</td>

const StatusBadge = ({ status }) => (
  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(status)}`}>
    {getStatusLabel(status)}
  </span>
)

const Toast = ({ toast }) => (
  <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
    {toast.message}
  </div>
)

const buildParams = (filters, activeTab) => {
  const params = { per_page: filters.per_page }

  if (filters.date_from && filters.date_to) {
    params.date_from = filters.date_from
    params.date_to = filters.date_to
  } else {
    params.month = filters.month
    params.year = filters.year
  }

  if (filters.employee_id && activeTab !== 'employee') params.employee_id = filters.employee_id
  if (filters.department) params.department = filters.department
  if (filters.search) params.search = filters.search
  if (filters.status) params.status = filters.status
  if (activeTab === 'leave' && filters.leave_type) params.leave_type = filters.leave_type

  return params
}

const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

const getExportFilename = (activeTab) => `${activeTab}-report.csv`

const getErrorMessage = (err, fallback) => {
  const errors = err.response?.data?.errors
  if (errors) {
    const firstKey = Object.keys(errors)[0]
    const firstMessage = errors[firstKey]?.[0]
    if (firstMessage) return firstMessage
  }
  return err.response?.data?.message || fallback
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (timeStr) => {
  if (!timeStr) return '-'
  return String(timeStr).slice(0, 5)
}

const getStatusColor = (status = '') => ({
  present: 'bg-green-100 text-green-700',
  late: 'bg-yellow-100 text-yellow-700',
  absent: 'bg-red-100 text-red-700',
  leave: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
}[String(status).toLowerCase()] || 'bg-gray-100 text-gray-600')

const getStatusLabel = (status = '') => ({
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  leave: 'Leave',
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  active: 'Active',
  inactive: 'Inactive',
}[String(status).toLowerCase()] || status || '-')

const getLeaveTypeLabel = (type = '') => ({
  annual: 'Cuti Tahunan',
  sick: 'Cuti Sakit',
  emergency: 'Cuti Darurat',
  maternity: 'Cuti Melahirkan',
  paternity: 'Cuti Ayah',
  unpaid: 'Cuti Tidak Dibayar',
  other: 'Lainnya',
}[type] || type || '-')

export default ReportPage
