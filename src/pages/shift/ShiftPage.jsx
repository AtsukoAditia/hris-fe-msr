import { useState, useEffect, useCallback } from 'react'
import shiftService from '../../services/shiftService'
import useAuthStore from '../../store/authStore'

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const ShiftPage = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('schedule')
  const [shifts, setShifts] = useState([])
  const [mySchedule, setMySchedule] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapForm, setSwapForm] = useState({ date: '', note: '' })
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchShifts = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await shiftService.getAll()
      setShifts(res.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchMySchedule = useCallback(async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      const res = await shiftService.getAssignments()
      setMySchedule(res.data?.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchShifts()
    fetchMySchedule()
  }, [fetchShifts, fetchMySchedule])

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const handleSwapSubmit = async () => {
    try {
      showToast('Permintaan tukar shift telah dikirim')
      setShowSwapModal(false)
      setSwapForm({ date: '', note: '' })
    } catch (err) {
      showToast('Gagal mengirim permintaan', 'error')
    }
  }

  const getScheduleForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return mySchedule.find(s => s.date === dateStr || s.work_date === dateStr)
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
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Shift</h1>
          <p className="text-gray-500 text-sm mt-1">Lihat dan kelola jadwal shift kerja Anda</p>
        </div>
        <button
          onClick={() => setShowSwapModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Tukar Shift
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['schedule', 'shifts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'schedule' ? 'Kalender Jadwal' : 'Daftar Shift'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Schedule Calendar Tab */}
          {activeTab === 'schedule' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Month Navigation */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  ‹
                </button>
                <h3 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h3>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
                >
                  ›
                </button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16 border-b border-r border-gray-50" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const schedule = getScheduleForDate(day)
                  const isToday =
                    day === new Date().getDate() &&
                    month === new Date().getMonth() &&
                    year === new Date().getFullYear()
                  return (
                    <div
                      key={day}
                      className={`h-16 border-b border-r border-gray-50 p-1 ${
                        isToday ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <span className={`text-xs font-medium ${
                        isToday ? 'text-indigo-600' : 'text-gray-700'
                      }`}>
                        {day}
                      </span>
                      {schedule && (
                        <div className="mt-0.5 bg-indigo-100 text-indigo-700 text-xs rounded px-1 truncate">
                          {schedule.shift_name || schedule.shift?.name || 'Shift'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="px-4 py-3 flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-indigo-50 border border-indigo-200 rounded-sm"></span>
                  Hari Ini
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-indigo-100 rounded-sm"></span>
                  Ada Shift
                </span>
              </div>
            </div>
          )}

          {/* Shifts List Tab */}
          {activeTab === 'shifts' && (
            <div className="space-y-3">
              {shifts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">🗓️</p>
                  <p className="font-medium">Tidak ada data shift</p>
                </div>
              ) : (
                shifts.map((shift) => (
                  <div key={shift.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{shift.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {shift.start_time} – {shift.end_time}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
                          {shift.code || 'Shift'}
                        </span>
                        {shift.description && (
                          <p className="text-xs text-gray-400 mt-1">{shift.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Swap Shift Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">🔄 Permintaan Tukar Shift</h3>
            <p className="text-sm text-gray-500">Masukkan detail permintaan tukar shift Anda</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={swapForm.date}
                onChange={(e) => setSwapForm({ ...swapForm, date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
              <textarea
                value={swapForm.note}
                onChange={(e) => setSwapForm({ ...swapForm, note: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tuliskan alasan tukar shift..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSwapModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSwapSubmit}
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

export default ShiftPage
