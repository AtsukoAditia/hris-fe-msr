import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

const AccountSecurityPage = () => {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const [form, setForm] = useState({ current: '', next: '', confirmation: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const change = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setErrors({})
    setMessage('')

    if (form.next !== form.confirmation) {
      setErrors({ confirmation: 'Konfirmasi tidak sama.' })
      return
    }

    setSubmitting(true)
    try {
      await authService.changePassword({
        current_password: form.current,
        password: form.next,
        password_confirmation: form.confirmation,
      })
      clearAuth()
      navigate('/login', { replace: true, state: { message: 'Kredensial berhasil diperbarui. Silakan masuk kembali.' } })
    } catch (error) {
      const apiErrors = error.response?.data?.errors || {}
      setErrors({
        current: apiErrors.current_password?.[0],
        next: apiErrors.password?.[0],
        confirmation: apiErrors.password_confirmation?.[0],
      })
      setMessage(error.response?.data?.message || 'Gagal memperbarui kredensial.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Keamanan Akun</h1>
        <p className="mt-1 text-gray-600">Perbarui kredensial akun. Setelah berhasil, Anda harus masuk kembali.</p>
      </header>
      <form onSubmit={submit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {message && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>}
        <SecretField label="Kredensial Saat Ini" name="current" value={form.current} onChange={change} error={errors.current} />
        <SecretField label="Kredensial Baru" name="next" value={form.next} onChange={change} error={errors.next} />
        <SecretField label="Konfirmasi Kredensial Baru" name="confirmation" value={form.confirmation} onChange={change} error={errors.confirmation} />
        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 sm:w-auto">
            {submitting ? 'Memperbarui...' : 'Perbarui Kredensial'}
          </button>
        </div>
      </form>
    </div>
  )
}

const SecretField = ({ label, name, value, onChange, error }) => (
  <label className="block">
    <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
    <input type="password" name={name} value={value} onChange={onChange} className="form-input" autoComplete="off" required />
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
)

export default AccountSecurityPage
