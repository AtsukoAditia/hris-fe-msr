import { useState, useEffect, useCallback } from 'react'
import approvalService from '../../services/approvalService'

const STATUS_BADGE = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-700',
}

const ApprovalPage = () => {
  const [activeTab, setActiveTab] = useState('pending')
  const [pendingList, setPendingList] = useState([])
  const [historyList, setHistoryList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [note, setNote] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const normalizeRows = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data?.data)) return payload.data.data
    if (Array.isArray(payload?.data)) return payload.data
    return []
  }

  const fetchPending = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await approvalService.getPending()
      setPendingList(normalizeRows(res.data))
    } catch (err) {
      console.error(err)
      setPendingList([])
      showToast(err.response?.data?.message || 'Gagal memuat daftar persetujuan.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await approvalService.getHistory()
      const rows = normalizeRows(res.data)
      setHistoryList(rows.filter((item) => item.status !== 'pending'))
    } catch (err) {
      console.error(err)
      setHistoryList([])
      showToast(err.response?.data?.message || 'Gagal memuat riwayat persetujuan.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'pending') fetchPending()
    else fetchHistory()
  }, [activeTab, fetchPending, fetchHistory])

  const openModal = (item, action) => {
    setSelectedItem(item)
    setModalAction(action)
    setNote('')
    setShowModal(true)
  }

  const handleConfirmAction = async () => {
    if (!selectedItem || !modalAction) return
    setActionLoading(selectedItem.id)
    try {
      if (modalAction === 'approve') {
        await approvalService.approve(selectedItem.id, { note })
        showToast('Persetujuan berhasil diberikan')
      } else {
        await approvalService.reject(selectedItem.id, { rejection_reason: note || 'Ditolak oleh approver.' })
        showToast('Pengajuan berhasil ditolak', 'error')
      }
      setShowModal(false)
      setSelectedItem(null)
      setNote('')
      fetchPending()
    } catch (err) {
      showToast(err.response?.data?.message || 'Terjadi kesalahan', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const getEmployeeName = (item) => (
    item.employee?.user?.name || item.employee_name || item.user?.name || 'Karyawan'
  )

  const getLeaveType = (item) => (
    item.leave_type || item.type || item.request_type || 'Leave Request'
  )

  const ApprovalCard = ({ item, showActions = false }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{getEmployeeName(item)}</p>
          <p className="text-sm text-gray-500">{getLeaveType(item)}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-600'}`}>
          {item.status === 'pending' ? 'Menunggu' : item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : item.status || '-'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-400 text-xs">Tanggal Mulai</p>
          <p className="text-gray-700">{formatDate(item.start_date || item.date)}</p>
        </div>
        <div>
          <p className="text-gray-400 text-xs">Tanggal Selesai</p>
          <p className="text-gray-700">{formatDate(item.end_date || item.date)}</p>
        </div>
      </div>
      {item.reason && (
        <div>
          <p className="text-gray-400 text-xs">Alasan</p>
          <p className="text-gray-700 text-sm">{item.reason}</p>
        </div>
      )}
      {(item.note || item.rejection_reason) && (
        <div>
          <p className="text-gray-400 text-xs">Catatan</p>
          <p className="text-gray-600 text-sm italic">{item.note || item.rejection_reason}</p>
        </div>
      )}
      {showActions && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => openModal(item, 'approve')}
            disabled={actionLoading === item.id}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Setujui
          </button>
          <button
            onClick={() => openModal(item, 'reject')}
            disabled={actionLoading === item.id}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Tolak
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Persetujuan</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola pengajuan cuti dan izin karyawan</p>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Menunggu Persetujuan
          {pendingList.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {pendingList.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Riwayat
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {activeTab === 'pending' && (
            pendingList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">✅</p>
                <p className="font-medium">Tidak ada pengajuan yang menunggu</p>
              </div>
            ) : (
              pendingList.map((item) => (
                <ApprovalCard key={item.id} item={item} showActions />
              ))
            )
          )}
          {activeTab === 'history' && (
            historyList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">📋</p>
                <p className="font-medium">Belum ada riwayat persetujuan</p>
              </div>
            ) : (
              historyList.map((item) => (
                <ApprovalCard key={item.id} item={item} />
              ))
            )
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {modalAction === 'approve' ? '✅ Setujui Pengajuan' : '❌ Tolak Pengajuan'}
            </h3>
            <p className="text-sm text-gray-500">
              {getEmployeeName(selectedItem || {})} — {getLeaveType(selectedItem || {})}
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {modalAction === 'reject' ? 'Alasan penolakan' : 'Catatan (opsional)'}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={modalAction === 'reject' ? 'Masukkan alasan penolakan...' : 'Tambahkan catatan...'}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={!!actionLoading}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${
                  modalAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {actionLoading ? 'Memproses...' : modalAction === 'approve' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalPage
