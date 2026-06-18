import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock3, FilePenLine, Search, XCircle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import profileChangeService from '../../services/profileChangeService'
import { APPROVAL_PROFILE_FIELDS, PROFILE_FIELD_LABELS } from '../profile/profileFieldPolicy'

const emptyChanges = Object.fromEntries(APPROVAL_PROFILE_FIELDS.map((field) => [field, '']))

const ProfileChangeRequestsPage = ({ reviewMode = false }) => {
  const user = useAuthStore((state) => state.user)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0 })
  const [filters, setFilters] = useState({ status: '', search: '', per_page: 15 })
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ changes: emptyChanges, reason: '' })
  const [errors, setErrors] = useState({})
  const [reviewNote, setReviewNote] = useState('')

  const canReview = reviewMode && ['admin', 'hr'].includes(user?.role)

  const notify = (text, type = 'success') => {
    setMessage({ text, type })
    window.setTimeout(() => setMessage(null), 3000)
  }

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))
      const response = reviewMode
        ? await profileChangeService.listReviews(params)
        : await profileChangeService.listMine(params)
      const payload = response.data || {}
      setItems(payload.data || [])
      setMeta(payload)
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal memuat permintaan perubahan.', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, reviewMode])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const changedPayload = useMemo(() => Object.fromEntries(
    Object.entries(form.changes).filter(([, value]) => value !== ''),
  ), [form.changes])

  const submitRequest = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      await profileChangeService.create({ changes: changedPayload, reason: form.reason })
      setForm({ changes: emptyChanges, reason: '' })
      notify('Permintaan perubahan profil berhasil diajukan.')
      await loadItems()
    } catch (error) {
      setErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal mengajukan perubahan profil.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const cancelRequest = async (item) => {
    if (!window.confirm('Batalkan permintaan perubahan ini?')) return
    try {
      await profileChangeService.cancel(item.id)
      notify('Permintaan berhasil dibatalkan.')
      setSelected(null)
      await loadItems()
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal membatalkan permintaan.', 'error')
    }
  }

  const review = async (action) => {
    if (!selected) return
    if (action === 'reject' && !reviewNote.trim()) {
      notify('Catatan penolakan wajib diisi.', 'error')
      return
    }
    setSubmitting(true)
    try {
      if (action === 'approve') await profileChangeService.approve(selected.id, { review_note: reviewNote || null })
      else await profileChangeService.reject(selected.id, { review_note: reviewNote })
      notify(action === 'approve' ? 'Permintaan berhasil disetujui.' : 'Permintaan berhasil ditolak.')
      setSelected(null)
      setReviewNote('')
      await loadItems()
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal memproses permintaan.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">{reviewMode ? 'Review Perubahan Profil' : 'Perubahan Profil'}</h1>
        <p className="mt-1 text-gray-600">{reviewMode ? 'Tinjau perubahan data sensitif yang diajukan karyawan.' : 'Ajukan perubahan data identitas yang membutuhkan persetujuan Admin/HR.'}</p>
      </header>

      {!reviewMode && <RequestForm form={form} setForm={setForm} errors={errors} submitting={submitting} onSubmit={submitRequest} />}

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center">
          <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="form-input sm:max-w-48">
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          {reviewMode && (
            <label className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} className="form-input pl-9" placeholder="Cari nama, email, atau employee number" />
            </label>
          )}
          <span className="text-sm text-gray-500 sm:ml-auto">{meta.total || 0} permintaan</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Memuat permintaan...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-500">Belum ada permintaan perubahan profil.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <button key={item.id} type="button" onClick={() => { setSelected(item); setReviewNote('') }} className="flex w-full flex-col gap-3 p-4 text-left hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2"><StatusIcon status={item.status} /><span className="font-medium text-gray-900">{reviewMode ? item.employee?.name : `Permintaan #${item.id}`}</span></div>
                  <p className="mt-1 text-sm text-gray-500">{item.changes?.map((change) => PROFILE_FIELD_LABELS[change.field] || change.field).join(', ')}</p>
                  {reviewMode && <p className="mt-1 text-xs text-gray-400">{item.employee?.employee_number} · {item.employee?.work_email}</p>}
                </div>
                <div className="flex items-center gap-3"><StatusBadge status={item.status} /><span className="text-xs text-gray-400">{formatDate(item.created_at)}</span></div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <DetailModal
          item={selected}
          reviewMode={reviewMode}
          canReview={canReview && selected.can_review}
          reviewNote={reviewNote}
          setReviewNote={setReviewNote}
          submitting={submitting}
          onClose={() => setSelected(null)}
          onCancel={() => cancelRequest(selected)}
          onReview={review}
        />
      )}

      {message && <div className={`fixed right-4 top-4 z-[70] max-w-sm rounded-lg px-5 py-3 text-sm text-white shadow-lg ${message.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{message.text}</div>}
    </div>
  )
}

const RequestForm = ({ form, setForm, errors, submitting, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div><h2 className="text-lg font-semibold text-gray-900">Ajukan Perubahan</h2><p className="mt-1 text-sm text-gray-500">Isi hanya data yang benar-benar berubah.</p></div>
    <div className="grid gap-4 md:grid-cols-2">
      {APPROVAL_PROFILE_FIELDS.map((field) => (
        <label key={field} className={field.includes('address') ? 'md:col-span-2' : ''}>
          <span className="mb-2 block text-sm font-medium text-gray-700">{PROFILE_FIELD_LABELS[field]}</span>
          {field.includes('address') ? (
            <textarea rows={3} value={form.changes[field]} onChange={(event) => setForm((current) => ({ ...current, changes: { ...current.changes, [field]: event.target.value } }))} className="form-input resize-none" />
          ) : (
            <input type={field === 'birth_date' ? 'date' : 'text'} value={form.changes[field]} onChange={(event) => setForm((current) => ({ ...current, changes: { ...current.changes, [field]: event.target.value } }))} className="form-input" />
          )}
          {errors?.[`changes.${field}`] && <span className="mt-1 block text-sm text-red-600">{errors[`changes.${field}`][0]}</span>}
        </label>
      ))}
    </div>
    <label className="block"><span className="mb-2 block text-sm font-medium text-gray-700">Alasan Perubahan</span><textarea rows={3} value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} className="form-input resize-none" required />{errors?.reason && <span className="mt-1 block text-sm text-red-600">{errors.reason[0]}</span>}</label>
    <div className="flex justify-end"><button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"><FilePenLine className="h-4 w-4" />{submitting ? 'Mengajukan...' : 'Ajukan Perubahan'}</button></div>
  </form>
)

const DetailModal = ({ item, reviewMode, canReview, reviewNote, setReviewNote, submitting, onClose, onCancel, onReview }) => (
  <div className="fixed inset-0 z-[65] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl">
      <div className="flex items-start justify-between border-b border-gray-200 p-5"><div><h2 className="text-lg font-semibold text-gray-900">Detail Permintaan #{item.id}</h2><p className="mt-1 text-sm text-gray-500">{reviewMode ? item.employee?.name : formatDate(item.created_at)}</p></div><button type="button" onClick={onClose} className="rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-100">Tutup</button></div>
      <div className="space-y-5 p-5">
        <StatusBadge status={item.status} />
        <div><h3 className="text-sm font-semibold text-gray-700">Alasan</h3><p className="mt-1 text-sm text-gray-600">{item.reason}</p></div>
        <div className="space-y-3">{item.changes?.map((change) => <div key={change.field} className="rounded-lg border border-gray-200 p-3"><p className="text-sm font-medium text-gray-900">{PROFILE_FIELD_LABELS[change.field] || change.field}</p><div className="mt-2 grid gap-2 text-sm sm:grid-cols-2"><div><span className="text-xs text-gray-400">Saat ini</span><p className="break-words text-gray-600">{displayValue(change.current_value)}</p></div><div><span className="text-xs text-gray-400">Diajukan</span><p className="break-words font-medium text-indigo-700">{displayValue(change.requested_value)}</p></div></div></div>)}</div>
        {item.review_note && <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-medium text-gray-500">Catatan Reviewer</p><p className="mt-1 text-sm text-gray-700">{item.review_note}</p></div>}
        {canReview && <label className="block"><span className="mb-2 block text-sm font-medium text-gray-700">Catatan Review</span><textarea rows={3} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} className="form-input resize-none" placeholder="Wajib diisi saat menolak" /></label>}
      </div>
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-5 sm:flex-row sm:justify-end">
        {!reviewMode && item.can_cancel && <button type="button" onClick={onCancel} className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50">Batalkan Permintaan</button>}
        {canReview && <><button type="button" disabled={submitting} onClick={() => onReview('reject')} className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">Tolak</button><button type="button" disabled={submitting} onClick={() => onReview('approve')} className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Setujui</button></>}
      </div>
    </div>
  </div>
)

const StatusIcon = ({ status }) => status === 'approved' ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : status === 'rejected' || status === 'cancelled' ? <XCircle className="h-5 w-5 text-red-500" /> : <Clock3 className="h-5 w-5 text-amber-500" />
const StatusBadge = ({ status }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status === 'approved' ? 'bg-green-100 text-green-700' : status === 'pending' ? 'bg-amber-100 text-amber-700' : status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{({ pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak', cancelled: 'Dibatalkan' })[status] || status}</span>
const formatDate = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '-'
const displayValue = (value) => value === null || value === '' ? '-' : String(value)

export default ProfileChangeRequestsPage
