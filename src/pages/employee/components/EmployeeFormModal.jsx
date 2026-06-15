import { X } from 'lucide-react'

const EmployeeFormModal = ({
  isEditing,
  formData,
  departments,
  isLoadingDepartments,
  errors = {},
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}) => {
  const departmentError = errors.department_id?.[0]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Pegawai' : 'Tambah Pegawai'}</h2>
          <button type="button" onClick={onClose} disabled={isSubmitting} className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50" aria-label="Tutup form pegawai">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Informasi Akun</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Nama Lengkap" error={errors.name?.[0]}>
                <input type="text" name="name" value={formData.name} onChange={onChange} required className="form-input" />
              </Field>
              <Field label="Email" error={errors.email?.[0]}>
                <input type="email" name="email" value={formData.email} onChange={onChange} required className="form-input" />
              </Field>
              <Field label="Role Sistem" error={errors.role?.[0]}>
                <select name="role" value={formData.role} onChange={onChange} required className="form-input">
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
              <Field label="Status" error={errors.status?.[0]}>
                <select name="status" value={formData.status} onChange={onChange} className="form-input">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </Field>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="NIK" error={errors.nik?.[0]}>
                <input type="text" name="nik" value={formData.nik} onChange={onChange} required className="form-input" />
              </Field>
              <Field label="No. Telepon" error={errors.phone?.[0]}>
                <input type="text" name="phone" value={formData.phone} onChange={onChange} className="form-input" />
              </Field>
              <Field label="Tanggal Lahir" error={errors.birth_date?.[0]}>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={onChange} className="form-input" />
              </Field>
              <Field label="Gender" error={errors.gender?.[0]}>
                <select name="gender" value={formData.gender} onChange={onChange} className="form-input">
                  <option value="">Pilih Gender</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Alamat" error={errors.address?.[0]}>
                  <textarea name="address" value={formData.address} onChange={onChange} rows={3} className="form-input resize-none" />
                </Field>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Data Kepegawaian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Jabatan" error={errors.position?.[0]}>
                <input type="text" name="position" value={formData.position} onChange={onChange} required className="form-input" />
              </Field>
              <Field label="Departemen" error={departmentError}>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={onChange}
                  required
                  disabled={isLoadingDepartments || departments.length === 0}
                  className="form-input disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">{isLoadingDepartments ? 'Memuat departemen...' : 'Pilih Departemen'}</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>{department.code} — {department.name}</option>
                  ))}
                </select>
                {!isLoadingDepartments && departments.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">Belum ada departemen aktif.</p>
                )}
              </Field>
              <Field label="Tanggal Bergabung" error={errors.join_date?.[0]}>
                <input type="date" name="join_date" value={formData.join_date} onChange={onChange} required className="form-input" />
              </Field>
              <Field label="Tipe Kerja" error={errors.employment_type?.[0]}>
                <select name="employment_type" value={formData.employment_type} onChange={onChange} className="form-input">
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSubmitting || isLoadingDepartments || departments.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
)

export default EmployeeFormModal
