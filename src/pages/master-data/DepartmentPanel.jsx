import { useCallback, useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import departmentService from '../../services/departmentService'
import { useAuthStore } from '../../store/authStore'
import DepartmentFormModal from './components/DepartmentFormModal'
import DepartmentTable from './components/DepartmentTable'
import { getValidationErrors, initialDepartmentForm, mapDepartmentFormToPayload, normalizeDepartmentRows } from './department.helpers'

const DepartmentPanel = () => {
  const { user } = useAuthStore()
  const canManage = ['admin', 'hr'].includes(user?.role)
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(initialDepartmentForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { status }
      if (search.trim()) params.search = search.trim()
      setRows(normalizeDepartmentRows(await departmentService.getAll(params)))
    } catch (error) {
      setRows([])
      setMessage(error.response?.data?.message || 'Gagal memuat departemen.')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    const timer = window.setTimeout(load, 300)
    return () => window.clearTimeout(timer)
  }, [load])

  const create = () => {
    setSelected(null)
    setForm(initialDepartmentForm)
    setErrors({})
    setOpen(true)
  }

  const edit = (item) => {
    setSelected(item)
    setForm({ code: item.code, name: item.name, description: item.description || '', is_active: item.is_active })
    setErrors({})
    setOpen(true)
  }

  const change = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      const payload = mapDepartmentFormToPayload(form)
      if (selected) await departmentService.update(selected.id, payload)
      else await departmentService.create(payload)
      setOpen(false)
      setMessage(selected ? 'Departemen berhasil diperbarui.' : 'Departemen berhasil ditambahkan.')
      await load()
    } catch (error) {
      setErrors(getValidationErrors(error))
      setMessage(error.response?.data?.message || 'Gagal menyimpan departemen.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Hapus departemen ${item.name}?`)) return
    await departmentService.delete(item.id)
    setMessage('Departemen berhasil dihapus.')
    await load()
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Master Departemen</h2><p className="text-sm text-gray-600">Kelola struktur departemen perusahaan.</p></div>
        {canManage && <button type="button" onClick={create} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white"><Plus className="mr-2 h-4 w-4" />Tambah Departemen</button>}
      </div>
      {!canManage && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Manager memiliki akses baca.</p>}
      <div className="grid gap-3 rounded-xl border bg-white p-5 md:grid-cols-3">
        <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari departemen..." className="form-input pl-10" /></div>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input"><option value="all">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white"><DepartmentTable departments={rows} isLoading={loading} canManage={canManage} onEdit={edit} onDelete={remove} /></div>
      {open && <DepartmentFormModal isEditing={Boolean(selected)} formData={form} errors={errors} isSubmitting={submitting} onChange={change} onClose={() => setOpen(false)} onSubmit={submit} />}
      {message && <div className="fixed right-4 top-4 z-[60] rounded-lg bg-gray-900 px-5 py-3 text-white shadow-lg">{message}</div>}
    </section>
  )
}

export default DepartmentPanel
