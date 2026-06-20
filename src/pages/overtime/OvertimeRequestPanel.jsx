import { useCallback, useEffect, useMemo, useState } from 'react'
import overtimeService from '../../services/overtimeService'
import {
  STATUS_BADGE,
  STATUS_LABEL,
  calculateMinutes,
  emptyRequestForm,
  formatDate,
  formatDateTime,
  formatMinutes,
  getErrorMessage,
  getPaginationMeta,
  normalizeRows,
} from './overtime.helpers'

const OvertimeRequestPanel = ({ mode, role, user, activePolicies = [] }) => {
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '', search: '' })
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [requestForm, setRequestForm] = useState(emptyRequestForm)
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actualMinutes, setActualMinutes] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { per_page: 20, page }
      if (filters.status) params.status = filters.status
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      const response = mode === 'review'
        ? await overtimeService.listForReview(params)
        : await overtimeService.listMine(params)
      setRows(normalizeRows(response.data))
      setMeta(getPaginationMeta(response.data))
    } catch (error) {
      setRows([])
      showToast(getErrorMessage(error, 'Gagal memuat data lembur.'), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [filters.date_from, filters.date_to, filters.status, mode, page, showToast])

  useEffect(() => {
    load()
  }, [load])

  const selectedPolicy = useMemo(
    () => activePolicies.find((policy) => String(policy.id) === String(requestForm.overtime_policy_id)),
    [activePolicies, requestForm.overtime_policy_id],
  )

  const plannedMinutes = useMemo(
    () => calculateMinutes(requestForm.planned_start_time, requestForm.planned_end_time),
    [requestForm.planned_end_time, requestForm.planned_start_time],
  )

  const visibleRows = useMemo(() => {
    const keyword = filters.search.trim().toLowerCase()
    if (!keyword) return rows
    return rows.filter((item) => [
      item.employee?.name,
      item.employee?.employee_number,
      item.overtime_policy?.name,
      item.reason,
    ].some((value) => String(value || '').toLowerCase().includes(keyword)))
  }, [filters.search, rows])

  const handleCreate = async () => {
    if (!requestForm.overtime_policy_id || !requestForm.overtime_date || !requestForm.planned_start_time || !requestForm.planned_end_time || !requestForm.reason.trim()) {
      showToast('Lengkapi policy, tanggal, waktu, dan alasan lembur.', 'error')
      return
    }
    if (plannedMinutes < 1) {
      showToast('Durasi lembur tidak valid.', 'error')
      return
    }
    if (selectedPolicy && plannedMinutes > Number(selectedPolicy.daily_max_minutes)) {
      showToast(`Durasi melebihi batas harian ${formatMinutes(selectedPolicy.daily_max_minutes)}.`, 'error')
      return
    }

    setActionLoading('create')
    try {
      await overtimeService.create({ ...requestForm, reason: requestForm.reason.trim() })
      setRequestForm(emptyRequestForm)
      setModal(null)
      showToast('Pengajuan lembur berhasil dikirim.')
      await load()
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal mengirim pengajuan lembur.'), 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (item) => {
    if (!window.confirm('Batalkan pengajuan lembur ini?')) return
    setActionLoading(item.id)
    try {
      await overtimeService.cancel(item.id)
      showToast('Pengajuan lembur dibatalkan.')
      await load()
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal membatalkan pengajuan.'), 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleApprove = async () => {
    if (!selected) return
    setActionLoading(selected.id)
    try {
      await overtimeService.approve(selected.id)
      setModal(null)
      setSelected(null)
      showToast('Pengajuan lembur disetujui.')
      await load()
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal menyetujui pengajuan.'), 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selected) return
    if (!rejectionReason.trim()) {
      showToast('Alasan penolakan wajib diisi.', 'error')
      return
    }
    setActionLoading(selected.id)
    try {
      await overtimeService.reject(selected.id, rejectionReason.trim())
      setModal(null)
      setSelected(null)
      setRejectionReason('')
      showToast('Pengajuan lembur ditolak.')
      await load()
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal menolak pengajuan.'), 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRecordActual = async () => {
    if (!selected) return
    const value = Number(actualMinutes)
    if (!Number.isInteger(value) || value < 0) {
      showToast('Menit aktual harus berupa angka bulat minimal 0.', 'error')
      return
    }
    setActionLoading(selected.id)
    try {
      await overtimeService.recordActual(selected.id, value)
      setModal(null)
      setSelected(null)
      setActualMinutes('')
      showToast('Menit lembur aktual berhasil dicatat.')
      await load()
    } catch (error) {
      showToast(getErrorMessage(error, 'Gagal mencatat menit aktual.'), 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const employeeId = user?.employee?.id ?? user?.employee_id
  const canReviewItem = (item) => mode === 'review'
    && item.status === 'pending'
    && !(role === 'manager' && Number(item.employee_id) === Number(employeeId))

  return (
    <div className="space-y-5">
      {toast && <Toast toast={toast} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Summary label="Total" value={meta.total || rows.length} />
        <Summary label="Pending" value={rows.filter((item) => item.status === 'pending').length} />
        <Summary label="Approved" value={rows.filter((item) => item.status === 'approved').length} />
        <Summary label="Actual tercatat" value={rows.filter((item) => item.actual_minutes !== null && item.actual_minutes !== undefined).length} />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          aria-label="Cari lembur"
          value={filters.search}
          onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
          placeholder="Cari karyawan, policy, alasan..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <select
          aria-label="Filter status lembur"
          value={filters.status}
          onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value })) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Semua status</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <input aria-label="Tanggal mulai filter" type="date" value={filters.date_from} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, date_from: event.target.value })) }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input aria-label="Tanggal akhir filter" type="date" value={filters.date_to} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, date_to: event.target.value })) }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      {mode === 'mine' && (
        <div className="flex justify-end">
          <button onClick={() => setModal('create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + Ajukan Lembur
          </button>
        </div>
      )}

      {isLoading ? <LoadingState /> : visibleRows.length === 0 ? <EmptyState mode={mode} /> : (
        <div className="space-y-3">
          {visibleRows.map((item) => (
            <RequestCard
              key={item.id}
              item={item}
              mode={mode}
              role={role}
              busy={actionLoading === item.id}
              canReview={canReviewItem(item)}
              onCancel={() => handleCancel(item)}
              onApprove={() => { setSelected(item); setModal('approve') }}
              onReject={() => { setSelected(item); setRejectionReason(''); setModal('reject') }}
              onRecordActual={() => { setSelected(item); setActualMinutes(String(item.actual_minutes ?? item.planned_minutes ?? '')); setModal('actual') }}
            />
          ))}
        </div>
      )}

      <Pagination meta={meta} page={page} onPage={setPage} />

      {modal === 'create' && (
        <RequestModal
          form={requestForm}
          setForm={setRequestForm}
          policies={activePolicies}
          selectedPolicy={selectedPolicy}
          plannedMinutes={plannedMinutes}
          busy={actionLoading === 'create'}
          onClose={() => setModal(null)}
          onSubmit={handleCreate}
        />
      )}
      {modal === 'approve' && <ConfirmModal title="Setujui lembur" description="Pengajuan akan berstatus approved dan siap dicatat realisasinya." busy={actionLoading === selected?.id} onClose={() => setModal(null)} onConfirm={handleApprove} confirmLabel="Setujui" />}
      {modal === 'reject' && <InputModal title="Tolak lembur" label="Alasan penolakan" value={rejectionReason} onChange={setRejectionReason} busy={actionLoading === selected?.id} onClose={() => setModal(null)} onConfirm={handleReject} confirmLabel="Tolak" />}
      {modal === 'actual' && <InputModal title="Catat realisasi lembur" label="Menit aktual" type="number" value={actualMinutes} onChange={setActualMinutes} busy={actionLoading === selected?.id} onClose={() => setModal(null)} onConfirm={handleRecordActual} confirmLabel="Simpan" />}
    </div>
  )
}

