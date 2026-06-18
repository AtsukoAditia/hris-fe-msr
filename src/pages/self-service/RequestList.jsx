import { Eye, XCircle } from 'lucide-react'
import { FIELD_LABELS, STATUS_BADGES, STATUS_LABELS, formatFieldValue } from './selfService.helpers'

const RequestList = ({ requests, loading, pagination, page, onPageChange, onDetail, onCancel }) => (
  <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="border-b border-gray-200 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">Riwayat Request</h2>
      <p className="mt-1 text-sm text-gray-500">Pantau status perubahan profil yang sudah diajukan.</p>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Tanggal</th>
            <th className="px-4 py-3">Perubahan</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {loading && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Memuat request...</td></tr>}
          {!loading && requests.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Belum ada request.</td></tr>}
          {!loading && requests.map((request) => (
            <tr key={request.id}>
              <td className="whitespace-nowrap px-4 py-4 text-gray-600">{formatDate(request.created_at)}</td>
              <td className="px-4 py-4">
                <div className="space-y-1">
                  {(request.changes || []).slice(0, 2).map((item) => (
                    <p key={item.field} className="text-gray-700"><span className="font-medium">{FIELD_LABELS[item.field] || item.field}</span>: {formatFieldValue(item.current_value)} → {formatFieldValue(item.requested_value)}</p>
                  ))}
                </div>
              </td>
              <td className="px-4 py-4"><StatusBadge status={request.status} /></td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => onDetail(request)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50" aria-label="Lihat detail"><Eye className="h-4 w-4" /></button>
                  {request.can_cancel && <button type="button" onClick={() => onCancel(request)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Batalkan"><XCircle className="h-4 w-4" /></button>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {pagination?.last_page > 1 && (
      <div className="flex items-center justify-center gap-3 border-t border-gray-200 p-4">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Sebelumnya</button>
        <span className="text-sm text-gray-600">Halaman {pagination.current_page} dari {pagination.last_page}</span>
        <button type="button" disabled={page >= pagination.last_page} onClick={() => onPageChange(page + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Berikutnya</button>
      </div>
    )}
  </section>
)

export const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_BADGES[status] || STATUS_BADGES.cancelled}`}>
    {STATUS_LABELS[status] || status || '-'}
  </span>
)

const formatDate = (value) => value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'

export default RequestList
