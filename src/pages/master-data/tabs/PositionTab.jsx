import { useCallback, useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, CircleCheck, CircleX, Plus, Search } from 'lucide-react'
import departmentService from '../../../services/departmentService'
import positionService from '../../../services/positionService'
import { normalizeDepartmentRows } from '../department.helpers'
import { initialPositionForm, mapPositionFormToPayload, normalizePositionRows } from '../position.helpers'
import PositionFormModal from '../components/PositionFormModal'
import PositionTable from '../components/PositionTable'

const PositionTab = ({ canManage }) => {
  const [positions, setPositions] = useState([])
  const [departments, setDepartments] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [departmentId, setDepartmentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState(initialPositionForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await departmentService.getAll({ active_only: true })
      setDepartments(normalizeDepartmentRows(response))
    } catch (error) {
      console.error(error)
      notify(error.response?.data?.message || 'Gagal memuat departemen.', 'error')
    }
  }, [notify])

  const fetchPositions = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { status }
      if (search.trim()) params.search = search.trim()
      if (departmentId) params.department_id = departmentId
      const response = await positionService.getAll(params)
      setPositions(normalizePositionRows(response))
    } catch (error) {
      console.error(error)
      setPositions([])
      notify(error.response?.data?.message || 'Gagal memuat data jabatan.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [departmentId, notify, search, status])

  useEffect(() => { fetchDepartments() }, [fetchDepartments])
  useEffect(() => {
    const timer = window.setTimeout(fetchPositions, 300)
    return () => window.clearTimeout(timer)
  }, [fetchPositions])

  const stats = useMemo(() => ({
    total: positions.length,
    active: positions.filter((item) => item.is_active).length,
    inactive: positions.filter((item) => !item.is_active).length,
  }), [positions])

  const openCreate = () => {
    setIsEditing(false)
    setSelected(null)
    setErrors({})
    setFormData({ ...initialPositionForm, department_id: departmentId })
    setShowModal(true)
  }

  const openEdit = (position) => {
    setIsEditing(true)
    setSelected(position)
    setErrors({})
    setFormData({
      department_id: String(position.department_id || ''),
      code: position.code,
      name: position.name,
      description: position.description || '',
      is_active: position.is_active,
    })
    setShowModal(true)
  }

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    try {
      const payload = mapPositionFormToPayload(formData)
      if (isEditing && selected) {
        await positionService.update(selected.id, payload)
        notify('Jabatan berhasil diperbarui.')
      } else {
        await positionService.create(payload)
        notify('Jabatan berhasil ditambahkan.')
      }
      setShowModal(false)
      await fetchPositions()
    } catch (error) {
      console.error(error)
      setErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal menyimpan jabatan.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (position) => {
    if (!window.confirm(`Hapus jabatan ${position.name}? Data akan di-soft-delete.`)) return
    try {
      await positionService.delete(position.id)
      notify('Jabatan berhasil dihapus.')
      await fetchPositions()
    } catch (error) {
      console.error(error)
      notify(error.response?.data?.message || 'Gagal menghapus jabatan.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Master Jabatan</h2><p className="text-sm text-gray-600">Kelola jabatan berdasarkan departemen.</p></div>
        {canManage && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Tambah Jabatan</button>}
      </div>

      {!canManage && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Manager memiliki akses baca. Perubahan jabatan hanya dapat dilakukan Admin dan HR.</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<BriefcaseBusiness className="h-5 w-5" />} label="Total Ditampilkan" value={stats.total} />
        <StatCard icon={<CircleCheck className="h-5 w-5" />} label="Aktif" value={stats.active} />
        <StatCard icon={<CircleX className="h-5 w-5" />} label="Nonaktif" value={stats.inactive} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
          <div className="relative lg:col-span-2"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode, jabatan, atau departemen..." className="form-input pl-10" /></div>
          <select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)} className="form-input"><option value="">Semua Departemen</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input"><option value="all">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><PositionTable positions={positions} isLoading={isLoading} canManage={canManage} onEdit={openEdit} onDelete={handleDelete} /></div>

      {showModal && canManage && <PositionFormModal isEditing={isEditing} formData={formData} departments={departments} errors={errors} isSubmitting={isSubmitting} onChange={handleChange} onClose={() => !isSubmitting && setShowModal(false)} onSubmit={handleSubmit} />}
      {toast && <div className={`fixed right-4 top-4 z-[60] rounded-lg px-6 py-3 text-white shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>}
    </div>
  )
}

const StatCard = ({ icon, label, value }) => <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">{icon}</div><div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div></div>

export default PositionTab
