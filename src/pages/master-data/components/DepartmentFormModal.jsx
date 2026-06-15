import { X } from 'lucide-react'

const DepartmentFormModal = ({ isEditing, formData, errors, isSubmitting, onChange, onClose, onSubmit }) => {
  const fieldError = (field) => errors?.[field]?.[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? 'Edit Departemen' : 'Tambah Departemen'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">Gunakan kode singkat yang konsisten untuk data karyawan.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Tutup form departemen">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div>
            <label htmlFor="department-code" className="mb-2 block text-sm font-medium text-gray-700">Kode</label>
            <input
              id="department-code"
              name="code"
              value={formData.code}
              onChange={onChange}
              maxLength={20}
              required
              placeholder="Contoh: IT"
              className={`w-full rounded-lg border px-4 py-2 uppercase focus:ring-2 focus:ring-blue-500 ${fieldError('code') ? 'border-red-400' : 'border-gray-300'}`}
            />
            {fieldError('code') && <p className="mt-1 text-sm text-red-600">{fieldError('code')}</p>}
          </div>

          <div>
            <label htmlFor="department-name" className="mb-2 block text-sm font-medium text-gray-700">Nama Departemen</label>
            <input
              id="department-name"
              name="name"
              value={formData.name}
              onChange={onChange}
              maxLength={100}
              required
              placeholder="Contoh: Information Technology"
              className={`w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 ${fieldError('name') ? 'border-red-400' : 'border-gray-300'}`}
            />
            {fieldError('name') && <p className="mt-1 text-sm text-red-600">{fieldError('name')}</p>}
          </div>

          <div>
            <label htmlFor="department-description" className="mb-2 block text-sm font-medium text-gray-700">Deskripsi</label>
            <textarea
              id="department-description"
              name="description"
              value={formData.description}
              onChange={onChange}
              maxLength={1000}
              rows={4}
              placeholder="Jelaskan fungsi utama departemen"
              className={`w-full resize-none rounded-lg border px-4 py-2 focus:ring-2 focus:ring-blue-500 ${fieldError('description') ? 'border-red-400' : 'border-gray-300'}`}
            />
            {fieldError('description') && <p className="mt-1 text-sm text-red-600">{fieldError('description')}</p>}
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={onChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-gray-900">Departemen aktif</span>
              <span className="block text-xs text-gray-500">Departemen aktif dapat dipilih pada form karyawan.</span>
            </span>
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50">
              Batal
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DepartmentFormModal
