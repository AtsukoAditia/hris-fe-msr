import { useCallback, useEffect, useState } from 'react'
import correctionService from '../../services/correctionService'

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
}

const CORRECTION_TYPES = [
  ['check_in', 'Jam Masuk'],
  ['check_out', 'Jam Pulang'],
  ['both', 'Keduanya'],
]

const normalizeRows = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data?.data)) return payload.data.data
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const initialForm = {
  attendance_id: '',
  correction_date: '',
  correction_type: 'check_in',
  requested_check_in: '',
  requested_check_out: '',
  reason: '',
  attachment: null,
}

const CorrectionPage = () => {
  const [activeTab, setActiveTab] = useState('my')
  const [corrections, setCorrections] = useState([])
  const [reviewCorrections, setReviewCorrections] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCorrection, setSelectedCorrection] = useState(null)
  const [formData, setFormData] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '' })
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchMyCorrections = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (filters.status) params.status = filters.status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const res = await correctionService.listMine(params)
      const data = res.data?.data || res.data
      setCorrections(normalizeRows(data))
      if (data?.current_page) setPagination({ current_page: data.current_page, last_page: data.last_page })
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.message || 'Gagal memuat data.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchReviewCorrections = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (filters.status) params.status = filters.status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const res = await correctionService.listReviews(params)
      const data = res.data?.data || res.data
      setReviewCorrections(normalizeRows(data))
      if (data?.current_page) setPagination({ current_page: data.current_page, last_page: data.last_page })
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.message || 'Gagal memuat data review.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (activeTab === 'my') fetchMyCorrections()
    else fetchReviewCorrections()
  }, [activeTab, fetchMyCorrections, fetchReviewCorrections])

  const handleViewDetail = async (id) => {
    try {
      const service = activeTab === 'my' ? correctionService.getMine : correctionService.getReview
      const res = await service(id)
      setSelectedCorrection(res.data?.data || res.data)
      setShowDetailModal(true)
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memuat detail.', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.attendance_id || !formData.correction_date || !formData.reason) {
      showToast('Mohon lengkapi field yang wajib.', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && val !== '') payload.append(key, val)
      })
      await correctionService.create(payload)
      showToast('Pengajuan koreksi berhasil dikirim.')
      setShowFormModal(false)
      setFormData(initialForm)
      fetchMyCorrections()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan koreksi.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = async (id) => {
    if (!confirm('Yakin ingin membatalkan request ini?')) return
    try {
      await correctionService.cancel(id)
      showToast('Request berhasil dibatalkan.')
      fetchMyCorrections()
      if (showDetailModal) setShowDetailModal(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal membatalkan request.', 'error')
    }
  }

  const handleApprove = async (id) => {
    if (!confirm('Yakin ingin approve koreksi ini?')) return
    try {
      await correctionService.approve(id)
      showToast('Koreksi berhasil di-approve.')
      fetchReviewCorrections()
      if (showDetailModal) setShowDetailModal(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal approve.', 'error')
    }
  }

  const [rejectNote, setRejectNote] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  const handleReject = async (id) => {
    setRejectingId(id)
  }

  const confirmReject = async () => {
    if (!rejectNote.trim()) {
      showToast('Catatan penolakan wajib diisi.', 'error')
      return
    }
    try {
       await correctionService.reject(rejectingId, { review_note: rejectNote })
      showToast('Koreksi berhasil ditolak.')
      setRejectNote('')
      setRejectingId(null)
      fetchReviewCorrections()
      if (showDetailModal) setShowDetailModal(false)
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal reject.', 'error')
    }
  }

  const handleDownload = async (id) => {
    try {
      const res = await correctionService.downloadAttachment(id)
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `correction-${id}-attachment`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      showToast('Tidak dapat mengunduh attachment.', 'error')
    }
  }

  const rows = activeTab === 'my' ? corrections : reviewCorrections

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-gray-900">Koreksi Absensi</h1>
        <button onClick={() => { setFormData(initialForm); setShowFormModal(true) }} className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">
          + Ajukan Koreksi
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button onClick={() => setActiveTab('my')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'my' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Koreksi Saya
        </button>
        <button onClick={() => setActiveTab('review')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'review' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Review Koreksi
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Semua</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
          <input type="date" value={filters.date_from} onChange={(e) => setFilters(f => ({ ...f, date_from: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
          <input type="date" value={filters.date_to} onChange={(e) => setFilters(f => ({ ...f, date_to: e.target.value }))} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={() => activeTab === 'my' ? fetchMyCorrections() : fetchReviewCorrections()} className="px-4 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200">
          Filter
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-1">📭</p>
          <p>Belum ada data koreksi absensi.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto bg-white rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Tanggal</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Tipe</th>
                  {activeTab === 'review' && <th className="px-4 py-3 font-medium text-gray-600">Karyawan</th>}
                  <th className="px-4 py-3 font-medium text-gray-600">Jam Diminta</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{row.correction_date}</td>
                    <td className="px-4 py-3 capitalize">{row.correction_type?.replace('_', ' ')}</td>
                    {activeTab === 'review' && <td className="px-4 py-3">{row.employee?.name || '-'}</td>}
                    <td className="px-4 py-3">
                      {row.requested_check_in || '-'} ~ {row.requested_check_out || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || ''}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-2">
                      <button onClick={() => handleViewDetail(row.id)} className="text-indigo-600 hover:underline text-xs">Detail</button>
                      {activeTab === 'my' && row.status === 'pending' && (
                        <button onClick={() => handleCancel(row.id)} className="text-red-600 hover:underline text-xs">Batal</button>
                      )}
                      {activeTab === 'review' && row.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(row.id)} className="text-green-600 hover:underline text-xs">Approve</button>
                          <button onClick={() => handleReject(row.id)} className="text-red-600 hover:underline text-xs">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="bg-white rounded-lg border p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{row.correction_date}</p>
                    <p className="text-xs text-gray-500 capitalize">{row.correction_type?.replace('_', ' ')}</p>
                    {activeTab === 'review' && <p className="text-xs text-gray-500">{row.employee?.name || '-'}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || ''}`}>
                    {row.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{row.requested_check_in || '-'} ~ {row.requested_check_out || '-'}</p>
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button onClick={() => handleViewDetail(row.id)} className="text-xs text-indigo-600">Detail</button>
                  {activeTab === 'my' && row.status === 'pending' && (
                    <button onClick={() => handleCancel(row.id)} className="text-xs text-red-600">Batal</button>
                  )}
                  {activeTab === 'review' && row.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(row.id)} className="text-xs text-green-600">Approve</button>
                      <button onClick={() => handleReject(row.id)} className="text-xs text-red-600">Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => activeTab === 'my' ? fetchMyCorrections(p) : fetchReviewCorrections(p)}
                  className={`px-3 py-1 text-sm rounded ${p === pagination.current_page ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Submit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Ajukan Koreksi Absensi</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Attendance <span className="text-red-500">*</span></label>
                <input type="text" value={formData.attendance_id} onChange={(e) => setFormData(f => ({ ...f, attendance_id: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ID record attendance" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Koreksi <span className="text-red-500">*</span></label>
                <input type="date" value={formData.correction_date} onChange={(e) => setFormData(f => ({ ...f, correction_date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Koreksi <span className="text-red-500">*</span></label>
                <select value={formData.correction_type} onChange={(e) => setFormData(f => ({ ...f, correction_type: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" required>
                  {CORRECTION_TYPES.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Masuk Diminta</label>
                  <input type="time" value={formData.requested_check_in} onChange={(e) => setFormData(f => ({ ...f, requested_check_in: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang Diminta</label>
                  <input type="time" value={formData.requested_check_out} onChange={(e) => setFormData(f => ({ ...f, requested_check_out: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alasan <span className="text-red-500">*</span></label>
                <textarea value={formData.reason} onChange={(e) => setFormData(f => ({ ...f, reason: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran (opsional)</label>
                <input type="file" onChange={(e) => setFormData(f => ({ ...f, attachment: e.target.files[0] || null }))}
                  className="w-full text-sm" accept=".jpg,.jpeg,.png,.pdf" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Mengirim...' : 'Kirim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCorrection && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Detail Koreksi</h2>
            <div className="space-y-2 text-sm">
              <DetailRow label="Tanggal" value={selectedCorrection.correction_date} />
              <DetailRow label="Tipe" value={selectedCorrection.correction_type?.replace('_', ' ')} />
              {activeTab === 'review' && <DetailRow label="Karyawan" value={selectedCorrection.employee?.name || '-'} />}
              <DetailRow label="Jam Masuk Asli" value={selectedCorrection.original_check_in || '-'} />
              <DetailRow label="Jam Pulang Asli" value={selectedCorrection.original_check_out || '-'} />
              <DetailRow label="Jam Masuk Diminta" value={selectedCorrection.requested_check_in || '-'} />
              <DetailRow label="Jam Pulang Diminta" value={selectedCorrection.requested_check_out || '-'} />
              <DetailRow label="Alasan" value={selectedCorrection.reason || '-'} />
              <DetailRow label="Status" value={selectedCorrection.status} />
              <DetailRow label="Reviewer Note" value={selectedCorrection.reviewer_note || '-'} />
              {selectedCorrection.attachment_path && (
                <div className="pt-2">
                  <button onClick={() => handleDownload(selectedCorrection.id)} className="text-indigo-600 hover:underline text-sm">
                    📎 Download Lampiran
                  </button>
                </div>
              )}
              {selectedCorrection.audit_trail && selectedCorrection.audit_trail.length > 0 && (
                <div className="pt-3 border-t">
                  <p className="font-medium text-gray-700 mb-2">Audit Trail</p>
                  {selectedCorrection.audit_trail.map((log) => (
                    <div key={log.id} className="text-xs text-gray-500 mb-1">
                      [{log.performed_at}] {log.action} oleh {log.user?.name || '-'}
                      {log.old_values && <span className="ml-1">({JSON.stringify(log.old_values)} → {JSON.stringify(log.new_values)})</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end pt-3 border-t">
              {activeTab === 'my' && selectedCorrection.status === 'pending' && (
                <button onClick={() => handleCancel(selectedCorrection.id)} className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                  Batalkan
                </button>
              )}
              {activeTab === 'review' && selectedCorrection.status === 'pending' && (
                <>
                  <button onClick={() => handleApprove(selectedCorrection.id)} className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => handleReject(selectedCorrection.id)} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Reject
                  </button>
                </>
              )}
              <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Note Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Tolak Koreksi</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Penolakan <span className="text-red-500">*</span></label>
              <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" rows={3} placeholder="Alasan penolakan..." />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setRejectingId(null); setRejectNote('') }} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">Batal</button>
              <button onClick={confirmReject} className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Tolak</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DetailRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-900 font-medium capitalize">{value}</span>
  </div>
)

export default CorrectionPage