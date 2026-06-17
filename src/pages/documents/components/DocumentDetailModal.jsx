import { Download, X } from 'lucide-react'
import { formatFileSize, statusMeta } from '../document.helpers'

const DocumentDetailModal = ({ document, loading, error, downloading, onClose, onDownload }) => {
  const status = statusMeta(document?.expiry_status)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="document-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-gray-200 p-5 sm:p-6">
          <div className="min-w-0">
            <h2 id="document-detail-title" className="break-words text-xl font-semibold text-gray-900">Detail Dokumen</h2>
            <p className="mt-1 text-sm text-gray-500">Metadata lengkap dari backend.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup detail dokumen" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </header>

        <div className="p-5 sm:p-6">
          {loading && <p className="py-10 text-center text-gray-500">Memuat detail dokumen...</p>}
          {!loading && error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {!loading && !error && document && (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="break-words text-lg font-semibold text-gray-900">{document.title}</h3>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                  {document.is_confidential && <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">Rahasia</span>}
                </div>
                <p className="mt-1 text-sm text-gray-500">{document.category_label || document.category}</p>
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Nama File" value={document.file?.original_name} />
                <Detail label="MIME Type" value={document.file?.mime_type} />
                <Detail label="Ekstensi" value={document.file?.extension} />
                <Detail label="Ukuran" value={formatFileSize(document.file?.size_bytes)} />
                <Detail label="Versi" value={`v${document.file?.version || 1}`} />
                <Detail label="Tanggal Terbit" value={document.issue_date} />
                <Detail label="Tanggal Kedaluwarsa" value={document.expiry_date} />
                <Detail label="Sisa Hari" value={document.days_until_expiry == null ? null : String(document.days_until_expiry)} />
                <Detail label="Diunggah Oleh" value={document.uploaded_by?.name} />
                <Detail label="Waktu Upload" value={formatDateTime(document.created_at)} />
                <Detail label="Terakhir Diubah" value={formatDateTime(document.updated_at)} />
                <Detail label="SHA-256" value={document.file?.checksum_sha256} mono />
              </dl>

              {document.description && <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Deskripsi</p><p className="mt-1 text-sm text-gray-700">{document.description}</p></div>}
              {document.labels?.length > 0 && <div><p className="text-xs font-medium uppercase tracking-wide text-gray-400">Label</p><div className="mt-2 flex flex-wrap gap-2">{document.labels.map((label) => <span key={label} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">{label}</span>)}</div></div>}
            </div>
          )}
        </div>

        <footer className="flex justify-end gap-3 border-t border-gray-200 p-5 sm:p-6">
          <button type="button" onClick={onClose} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200">Tutup</button>
          {document && !loading && !error && <button type="button" onClick={() => onDownload(document)} disabled={downloading} className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"><Download className="mr-2 h-4 w-4" />{downloading ? 'Mengunduh...' : 'Unduh'}</button>}
        </footer>
      </div>
    </div>
  )
}

const Detail = ({ label, value, mono = false }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
    <dd className={`mt-1 break-all text-sm text-gray-700 ${mono ? 'font-mono text-xs' : ''}`}>{value || '-'}</dd>
  </div>
)

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID')
}

export default DocumentDetailModal
