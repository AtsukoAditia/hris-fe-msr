import { Link } from 'react-router-dom'
import { LockKeyhole, Save } from 'lucide-react'

const ProfileForm = ({ formData, errors, isSubmitting, onChange, onSubmit, isAdministrativeView = false }) => {
  const locked = !isAdministrativeView

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!isAdministrativeView && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Data identitas tidak dapat diubah langsung</p>
              <p className="mt-1 text-sm text-amber-700">Gunakan permintaan perubahan agar Admin/HR dapat memverifikasi data sensitif.</p>
            </div>
          </div>
          <Link to="/profile/changes" className="mt-3 inline-flex rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 sm:mt-0">Ajukan Perubahan</Link>
        </div>
      )}

      <Section title="Kontak dan Domisili" description={isAdministrativeView ? 'Admin/HR dapat memperbarui seluruh data profil.' : 'Data berikut dapat Anda perbarui langsung.'}>
        <Field label="Nomor Telepon" error={fieldError(errors, 'phone')}><input name="phone" value={formData.phone} onChange={onChange} className="form-input" /></Field>
        <Field label="Email Pribadi" error={fieldError(errors, 'personal_email')}><input type="email" name="personal_email" value={formData.personal_email} onChange={onChange} className="form-input" /></Field>
        <Field label="Telepon Alternatif" error={fieldError(errors, 'alternate_phone')}><input name="alternate_phone" value={formData.alternate_phone} onChange={onChange} className="form-input" /></Field>
        <Field label="Alamat Singkat" error={fieldError(errors, 'address')} className="md:col-span-2"><textarea name="address" value={formData.address} onChange={onChange} rows={3} className="form-input resize-none" /></Field>
        <Field label="Alamat Domisili" error={fieldError(errors, 'domicile_address')} className="md:col-span-2"><textarea name="domicile_address" value={formData.domicile_address} onChange={onChange} rows={3} className="form-input resize-none" /></Field>
        <Field label="Kota / Kabupaten" error={fieldError(errors, 'city')}><input name="city" value={formData.city} onChange={onChange} className="form-input" /></Field>
        <Field label="Provinsi" error={fieldError(errors, 'province')}><input name="province" value={formData.province} onChange={onChange} className="form-input" /></Field>
        <Field label="Kode Pos" error={fieldError(errors, 'postal_code')}><input name="postal_code" value={formData.postal_code} onChange={onChange} className="form-input" /></Field>
      </Section>

      <Section title="Data Identitas" description={locked ? 'Field terkunci dan hanya dapat diubah melalui permintaan.' : 'Informasi identitas karyawan.'}>
        <Field label="Tempat Lahir" error={fieldError(errors, 'place_of_birth')}><input disabled={locked} name="place_of_birth" value={formData.place_of_birth} onChange={onChange} className={inputClass(locked)} /></Field>
        <Field label="Tanggal Lahir" error={fieldError(errors, 'birth_date')}><input disabled={locked} type="date" name="birth_date" value={formData.birth_date} onChange={onChange} className={inputClass(locked)} /></Field>
        <Field label="Jenis Kelamin" error={fieldError(errors, 'gender')}><select disabled={locked} name="gender" value={formData.gender} onChange={onChange} className={inputClass(locked)}><option value="">Pilih</option><option value="male">Laki-laki</option><option value="female">Perempuan</option></select></Field>
        <Field label="Status Pernikahan" error={fieldError(errors, 'marital_status')}><select disabled={locked} name="marital_status" value={formData.marital_status} onChange={onChange} className={inputClass(locked)}><option value="">Pilih</option><option value="single">Belum Menikah</option><option value="married">Menikah</option><option value="divorced">Cerai</option><option value="widowed">Duda / Janda</option></select></Field>
        <Field label="Golongan Darah" error={fieldError(errors, 'blood_type')}><select disabled={locked} name="blood_type" value={formData.blood_type} onChange={onChange} className={inputClass(locked)}><option value="">Pilih</option>{['A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
        <Field label="Agama" error={fieldError(errors, 'religion')}><input disabled={locked} name="religion" value={formData.religion} onChange={onChange} className={inputClass(locked)} /></Field>
        <Field label="Kewarganegaraan" error={fieldError(errors, 'nationality')}><input disabled={locked} name="nationality" value={formData.nationality} onChange={onChange} className={inputClass(locked)} /></Field>
        <Field label="Alamat Identitas" error={fieldError(errors, 'identity_address')} className="md:col-span-2"><textarea disabled={locked} name="identity_address" value={formData.identity_address} onChange={onChange} rows={3} className={`${inputClass(locked)} resize-none`} /></Field>
      </Section>

      <Section title="Identitas Administratif" description="Nomor pajak dan kepesertaan jaminan sosial.">
        <Field label="Nomor Pajak / NPWP" error={fieldError(errors, 'tax_number')}><input disabled={locked} name="tax_number" value={formData.tax_number} onChange={onChange} className={inputClass(locked)} /></Field>
        <Field label="Nomor Jaminan Sosial" error={fieldError(errors, 'social_security_number')}><input disabled={locked} name="social_security_number" value={formData.social_security_number} onChange={onChange} className={inputClass(locked)} /></Field>
        <Field label="Nomor Jaminan Kesehatan" error={fieldError(errors, 'health_insurance_number')}><input disabled={locked} name="health_insurance_number" value={formData.health_insurance_number} onChange={onChange} className={inputClass(locked)} /></Field>
      </Section>

      <div className="flex justify-end">
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"><Save className="mr-2 h-4 w-4" />{isSubmitting ? 'Menyimpan...' : 'Simpan Profil'}</button>
      </div>
    </form>
  )
}

const inputClass = (locked) => `form-input ${locked ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`
const Section = ({ title, description, children }) => <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-5"><h2 className="text-lg font-semibold text-gray-900">{title}</h2><p className="mt-1 text-sm text-gray-500">{description}</p></div><div className="grid gap-4 md:grid-cols-2">{children}</div></section>
const Field = ({ label, error, children, className = '' }) => <label className={`block ${className}`}><span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>{children}{error && <span className="mt-1 block text-sm text-red-600">{error}</span>}</label>
const fieldError = (errors, field) => errors?.[field]?.[0] || errors?.[field]

export default ProfileForm
