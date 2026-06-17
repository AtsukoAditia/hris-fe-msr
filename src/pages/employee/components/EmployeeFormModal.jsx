import { X } from 'lucide-react'

const EmployeeFormModal = ({
  isEditing,
  formData,
  departments,
  positions,
  branches,
  managers = [],
  isLoadingDepartments,
  isLoadingPositions,
  isLoadingBranches,
  isLoadingManagers = false,
  errors = {},
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Pegawai' : 'Tambah Pegawai'}</h2>
        <button type="button" onClick={onClose} disabled={isSubmitting} aria-label="Tutup form pegawai" className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"><X className="h-5 w-5" /></button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 p-6">
        <Section title="Informasi Akun">
          <Field label="Nama Lengkap" error={errors.name?.[0]}><input name="name" value={formData.name} onChange={onChange} required className="form-input" /></Field>
          <Field label="Email" error={errors.email?.[0]}><input type="email" name="email" value={formData.email} onChange={onChange} required className="form-input" /></Field>
          <Field label="Role Sistem" error={errors.role?.[0]}><select name="role" value={formData.role} onChange={onChange} className="form-input"><option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option><option value="admin">Admin</option></select></Field>
          <Field label="Status" error={errors.status?.[0]}><select name="status" value={formData.status} onChange={onChange} className="form-input"><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></Field>
        </Section>

        <Section title="Data Pribadi">
          <Field label="NIK" error={errors.nik?.[0]}><input name="nik" value={formData.nik} onChange={onChange} required className="form-input" /></Field>
          <Field label="No. Telepon" error={errors.phone?.[0]}><input name="phone" value={formData.phone} onChange={onChange} className="form-input" /></Field>
          <Field label="Tanggal Lahir" error={errors.birth_date?.[0]}><input type="date" name="birth_date" value={formData.birth_date} onChange={onChange} className="form-input" /></Field>
          <Field label="Gender" error={errors.gender?.[0]}><select name="gender" value={formData.gender} onChange={onChange} className="form-input"><option value="">Pilih Gender</option><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></Field>
          <div className="md:col-span-2"><Field label="Alamat" error={errors.address?.[0]}><textarea name="address" value={formData.address} onChange={onChange} rows={3} className="form-input resize-none" /></Field></div>
        </Section>

        <Section title="Data Kepegawaian">
          <Field label="Departemen" error={errors.department_id?.[0]}>
            <select name="department_id" value={formData.department_id} onChange={onChange} required disabled={isLoadingDepartments || departments.length === 0} className="form-input disabled:bg-gray-100">
              <option value="">{isLoadingDepartments ? 'Memuat departemen...' : 'Pilih Departemen'}</option>
              {departments.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
            </select>
          </Field>
          <Field label="Jabatan" error={errors.position_id?.[0]}>
            <select name="position_id" value={formData.position_id} onChange={onChange} required disabled={!formData.department_id || isLoadingPositions || positions.length === 0} className="form-input disabled:bg-gray-100">
              <option value="">{!formData.department_id ? 'Pilih departemen terlebih dahulu' : isLoadingPositions ? 'Memuat jabatan...' : 'Pilih Jabatan'}</option>
              {positions.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
            </select>
            {formData.department_id && !isLoadingPositions && positions.length === 0 && <p className="mt-1 text-xs text-amber-600">Belum ada jabatan aktif pada departemen ini.</p>}
          </Field>
          <Field label="Cabang / Lokasi Kerja" error={errors.branch_id?.[0]}>
            <select name="branch_id" value={formData.branch_id} onChange={onChange} required disabled={isLoadingBranches || branches.length === 0} className="form-input disabled:bg-gray-100">
              <option value="">{isLoadingBranches ? 'Memuat cabang...' : 'Pilih Cabang / Lokasi'}</option>
              {branches.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
            </select>
            {!isLoadingBranches && branches.length === 0 && <p className="mt-1 text-xs text-amber-600">Belum ada cabang aktif yang dapat dipilih.</p>}
          </Field>
          <Field label="Atasan Langsung" error={errors.manager_id?.[0]}>
            <select name="manager_id" value={formData.manager_id} onChange={onChange} disabled={isLoadingManagers} className="form-input disabled:bg-gray-100">
              <option value="">{isLoadingManagers ? 'Memuat pilihan atasan...' : 'Tanpa Atasan Langsung'}</option>
              {managers.map((item) => <option key={item.id} value={item.id}>{item.label || `${item.name || 'Karyawan'} — ${item.position_name || 'Tanpa Jabatan'} (${item.employee_number || '-'})`}</option>)}
            </select>
            {!isLoadingManagers && <p className="mt-1 text-xs text-gray-500">Opsional untuk pimpinan tertinggi atau pegawai tanpa atasan langsung.</p>}
          </Field>
          <Field label="Tanggal Bergabung" error={errors.join_date?.[0]}><input type="date" name="join_date" value={formData.join_date} onChange={onChange} required className="form-input" /></Field>
          <Field label="Tipe Kerja" error={errors.employment_type?.[0]}><select name="employment_type" value={formData.employment_type} onChange={onChange} className="form-input"><option value="permanent">Permanent</option><option value="contract">Contract</option><option value="internship">Internship</option></select></Field>
        </Section>

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700">Batal</button>
          <button type="submit" disabled={isSubmitting || !formData.department_id || !formData.position_id || !formData.branch_id} className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : isEditing ? 'Perbarui' : 'Simpan'}</button>
        </div>
      </form>
    </div>
  </div>
)

const Section = ({ title, children }) => <div><h3 className="mb-3 text-sm font-semibold text-gray-900">{title}</h3><div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div></div>
const Field = ({ label, error, children }) => <div><label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>{children}{error && <p className="mt-1 text-sm text-red-600">{error}</p>}</div>

export default EmployeeFormModal
