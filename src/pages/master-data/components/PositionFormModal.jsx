import { X } from 'lucide-react'

const PositionFormModal = ({
  isEditing,
  formData,
  departments,
  errors,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}) => {
  const fieldError = (field) => errors?.[field]?.[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Jabatan' : 'Tambah Jabatan'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Jabatan wajib berada di satu departemen aktif.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Tutup form jabatan">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <Field label="Departemen" error={fieldError('department_id')}>
            <select name="department_id" value={formData.department_id} onChange={onChange} required className="form-input">
              <option value="">Pilih Departemen</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>{department.code} — {department.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Kode Jabatan" error={fieldError('code')}>
            <input name="code" value={formData.code} onChange={onChange} required maxLength={20} placeholder="Contoh: SOFTWARE-ENGINEER" className="form-input uppercase" />
          </Field>

          <Field label="Nama Jabatan" error={fieldError('name')}>
            <input name="name" value={formData.name} onChange={onChange} required maxLength={100} placeholder="Contoh: Software Engineer" className="form-input" />
          </Field>

          <Field label="Deskripsi" error={fieldError('description')}>
            <textarea name="description" value={formData.description} onChange={onChange} rows={4} maxLength={1000} className="form-input resize-none" />
          </Field>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
            <span>
              <span className="block text-sm font-medium text-gray-900">Jabatan aktif</span>
              <span className="block text-xs text-gray-500">Jabatan aktif dapat dipilih pada form karyawan.</span>
            </span>
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSubmitting || departments.length === 0} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Field = ({ label, error, children }) => (
  <div>
    <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

export default PositionFormModal
