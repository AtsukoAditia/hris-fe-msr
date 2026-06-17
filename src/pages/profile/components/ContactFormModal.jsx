import { X } from 'lucide-react'

const ContactFormModal = ({ contact, formData, errors, isSubmitting, onChange, onClose, onSubmit }) => {
  const title = contact ? 'Edit Kontak Darurat' : 'Tambah Kontak Darurat'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-200 p-5 sm:p-6">
          <div>
            <h2 id="contact-modal-title" className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">Simpan orang yang dapat dihubungi pada kondisi mendesak.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup form kontak darurat" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
          <Field label="Nama Lengkap" error={fieldError(errors, 'name')}>
            <input name="name" value={formData.name} onChange={onChange} required className="form-input" />
          </Field>
          <Field label="Hubungan" error={fieldError(errors, 'relationship')}>
            <select name="relationship" value={formData.relationship} onChange={onChange} required className="form-input">
              <option value="">Pilih Hubungan</option>
              <option value="parent">Orang Tua</option>
              <option value="spouse">Pasangan</option>
              <option value="sibling">Saudara Kandung</option>
              <option value="child">Anak</option>
              <option value="relative">Kerabat</option>
              <option value="friend">Teman</option>
              <option value="other">Lainnya</option>
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nomor Telepon" error={fieldError(errors, 'phone')}>
              <input name="phone" value={formData.phone} onChange={onChange} required className="form-input" />
            </Field>
            <Field label="Telepon Alternatif" error={fieldError(errors, 'alternate_phone')}>
              <input name="alternate_phone" value={formData.alternate_phone} onChange={onChange} className="form-input" />
            </Field>
          </div>
          <Field label="Email" error={fieldError(errors, 'email')}>
            <input type="email" name="email" value={formData.email} onChange={onChange} className="form-input" />
          </Field>
          <Field label="Alamat" error={fieldError(errors, 'address')}>
            <textarea name="address" value={formData.address} onChange={onChange} rows={3} className="form-input resize-none" />
          </Field>
          <Field label="Catatan" error={fieldError(errors, 'notes')}>
            <textarea name="notes" value={formData.notes} onChange={onChange} rows={3} className="form-input resize-none" />
          </Field>
          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
            <input aria-label="Jadikan kontak utama" type="checkbox" name="is_primary" checked={formData.is_primary} onChange={onChange} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600" />
            <span>
              <span className="block text-sm font-medium text-gray-900">Jadikan kontak utama</span>
              <span className="block text-xs text-gray-500">Kontak utama sebelumnya akan otomatis diganti.</span>
            </span>
          </label>
          {fieldError(errors, 'emergency_contacts') && <p className="text-sm text-red-600">{fieldError(errors, 'emergency_contacts')}</p>}

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50">
              {isSubmitting ? 'Menyimpan...' : contact ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
)

const fieldError = (errors, field) => errors?.[field]?.[0] || errors?.[field]

export default ContactFormModal
