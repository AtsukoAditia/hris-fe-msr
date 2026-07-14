import { useCallback, useEffect, useState } from 'react'
import trainingService from '../../services/trainingService'
import { getErrorMessage } from '../payroll/payroll.helpers'
import { Alert, LoadingState } from '../payroll/ui'

const CATEGORIES = ['Semua', 'Teknis', 'Soft Skill', 'Kepatuhan', 'Keselamatan', 'Manajemen']

const statusConfig = {
  open:       { label: 'Terbuka',    cls: 'bg-green-100 text-green-800' },
  draft:      { label: 'Draft',      cls: 'bg-gray-100 text-gray-600' },
  ongoing:    { label: 'Berlangsung', cls: 'bg-blue-100 text-blue-800' },
  completed:  { label: 'Selesai',    cls: 'bg-gray-100 text-gray-500' },
  closed:     { label: 'Ditutup',    cls: 'bg-gray-100 text-gray-500' },
  cancelled:  { label: 'Batal',      cls: 'bg-red-100 text-red-700' },
}

const enrollmentStatusConfig = {
  registered:  { label: 'Terdaftar',     cls: 'bg-blue-100 text-blue-800' },
  confirmed:   { label: 'Dikonfirmasi',   cls: 'bg-green-100 text-green-800' },
  cancelled:   { label: 'Dibatalkan',     cls: 'bg-gray-100 text-gray-500' },
  attended:    { label: 'Hadir',          cls: 'bg-green-100 text-green-800' },
  absent:      { label: 'Tidak Hadir',    cls: 'bg-red-100 text-red-700' },
}

export default function TrainingListPage() {
  const [activeTab, setActiveTab] = useState('available') // 'available' | 'mine'
  const [filterCat, setFilterCat] = useState('Semua')
  const [trainings, setTrainings] = useState([])
  const [myEnrollments, setMyEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [enrolling, setEnrolling] = useState(null)

  const loadAvailable = useCallback(async () => {
    setLoading(true)
    setAlert({ type: 'success', message: '' })
    try {
      const params = filterCat !== 'Semua' ? { category: filterCat } : {}
      const res = await trainingService.list(params)
      setTrainings(Array.isArray(res?.data) ? res.data : res?.data?.data ?? [])
    } catch (e) {
      setAlert({ type: 'error', message: getErrorMessage(e, 'Gagal memuat daftar pelatihan.') })
    } finally {
      setLoading(false)
    }
  }, [filterCat])

  const loadMine = useCallback(async () => {
    setLoading(true)
    setAlert({ type: 'success', message: '' })
    try {
      const res = await trainingService.myEnrollments()
      setMyEnrollments(Array.isArray(res?.data) ? res.data : [])
    } catch (e) {
      setAlert({ type: 'error', message: getErrorMessage(e, 'Gagal memuat pelatihan saya.') })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'available') loadAvailable()
    else loadMine()
  }, [activeTab, loadAvailable, loadMine])

  const enroll = async (training) => {
    setEnrolling(training.id)
    setAlert({ type: 'success', message: '' })
    try {
      await trainingService.enroll(training.id)
      setAlert({ type: 'success', message: 'Berhasil mendaftar pelatihan.' })
      loadAvailable()
    } catch (e) {
      setAlert({ type: 'error', message: getErrorMessage(e, 'Gagal mendaftar pelatihan.') })
    } finally {
      setEnrolling(null)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Pelatihan</h1>
        <p className="mt-1 text-sm text-gray-500">Ikuti pelatihan yang tersedia dan lihat riwayat pendaftaran Anda.</p>
      </header>

      <Alert alert={alert} onClose={() => setAlert({ type: 'success', message: '' })} />

      <div className="flex gap-2 border-b border-gray-200">
        <Tab label="Tersedia" active={activeTab === 'available'} onClick={() => setActiveTab('available')} />
        <Tab label="Pendaftaran Saya" active={activeTab === 'mine'} onClick={() => setActiveTab('mine')} />
      </div>

      {activeTab === 'available' && (
        <>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setFilterCat(cat)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition ${filterCat === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {cat}
              </button>
            ))}
          </div>

          {loading ? <LoadingState /> : trainings.length === 0 ? (
            <EmptyState title="Tidak ada pelatihan" description="Tidak ada pelatihan yang sesuai filter." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trainings.map((t) => <TrainingCard key={t.id} training={t} onEnroll={enroll} enrolling={enrolling === t.id} />)}
            </div>
          )}
        </>
      )}

      {activeTab === 'mine' && (
        loading ? <LoadingState /> : myEnrollments.length === 0 ? (
          <EmptyState title="Belum ada pendaftaran" description="Daftar pelatihan yang tersedia dan ikuti." />
        ) : (
          <div className="space-y-3">
            {myEnrollments.map((e) => <EnrollmentCard key={e.id} enrollment={e} />)}
          </div>
        )
      )}
    </div>
  )
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`border-b-2 px-1 py-2 text-sm font-medium transition ${active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
      {label}
    </button>
  )
}

function TrainingCard({ training, onEnroll, enrolling }) {
  const sc = statusConfig[training.status] ?? statusConfig.draft
  const availableSlots = training.max_participants - (training.active_enrollments_count ?? 0)
  const isOpen = training.status === 'open' && availableSlots > 0

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
          <h3 className="mt-2 font-semibold text-gray-900 leading-snug">{training.title}</h3>
        </div>
        {training.category && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{training.category}</span>}
      </div>

      {training.description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{training.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
        {training.mode && <div>📍 {training.mode}</div>}
        {training.trainer && <div>👤 {training.trainer}</div>}
        {training.start_date && <div>📅 {formatDate(training.start_date)}</div>}
        {training.location && <div>🏢 {training.location}</div>}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span>{availableSlots} dari {training.max_participants} slot tersedia</span>
        {training.cost > 0 && <span>Rp {(training.cost / 100).toLocaleString('id-ID')}</span>}
      </div>

      {isOpen ? (
        <button onClick={() => onEnroll(training)} disabled={enrolling}
          className="mt-4 w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {enrolling ? 'Mendaftar...' : 'Daftar Sekarang'}
        </button>
      ) : (
        <div className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-center text-sm text-gray-500">
          {training.status !== 'open' ? 'Tidak tersedia' : 'Slot penuh'}
        </div>
      )}
    </article>
  )
}

function EnrollmentCard({ enrollment }) {
  const t = enrollment.training ?? {}
  const sc = enrollmentStatusConfig[enrollment.status] ?? enrollmentStatusConfig.registered
  const trainingStatus = statusConfig[t.status] ?? statusConfig.draft

  return (
    <article className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-gray-900 truncate">{t.title || '-'}</h3>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${sc.cls}`}>{sc.label}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${trainingStatus.cls}`}>{trainingStatus.label}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
          {t.start_date && <span>📅 {formatDate(t.start_date)}</span>}
          {t.mode && <span>📍 {t.mode}</span>}
          {t.trainer && <span>👤 {t.trainer}</span>}
        </div>
      </div>
    </article>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
      <p className="font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
  )
}

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
