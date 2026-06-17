import { X } from 'lucide-react'

const DocumentFormModal = ({ document, categories, formData, errors, submitting, onChange, onClose, onSubmit }) => {
  const title = document ? 'Edit Metadata Dokumen' : 'Unggah Dokumen Karyawan'
  const today = localDateValue(new Date())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="document-form-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <header className="flex items-start justify-between border-b border-gray-200 p-5 sm:p-6">
          <div>
            <h2 id="document-form-title" className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">PDF/JPG/PNG/WEBP, maksimal 10 MB.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup form dokumen" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </header>

        <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
          {!document && (
            <Field label="File Dokumen" error={fieldError(errors, 'file')}>
              <input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={onChange} required className="form-input file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700" />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kategori" error={fieldError(errors, 'category')}>
              <select name="category" value={formData.category} onChange={onChange} required className="form-input">
                <option value="">Pilih Kategori</option>
                {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </Field>
            <Field label="Judul Dokumen" error={fieldError(errors, 'title')}>
              <input name="title" value={formData.title} onChange={onChange} required maxLength={150} className="form-input" />
            </Field>
          </div>
          <Field label="Deskripsi" error={fieldError(errors, 'description')}>
            <textarea name="description" value={formData.description} onChange={onChange} rows={3} maxLength={2000} className="form-input resize-none" />
          </Field>
          <Field label="Label" hint="Pisahkan dengan koma, maksimal 10 label; setiap label maksimal 50 karakter." error={fieldError(errors, 'labels')}>
            <input name="labels" value={formData.labels} onChange={onChange} className="form-input" placeholder="kontrak, permanen" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal Terbit" error={fieldError(errors, 'issue_date')}>
              <input type="date" name="issue_date" value={formData.issue_date} onChange={onChange} max={today} className="form-input" />
            </Field>
            <Field label="Tanggal Kedaluwarsa" error={fieldError(errors, 'expiry_date')}>
              <input type="date" name="expiry_date" value={formData.expiry_date} onChange={onChange} min={formData.issue_date || undefined} className="form-input" />
            </Field>
          </div>
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
            <input aria-label="Dokumen rahasia" type="checkbox" name="is_confidential" checked={formData.is_confidential} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600" />
            <span><span className="block text-sm font-medium text-gray-900">Dokumen rahasia</span><span className="block text-xs text-gray-500">Tetap hanya dapat diakses melalui endpoint terautentikasi.</span></span>
          </label>

          <footer className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={submitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">{submitting ? 'Menyimpan...' : document ? 'Perbarui Metadata' : 'Unggah Dokumen'}</button>
          </footer>
        </form>
      </div>
    </div>
  )
}

const Field = ({ label, hint, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
)

const fieldError = (errors, field) => errors?.[field]?.[0] || errors?.[field]

const localDateValue = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default DocumentFormModal
