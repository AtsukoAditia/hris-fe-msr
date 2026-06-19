import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { Navigate } from 'react-router-dom'
import activityLogService from '../../services/activityLogService'

const ACTION_BADGE = {
  login: 'bg-blue-100 text-blue-800',
  logout: 'bg-gray-100 text-gray-700',
  created: 'bg-green-100 text-green-800',
  updated: 'bg-yellow-100 text-yellow-800',
  deleted: 'bg-red-100 text-red-800',
  approved: 'bg-indigo-100 text-indigo-800',
  rejected: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-700',
  manual_correction: 'bg-purple-100 text-purple-800',
  profile_change_approved: 'bg-teal-100 text-teal-800',
  profile_change_rejected: 'bg-pink-100 text-pink-800',
}

const ACTION_LABELS = {
  login: 'Login',
  logout: 'Logout',
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  manual_correction: 'Manual Correction',
  profile_change_approved: 'Profile Change Approved',
  profile_change_rejected: 'Profile Change Rejected',
}

const ROLE_LABELS = {
  admin: 'Admin',
  hr: 'HR',
  manager: 'Manager',
  employee: 'Employee',
}

const DEFAULT_FILTERS = {
  user_id: '',
  action: '',
  user_role: '',
  module: '',
  date_from: '',
  date_to: '',
  search: '',
  per_page: 20,
}

const extractRows = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const extractPagination = (payload) => {
  const source = payload?.data && Array.isArray(payload.data.data) ? payload.data : payload
  if (!source || typeof source !== 'object') return null
  if (source.current_page && source.last_page) {
    return {
      current_page: source.current_page,
      last_page: source.last_page,
      total: source.total ?? 0,
    }
  }
  return null
}

