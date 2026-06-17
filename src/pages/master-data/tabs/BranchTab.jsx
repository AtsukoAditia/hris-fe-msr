import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, CircleCheck, CircleX, Plus, Search } from 'lucide-react'
import branchService from '../../../services/branchService'
import { initialBranchForm, mapBranchFormToPayload, normalizeBranchRows } from '../branch.helpers'
import BranchFormModal from '../components/BranchFormModal'
import BranchTable from '../components/BranchTable'

const BranchTab = ({ canManage }) => {
  const [branches, setBranches] = useState([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState(initialBranchForm)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchBranches = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = { status }
      if (search.trim()) params.search = search.trim()
      const response = await branchService.getAll(params)
      setBranches(normalizeBranchRows(response))
    } catch (error) {
      console.error(error)
      setBranches([])
      notify(error.response?.data?.message || 'Gagal memuat data cabang.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [notify, search, status])

  useEffect(() => {
    const timer = window.setTimeout(fetchBranches, 300)
    return () => window.clearTimeout(timer)
  }, [fetchBranches])

  const stats = useMemo(() => ({
    total: branches.length,
    active: branches.filter((item) => item.is_active).length,
    inactive: branches.filter((item) => !item.is_active).length,
  }), [branches])

  const openCreate = () => {
    setSelected(null)
    setErrors({})
    setFormData(initialBranchForm)
    setShowModal(true)
  }

  const openEdit = (branch) => {
    setSelected(branch)
    setErrors({})
    setFormData({
      code: branch.code,
      name: branch.name,
      address: branch.address || '',
      latitude: branch.latitude ?? '',
      longitude: branch.longitude ?? '',
      radius_meters: String(branch.radius_meters ?? 100),
      timezone: branch.timezone || 'Asia/Jakarta',
      is_active: branch.is_active,
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
      const payload = mapBranchFormToPayload(formData)
      if (selected) {
        await branchService.update(selected.id, payload)
        notify('Cabang berhasil diperbarui.')
      } else {
        await branchService.create(payload)
        notify('Cabang berhasil ditambahkan.')
      }
      setShowModal(false)
      await fetchBranches()
    } catch (error) {
      console.error(error)
      setErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal menyimpan cabang.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (branch) => {
    if (!window.confirm(`Hapus cabang ${branch.name}? Data akan di-soft-delete.`)) return
    try {
      await branchService.delete(branch.id)
      notify('Cabang berhasil dihapus.')
      await fetchBranches()
    } catch (error) {
      console.error(error)
      notify(error.response?.data?.message || 'Gagal menghapus cabang.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-bold text-gray-900">Master Cabang / Lokasi Kerja</h2><p className="text-sm text-gray-600">Kelola lokasi kerja dan batas area absensi.</p></div>
        {canManage && <button type="button" onClick={openCreate} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" />Tambah Cabang</button>}
      </div>

      {!canManage && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">Manager memiliki akses baca. Perubahan cabang hanya dapat dilakukan Admin dan HR.</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Total Ditampilkan" value={stats.total} />
        <StatCard icon={<CircleCheck className="h-5 w-5" />} label="Aktif" value={stats.active} />
        <StatCard icon={<CircleX className="h-5 w-5" />} label="Nonaktif" value={stats.inactive} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari kode, nama, alamat, atau timezone..." className="form-input pl-10" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input"><option value="all">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><BranchTable branches={branches} isLoading={isLoading} canManage={canManage} onEdit={openEdit} onDelete={handleDelete} /></div>

      {showModal && canManage && <BranchFormModal isEditing={Boolean(selected)} formData={formData} errors={errors} isSubmitting={isSubmitting} onChange={handleChange} onClose={() => !isSubmitting && setShowModal(false)} onSubmit={handleSubmit} />}
      {toast && <div className={`fixed right-4 top-4 z-[60] rounded-lg px-6 py-3 text-white shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>}
    </div>
  )
}

const StatCard = ({ icon, label, value }) => <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">{icon}</div><div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div></div>

export default BranchTab
