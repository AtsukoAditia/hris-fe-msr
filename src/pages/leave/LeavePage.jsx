import { useState, useEffect, useCallback } from 'react'
import leaveService from '../../services/leaveService'

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

const LeavePage = () => {
  const [activeTab, setActiveTab] = useState('request')
  const [leaveHistory, setLeaveHistory] = useState([])
  const [leaveBalance, setLeaveBalance] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    type: 'annual',
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchLeaveHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await leaveService.getMyLeaves()
      setLeaveHistory(res.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchLeaveBalance = useCallback(async () => {
    try {
      const res = await leaveService.getBalance()
      setLeaveBalance(res.data?.data || { total: 12, used: 0, remaining: 12 })
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchLeaveHistory()
    fetchLeaveBalance()
  }, [fetchLeaveHistory, fetchLeaveBalance])

  const handleSubmitRequest = async () => {
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason) {
      showToast('Harap lengkapi semua field', 'error')
      return
    }
    try {
      await leaveService.create(leaveForm)
      showToast('Pengajuan cuti berhasil dikirim')
      setShowRequestModal(false)
      setLeaveForm({ type: 'annual', start_date: '', end_date: '', reason: '' })
      fetchLeaveHistory()
      fetchLeaveBalance()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan cuti', 'error')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const getDuration = (start, end) => {
    if (!start || !end) return 0
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
    return diff > 0 ? diff : 0
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Permohonan Cuti</h1>
          <p className="text-gray-500 text-sm mt-1">Ajukan dan kelola cuti Anda</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Ajukan Cuti
        </button>
      </div>

      {/* Leave Balance Card */}
      {leaveBalance && (
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-sm opacity-90 mb-2">Sisa Cuti Tahunan</p>
          <div className="flex items-baseline gap-4">
            <p className="text-4xl font-bold">{leaveBalance.remaining || 0}</p>
            <p className="text-sm opacity-75">dari {leaveBalance.total || 12} hari</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 text-sm opacity-90">
            Terpakai: <span className="font-medium">{leaveBalance.used || 0} hari</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['request', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'request' ? 'Ajukan Cuti' : 'Riwayat Cuti'}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'request' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center text-gray-500">
              <p className="text-4xl mb-3">🏝️</p>
              <p className="font-medium mb-2">Ajukan Cuti Baru</p>
              <p className="text-sm mb-4">Klik tombol "Ajukan Cuti" di atas untuk membuat permohonan cuti baru</p>
            </div>
          )}

          {activeTab === 'history' && (
            leaveHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📝</p>
                <p className="font-medium">Belum ada riwayat cuti</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaveHistory.map((leave) => (
                  <div key={leave.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{leave.leave_type || leave.type || 'Cuti Tahunan'}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[leave.status] || 'bg-gray-100 text-gray-600'}`}>
                        {leave.status === 'pending' ? 'Menunggu' : leave.status === 'approved' ? 'Disetujui' : 'Ditolak'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>📅 {getDuration(leave.start_date, leave.end_date)} hari</span>
                    </div>
                    {leave.reason && (
                      <div className="mt-2 pt-2 border-t border-gray-50">
                        <p className="text-xs text-gray-400">Alasan:</p>
                        <p className="text-sm text-gray-700 mt-0.5">{leave.reason}</p>
                      </div>
                    )}
                    {leave.note && (
                      <div className="mt-1">
                        <p className="text-xs text-gray-400">Catatan:</p>
                        <p className="text-sm text-gray-600 italic mt-0.5">{leave.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Leave Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🏝️ Ajukan Permohonan Cuti</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Cuti</label>
              <select
                value={leaveForm.type}
                onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="annual">Cuti Tahunan</option>
                <option value="sick">Cuti Sakit</option>
                <option value="emergency">Cuti Darurat</option>
                <option value="other">Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                <input
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {leaveForm.start_date && leaveForm.end_date && (
              <p className="text-sm text-indigo-600 font-medium">
                Durasi: {getDuration(leaveForm.start_date, leaveForm.end_date)} hari
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tuliskan alasan cuti..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitRequest}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeavePage
