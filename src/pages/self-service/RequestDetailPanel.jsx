import { X } from 'lucide-react'
import { FIELD_LABELS, formatFieldValue } from './selfService.helpers'
import { StatusBadge } from './RequestList'

const RequestDetailPanel = ({ request, mode = 'self', note, busy, error, onNoteChange, onAccept, onDecline, onClose }) => {
  if (!request) return null

  const canAct = mode === 'review' && request.can_review

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-0 sm:items-center sm:justify-center sm:p-4">
      <section className="max-h-[95vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-3xl sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-gray-200 p-4 sm:p-6">
          <div>
            <p className="text-sm text-gray-500">Request #{request.id}</p>
            <h2 className="mt-1 text-xl font-semibold text-gray-900">Detail Perubahan Profil</h2>
            <div className="mt-3"><StatusBadge status={request.status} /></div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Tutup"><X className="h-5 w-5" /></button>
        </header>

        <div className="space-y-5 p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Employee" value={request.employee?.name || '-'} />
            <Info label="Employee Number" value={request.employee?.employee_number || '-'} />
            <Info label="Requester" value={request.requester?.name || '-'} />
            <Info label="Reviewer" value={request.reviewer?.name || '-'} />
          </div>

          <div className="space-y-3">
            {(request.changes || []).map((item) => (
              <div key={item.field} className="rounded-lg border border-gray-200 p-4">
                <p className="font-medium text-gray-900">{FIELD_LABELS[item.field] || item.field}</p>
                <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2">
                  <Info label="Saat Ini" value={formatFieldValue(item.current_value)} />
                  <Info label="Diajukan" value={formatFieldValue(item.requested_value)} />
                </div>
              </div>
            ))}
          </div>

          <Info label="Alasan" value={request.reason || '-'} multiline />
          {request.review_note && <Info label="Catatan" value={request.review_note} multiline />}

          {canAct && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">Catatan</span>
                <textarea value={note} onChange={(event) => onNoteChange(event.target.value)} rows={3} className="form-input resize-none bg-white" />
              </label>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button type="button" disabled={busy} onClick={onDecline} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50">Tolak</button>
                <button type="button" disabled={busy} onClick={onAccept} className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50">Setujui</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const Info = ({ label, value, multiline = false }) => (
  <div>
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
    <p className={`mt-1 text-sm text-gray-800 ${multiline ? 'whitespace-pre-wrap rounded-lg bg-gray-50 p-3' : ''}`}>{value}</p>
  </div>
)

export default RequestDetailPanel
