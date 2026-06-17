import { FilePenLine, X } from 'lucide-react'

const ReplaceDocumentModal = ({ document, file, error, submitting, onFileChange, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="replace-document-title" className="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <header className="flex items-start justify-between border-b border-gray-200 p-5 sm:p-6">
        <div>
          <h2 id="replace-document-title" className="text-xl font-semibold text-gray-900">Ganti File Dokumen</h2>
          <p className="mt-1 text-sm text-gray-500">Versi {document?.file?.version || 1} akan dinaikkan tanpa mengubah metadata.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Tutup form ganti file" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
      </header>
      <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
          <FilePenLine className="mb-2 h-5 w-5" />
          File lama akan dihapus setelah file baru berhasil disimpan.
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-gray-700">File Baru</span>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onFileChange} required className="form-input file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700" />
          {file && <span className="mt-2 block text-xs text-gray-500">{file.name}</span>}
          {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
        <footer className="flex justify-end gap-3 border-t border-gray-200 pt-5">
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700">Batal</button>
          <button type="submit" disabled={submitting || !file} className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{submitting ? 'Mengganti...' : 'Ganti File'}</button>
        </footer>
      </form>
    </div>
  </div>
)

export default ReplaceDocumentModal