const RequestCard = ({ item, mode, role, busy, canReview, onCancel, onApprove, onReject, onRecordActual }) => (
  <article className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-gray-900">{mode === 'review' ? item.employee?.name || `Karyawan #${item.employee_id}` : item.overtime_policy?.name || 'Lembur'}</h3>
        <p className="text-sm text-gray-500">{mode === 'review' ? item.overtime_policy?.name || 'Policy lembur' : formatDate(item.date)}</p>
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[item.status] || 'bg-gray-100 text-gray-700'}`}>{STATUS_LABEL[item.status] || item.status}</span>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
      <Info label="Tanggal" value={formatDate(item.date)} />
      <Info label="Rencana" value={`${item.start_time || '-'} - ${item.end_time || '-'}`} />
      <Info label="Durasi" value={formatMinutes(item.planned_minutes)} />
      <Info label="Aktual" value={item.actual_minutes === null || item.actual_minutes === undefined ? '-' : formatMinutes(item.actual_minutes)} />
      <Info label="Tarif" value={`${item.rate_multiplier || item.overtime_policy?.rate_multiplier || '-'}x`} />
    </div>
    <div className="text-sm"><span className="text-gray-500">Alasan:</span> <span className="text-gray-800">{item.reason || '-'}</span></div>
    {item.rejection_reason && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Alasan penolakan: {item.rejection_reason}</div>}
    {item.approved_at && <p className="text-xs text-gray-400">Diproses {formatDateTime(item.approved_at)}</p>}
    <div className="flex flex-wrap gap-2 pt-1">
      {mode === 'mine' && item.status === 'pending' && <button disabled={busy} onClick={onCancel} className="border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">Batalkan</button>}
      {canReview && <button disabled={busy} onClick={onApprove} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">Setujui</button>}
      {canReview && <button disabled={busy} onClick={onReject} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">Tolak</button>}
      {mode === 'review' && ['admin', 'hr'].includes(role) && item.status === 'approved' && <button disabled={busy} onClick={onRecordActual} className="border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">Catat Aktual</button>}
    </div>
  </article>
)

const RequestModal = ({ form, setForm, policies, selectedPolicy, plannedMinutes, busy, onClose, onSubmit }) => (
  <Modal title="Ajukan lembur" onClose={onClose}>
    <div className="space-y-4">
      <Field label="Policy lembur" id="overtime-policy">
        <select id="overtime-policy" value={form.overtime_policy_id} onChange={(event) => setForm((current) => ({ ...current, overtime_policy_id: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">Pilih policy aktif</option>
          {policies.map((policy) => <option key={policy.id} value={policy.id}>{policy.name} · maks {formatMinutes(policy.daily_max_minutes)} · {policy.rate_multiplier}x</option>)}
        </select>
      </Field>
      {policies.length === 0 && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">Belum ada policy lembur aktif. Hubungi Admin/HR.</p>}
      <Field label="Tanggal lembur" id="overtime-date"><input id="overtime-date" type="date" value={form.overtime_date} onChange={(event) => setForm((current) => ({ ...current, overtime_date: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mulai" id="overtime-start"><input id="overtime-start" type="time" value={form.planned_start_time} onChange={(event) => setForm((current) => ({ ...current, planned_start_time: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></Field>
        <Field label="Selesai" id="overtime-end"><input id="overtime-end" type="time" value={form.planned_end_time} onChange={(event) => setForm((current) => ({ ...current, planned_end_time: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></Field>
      </div>
      {(form.planned_start_time && form.planned_end_time) && <p className={`text-sm ${selectedPolicy && plannedMinutes > Number(selectedPolicy.daily_max_minutes) ? 'text-red-600' : 'text-indigo-600'}`}>Durasi rencana: {formatMinutes(plannedMinutes)}</p>}
      <Field label="Alasan lembur" id="overtime-reason"><textarea id="overtime-reason" rows={4} maxLength={500} value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Jelaskan kebutuhan lembur..." /></Field>
      <div className="flex gap-3"><button onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Batal</button><button disabled={busy || policies.length === 0} onClick={onSubmit} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">{busy ? 'Mengirim...' : 'Kirim'}</button></div>
    </div>
  </Modal>
)

const ConfirmModal = ({ title, description, busy, onClose, onConfirm, confirmLabel }) => <Modal title={title} onClose={onClose}><p className="text-sm text-gray-600">{description}</p><ModalActions busy={busy} onClose={onClose} onConfirm={onConfirm} confirmLabel={confirmLabel} /></Modal>
const InputModal = ({ title, label, type = 'text', value, onChange, busy, onClose, onConfirm, confirmLabel }) => <Modal title={title} onClose={onClose}><Field label={label} id="overtime-action-input"><input id="overtime-action-input" type={type} min={type === 'number' ? 0 : undefined} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></Field><ModalActions busy={busy} onClose={onClose} onConfirm={onConfirm} confirmLabel={confirmLabel} /></Modal>
const ModalActions = ({ busy, onClose, onConfirm, confirmLabel }) => <div className="flex gap-3 pt-4"><button onClick={onClose} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Batal</button><button disabled={busy} onClick={onConfirm} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">{busy ? 'Memproses...' : confirmLabel}</button></div>
const Modal = ({ title, onClose, children }) => <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center"><div role="dialog" aria-modal="true" className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"><div className="flex justify-between gap-4 mb-5"><h2 className="text-lg font-semibold text-gray-900">{title}</h2><button aria-label="Tutup modal" onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button></div>{children}</div></div>
const Field = ({ label, id, children }) => <div><label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{children}</div>
const Info = ({ label, value }) => <div><p className="text-xs text-gray-400">{label}</p><p className="text-gray-800 font-medium">{value}</p></div>
const Summary = ({ label, value }) => <div className="bg-white border border-gray-100 rounded-xl p-4"><p className="text-xs text-gray-500">{label}</p><p className="text-2xl font-bold text-gray-900 mt-1">{value}</p></div>
const LoadingState = () => <div className="py-12 flex justify-center"><div className="h-8 w-8 rounded-full border-b-2 border-indigo-600 animate-spin" /></div>
const EmptyState = ({ mode }) => <div className="bg-white border border-gray-100 rounded-xl py-12 text-center text-gray-500"><p className="font-medium">{mode === 'review' ? 'Tidak ada pengajuan dalam scope review.' : 'Belum ada pengajuan lembur.'}</p></div>
const Toast = ({ toast }) => <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-white text-sm ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>{toast.message}</div>
const Pagination = ({ meta, page, onPage }) => meta.lastPage > 1 ? <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Halaman {meta.currentPage} dari {meta.lastPage}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="border rounded-lg px-3 py-1.5 disabled:opacity-40">Sebelumnya</button><button disabled={page >= meta.lastPage} onClick={() => onPage(page + 1)} className="border rounded-lg px-3 py-1.5 disabled:opacity-40">Berikutnya</button></div></div> : null

export default OvertimeRequestPanel