const AuditLogPage = () => {
  const { user } = useAuthStore()
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  })
  const [selectedLog, setSelectedLog] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const params = { page, per_page: filters.per_page }
      if (filters.user_id) params.user_id = filters.user_id
      if (filters.action) params.action = filters.action
      if (filters.user_role) params.user_role = filters.user_role
      if (filters.module) params.module = filters.module
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.search) params.search = filters.search

      const res = await activityLogService.list(params)
      const payload = res.data
      setLogs(extractRows(payload))
      const next = extractPagination(payload)
      if (next) setPagination(next)
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal memuat audit log.'
      setErrorMessage(message)
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getUserName = (log) => {
    if (log.user?.name) return log.user.name
    if (log.user_name) return log.user_name
    return log.user_id ? `User #${log.user_id}` : '-'
  }

  const getActionLabel = (action) => ACTION_LABELS[action] || action
  const getActionBadge = (action) => ACTION_BADGE[action] || 'bg-gray-100 text-gray-700'
  const getRoleLabel = (role) => ROLE_LABELS[role] || role || '-'

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
  }

  const handlePrevPage = () => {
    if (pagination.current_page > 1) {
      fetchLogs(pagination.current_page - 1)
    }
  }

  const handleNextPage = () => {
    if (pagination.current_page < pagination.last_page) {
      fetchLogs(pagination.current_page + 1)
    }
  }

  const handleOpenDetail = async (id) => {
    setDetailLoading(true)
    setSelectedLog(null)
    try {
      const res = await activityLogService.show(id)
      setSelectedLog(res.data?.data ?? null)
    } catch (err) {
      const message = err?.response?.data?.message || 'Gagal memuat detail log.'
      setErrorMessage(message)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetail = () => {
    setSelectedLog(null)
  }

  const totalLabel = useMemo(() => {
    if (pagination.total === 0) return 'Belum ada data'
    return `${pagination.total} entri`
  }, [pagination.total])

  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500">Riwayat aktivitas sistem untuk audit dan kepatuhan.</p>
        </div>
        <span className="text-sm text-gray-500">{totalLabel}</span>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {errorMessage}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="audit-search" className="block text-xs text-gray-500 mb-1">Cari</label>
            <input
              id="audit-search"
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-48"
              placeholder="Nama / deskripsi / endpoint"
            />
          </div>
          <div>
            <label htmlFor="audit-user-id" className="block text-xs text-gray-500 mb-1">User ID</label>
            <input
              id="audit-user-id"
              type="number"
              min="1"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-32"
              placeholder="ID"
            />
          </div>
          <div>
            <label htmlFor="audit-action" className="block text-xs text-gray-500 mb-1">Action</label>
            <select
              id="audit-action"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua</option>
              {Object.entries(ACTION_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audit-role" className="block text-xs text-gray-500 mb-1">Role</label>
            <select
              id="audit-role"
              value={filters.user_role}
              onChange={(e) => handleFilterChange('user_role', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Semua</option>
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audit-module" className="block text-xs text-gray-500 mb-1">Module</label>
            <input
              id="audit-module"
              type="text"
              value={filters.module}
              onChange={(e) => handleFilterChange('module', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-40"
              placeholder="e.g. attendance"
            />
          </div>
          <div>
            <label htmlFor="audit-date-from" className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
            <input
              id="audit-date-from"
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="audit-date-to" className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
            <input
              id="audit-date-to"
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="audit-per-page" className="block text-xs text-gray-500 mb-1">Per Page</label>
            <select
              id="audit-per-page"
              value={filters.per_page}
              onChange={(e) => handleFilterChange('per_page', Number(e.target.value))}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fetchLogs()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
          <p className="text-lg mb-1">📭</p>
          <p>Tidak ada data audit log.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Waktu</th>
                  <th className="px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Module</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Endpoint</th>
                  <th className="px-4 py-3 font-medium text-gray-600">IP</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs whitespace-nowrap">{formatDateTime(row.logged_at)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{getUserName(row)}</div>
                      {row.user_email && (
                        <div className="text-xs text-gray-500">{row.user_email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{getRoleLabel(row.user_role)}</td>
                    <td className="px-4 py-3 text-xs text-gray-700">{row.module || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(row.action)}`}>
                        {getActionLabel(row.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 font-mono">
                      {row.method ? `${row.method} ` : ''}{row.endpoint || '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{row.ip_address || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(row.id)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {logs.map((row) => (
              <div key={row.id} className="bg-white rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{getUserName(row)}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(row.logged_at)}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadge(row.action)}`}>
                    {getActionLabel(row.action)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Module: {row.module || '-'}</p>
                  <p>Role: {getRoleLabel(row.user_role)}</p>
                  <p>Endpoint: {row.method ? `${row.method} ` : ''}{row.endpoint || '-'}</p>
                  <p>IP: {row.ip_address || '-'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(row.id)}
                  className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                >
                  Lihat Detail
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.last_page}
                {pagination.total > 0 && (
                  <span className="ml-2 text-gray-400">({pagination.total} total)</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {(selectedLog || detailLoading) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <h2 className="text-base font-semibold text-gray-900">Detail Audit Log</h2>
              <button
                type="button"
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Tutup"
              >
                ×
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4 text-sm space-y-3">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : selectedLog ? (
                <>
                  <DetailRow label="Waktu" value={formatDateTime(selectedLog.logged_at)} />
                  <DetailRow label="User" value={getUserName(selectedLog)} />
                  <DetailRow label="Email" value={selectedLog.user_email || '-'} />
                  <DetailRow label="Role" value={getRoleLabel(selectedLog.user_role)} />
                  <DetailRow label="Module" value={selectedLog.module || '-'} />
                  <DetailRow label="Action" value={getActionLabel(selectedLog.action)} />
                  <DetailRow
                    label="Endpoint"
                    value={selectedLog.method ? `${selectedLog.method} ${selectedLog.endpoint}` : selectedLog.endpoint}
                  />
                  <DetailRow label="Route" value={selectedLog.route_name || '-'} />
                  <DetailRow label="Status" value={selectedLog.response_status ?? '-'} />
                  <DetailRow label="IP Address" value={selectedLog.ip_address || '-'} />
                  <DetailRow label="User Agent" value={selectedLog.user_agent || '-'} />
                  {selectedLog.latitude && selectedLog.longitude && (
                    <DetailRow label="Lokasi" value={`${selectedLog.latitude}, ${selectedLog.longitude}`} />
                  )}
                  <DetailRow label="Deskripsi" value={selectedLog.description || '-'} />
                  <PayloadBlock label="Request Payload" payload={selectedLog.request_payload} />
                  <PayloadBlock label="Response Payload" payload={selectedLog.response_payload} />
                </>
              ) : (
                <p className="text-gray-500">Detail tidak tersedia.</p>
              )}
            </div>
            <div className="px-5 py-3 border-t flex justify-end">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2">
    <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
    <span className="col-span-2 text-gray-800 break-words">{value || '-'}</span>
  </div>
)

const PayloadBlock = ({ label, payload }) => {
  const hasPayload = payload && typeof payload === 'object' && Object.keys(payload).length > 0
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <pre className="bg-gray-50 border rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap break-all">
        {hasPayload ? JSON.stringify(payload, null, 2) : '-'}
      </pre>
    </div>
  )
}

export default AuditLogPage