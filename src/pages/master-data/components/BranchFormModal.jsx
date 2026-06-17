import { X } from 'lucide-react'

const BranchFormModal = ({
  isEditing,
  formData,
  errors = {},
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}) => {
  const fieldError = (field) => errors?.[field]?.[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Cabang' : 'Tambah Cabang'}</h2>
            <p className="mt-1 text-sm text-gray-500">Atur identitas dan area absensi lokasi kerja.</p>
          </div>
          <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Tutup form cabang" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-50"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field id="branch-code" label="Kode Cabang" error={fieldError('code')}>
              <input id="branch-code" name="code" value={formData.code} onChange={onChange} required maxLength={20} placeholder="Contoh: HQ-JKT" className="form-input uppercase" />
            </Field>
            <Field id="branch-name" label="Nama Cabang" error={fieldError('name')}>
              <input id="branch-name" name="name" value={formData.name} onChange={onChange} required maxLength={100} placeholder="Contoh: Head Office Jakarta" className="form-input" />
            </Field>
            <div className="md:col-span-2">
              <Field id="branch-address" label="Alamat" error={fieldError('address')}>
                <textarea id="branch-address" name="address" value={formData.address} onChange={onChange} rows={3} maxLength={1000} placeholder="Alamat lengkap lokasi kerja" className="form-input resize-none" />
              </Field>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Konfigurasi Area Absensi</h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field id="branch-latitude" label="Latitude" error={fieldError('latitude')}>
                <input id="branch-latitude" type="number" step="0.0000001" min="-90" max="90" name="latitude" value={formData.latitude} onChange={onChange} placeholder="-6.2000000" className="form-input" />
              </Field>
              <Field id="branch-longitude" label="Longitude" error={fieldError('longitude')}>
                <input id="branch-longitude" type="number" step="0.0000001" min="-180" max="180" name="longitude" value={formData.longitude} onChange={onChange} placeholder="106.8166667" className="form-input" />
              </Field>
              <Field id="branch-radius" label="Radius Absensi (meter)" error={fieldError('radius_meters')}>
                <input id="branch-radius" type="number" min="1" max="50000" name="radius_meters" value={formData.radius_meters} onChange={onChange} required className="form-input" />
              </Field>
              <Field id="branch-timezone" label="Timezone" error={fieldError('timezone')}>
                <input id="branch-timezone" name="timezone" value={formData.timezone} onChange={onChange} required placeholder="Asia/Jakarta" className="form-input" />
              </Field>
            </div>
            <p className="mt-3 text-xs text-gray-500">Latitude dan longitude harus diisi bersamaan. Radius menentukan batas area absensi.</p>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4">
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={onChange} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
            <span><span className="block text-sm font-medium text-gray-900">Cabang aktif</span><span className="block text-xs text-gray-500">Cabang aktif dapat dipilih pada form karyawan.</span></span>
          </label>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Field = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

export default BranchFormModal
