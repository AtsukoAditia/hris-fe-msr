import { FilePenLine } from 'lucide-react'
import { APPROVAL_REQUIRED_FIELDS, FIELD_LABELS, changeFieldError, fieldError } from './selfService.helpers'

const DataChangeForm = ({ form, errors, submitting, onChange, onSubmit }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
        <FilePenLine className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Ajukan Perubahan Profil</h2>
        <p className="mt-1 text-sm text-gray-500">Field tertentu perlu review Admin/HR sebelum masuk ke profil.</p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
      <Field label="Field" error={fieldError(errors, 'changes')}>
        <select name="field" value={form.field} onChange={onChange} className="form-input">
          {APPROVAL_REQUIRED_FIELDS.map((field) => <option key={field} value={field}>{FIELD_LABELS[field]}</option>)}
        </select>
      </Field>
      <Field label="Nilai Baru" error={changeFieldError(errors, form.field)}>
        <input name="value" value={form.value} onChange={onChange} className="form-input" placeholder="Masukkan nilai baru" />
      </Field>
      <Field label="Alasan" error={fieldError(errors, 'reason')} className="md:col-span-2">
        <textarea name="reason" value={form.reason} onChange={onChange} rows={3} className="form-input resize-none" />
      </Field>
      <div className="md:col-span-2 flex justify-end">
        <button type="submit" disabled={submitting || !form.reason.trim()} className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
          {submitting ? 'Mengajukan...' : 'Ajukan'}
        </button>
      </div>
    </form>
  </section>
)

const Field = ({ label, error, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
)

export default DataChangeForm
