import { Download, Edit2, FileCheck2, FilePenLine, FileText, Trash2 } from 'lucide-react'
import { formatFileSize, statusMeta } from '../document.helpers'

const DocumentList = ({ documents, loading, canManage, downloadingId, onDownload, onEdit, onReplace, onDelete }) => {
  if (loading) return <div className="rounded-xl border bg-white p-10 text-center text-gray-500 shadow-sm">Memuat dokumen...</div>
  if (documents.length === 0) return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <FileText className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 font-medium text-gray-700">Belum ada dokumen</p>
      <p className="mt-1 text-sm text-gray-500">Dokumen yang sesuai filter akan muncul di sini.</p>
    </div>
  )

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {documents.map((document) => {
        const status = statusMeta(document.expiry_status)
        return (
          <article key={document.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-indigo-50 p-2.5"><FileCheck2 className="h-5 w-5 text-indigo-600" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-words font-semibold text-gray-900">{document.title}</h2>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
                  {document.is_confidential && <span className="rounded-full bg-violet-100 px-2 py-1 text-xs font-medium text-violet-700">Rahasia</span>}
                </div>
                <p className="mt-1 text-sm text-gray-500">{document.category_label || document.category}</p>
              </div>
            </div>

            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <Detail label="Nama File" value={document.file?.original_name || '-'} />
              <Detail label="Ukuran" value={formatFileSize(document.file?.size_bytes)} />
              <Detail label="Versi" value={`v${document.file?.version || 1}`} />
              <Detail label="Tanggal Terbit" value={document.issue_date || '-'} />
              <Detail label="Kedaluwarsa" value={document.expiry_date || '-'} />
              <Detail label="Sisa Hari" value={document.days_until_expiry == null ? '-' : String(document.days_until_expiry)} />
            </dl>

            {document.description && <p className="mt-4 text-sm text-gray-600">{document.description}</p>}
            {document.labels?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {document.labels.map((label) => <span key={label} className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">{label}</span>)}
              </div>
            )}

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4">
              <button type="button" onClick={() => onDownload(document)} disabled={downloadingId === document.id} className="inline-flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <Download className="mr-2 h-4 w-4" />{downloadingId === document.id ? 'Mengunduh...' : 'Unduh'}
              </button>
              {canManage && <button type="button" onClick={() => onEdit(document)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-indigo-600" title="Edit metadata"><Edit2 className="h-4 w-4" /></button>}
              {canManage && <button type="button" onClick={() => onReplace(document)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-amber-600" title="Ganti file"><FilePenLine className="h-4 w-4" /></button>}
              {canManage && <button type="button" onClick={() => onDelete(document)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:text-red-600" title="Hapus dokumen"><Trash2 className="h-4 w-4" /></button>}
            </div>
          </article>
        )
      })}
    </section>
  )
}

const Detail = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
    <dd className="mt-1 break-words text-gray-700">{value}</dd>
  </div>
)

export default DocumentList
