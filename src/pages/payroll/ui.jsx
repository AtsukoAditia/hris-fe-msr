export const inputClass = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100'
export const selectClass = `${inputClass} bg-white`
export const primaryButton = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50'
export const secondaryButton = 'rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50'
export const dangerButton = 'rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50'

export const Alert = ({ alert, onClose }) => {
  if (!alert?.message) return null
  const tone = alert.type === 'error'
    ? 'border-red-200 bg-red-50 text-red-700'
    : 'border-green-200 bg-green-50 text-green-700'

  return (
    <div className={`flex items-start justify-between gap-3 rounded-xl border p-4 ${tone}`}>
      <p className="text-sm">{alert.message}</p>
      <button type="button" onClick={onClose} aria-label="Tutup notifikasi" className="font-bold opacity-60 hover:opacity-100">×</button>
    </div>
  )
}

export const LoadingState = () => (
  <div className="flex justify-center py-12">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
  </div>
)

export const EmptyState = ({ title, description }) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
    <h3 className="font-semibold text-gray-800">{title}</h3>
    {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
  </div>
)

export const Field = ({ label, error, required, children }) => (
  <label className="block space-y-1">
    <span className="text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500"> *</span>}</span>
    {children}
    {error && <span className="block text-xs text-red-600">{Array.isArray(error) ? error[0] : error}</span>}
  </label>
)

export const Modal = ({ open, title, onClose, children, size = 'max-w-2xl' }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Tutup modal" className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-labelledby="payroll-modal-title" className={`relative max-h-[92vh] w-full ${size} overflow-y-auto rounded-2xl bg-white shadow-xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 id="payroll-modal-title" className="text-lg font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Tutup" className="text-2xl leading-none text-gray-400 hover:text-gray-700">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export const Pagination = ({ pagination, onPageChange, disabled }) => {
  if (!pagination || pagination.last_page <= 1) return null

  return (
    <div className="mt-4 flex flex-col items-start justify-between gap-3 text-sm text-gray-600 sm:flex-row sm:items-center">
      <span>Halaman {pagination.current_page} dari {pagination.last_page} · {pagination.total} data</span>
      <div className="flex gap-2">
        <button type="button" className={secondaryButton} disabled={disabled || pagination.current_page <= 1} onClick={() => onPageChange(pagination.current_page - 1)}>Sebelumnya</button>
        <button type="button" className={secondaryButton} disabled={disabled || pagination.current_page >= pagination.last_page} onClick={() => onPageChange(pagination.current_page + 1)}>Berikutnya</button>
      </div>
    </div>
  )
}
