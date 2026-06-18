import { KeyRound } from 'lucide-react'
import { fieldError } from './selfService.helpers'

const CredentialCard = ({ form, errors, submitting, onChange, onSubmit }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-5 flex items-start gap-3">
      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
        <KeyRound className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Keamanan Akun</h2>
        <p className="mt-1 text-sm text-gray-500">Setelah kredensial berhasil diperbarui, sesi akan diakhiri dan Anda perlu masuk kembali.</p>
      </div>
    </div>

    <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-3">
      <Field label="Kredensial Saat Ini" error={fieldError(errors, 'current_password')}>
        <input type="password" name="current_password" value={form.current_password} onChange={onChange} className="form-input" autoComplete="current-password" />
      </Field>
      <Field label="Kredensial Baru" error={fieldError(errors, 'password')}>
        <input type="password" name="password" value={form.password} onChange={onChange} className="form-input" autoComplete="new-password" />
      </Field>
      <Field label="Konfirmasi Kredensial Baru" error={fieldError(errors, 'password_confirmation')}>
        <input type="password" name="password_confirmation" value={form.password_confirmation} onChange={onChange} className="form-input" autoComplete="new-password" />
      </Field>

      <div className="md:col-span-3 flex justify-end">
        <button type="submit" disabled={submitting || Object.values(form).some((value) => !String(value || '').trim())} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
          {submitting ? 'Memproses...' : 'Perbarui Kredensial'}
        </button>
      </div>
    </form>
  </section>
)

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
)

export default CredentialCard
