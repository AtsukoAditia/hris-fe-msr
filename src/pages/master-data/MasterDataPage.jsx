import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, CircleCheck, CircleX, Plus, Search } from 'lucide-react'
import departmentService from '../../services/departmentService'
import { useAuthStore } from '../../store/authStore'
import DepartmentFormModal from './components/DepartmentFormModal'
import DepartmentTable from './components/DepartmentTable'
import {
  getValidationErrors,
  initialDepartmentForm,
  mapDepartmentFormToPayload,
  normalizeDepartmentRows,
} from './department.helpers'

const MasterDataPage = () => {
  const { user } = useAuthStore()
  const canManage = ['admin', 'hr'].includes(user?.role)

  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState(null)
  const [formData, setFormData] = useState(initialDepartmentForm)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true)

    try {
      const params = { status: statusFilter }
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const response = await departmentService.getAll(params)
      setDepartments(normalizeDepartmentRows(response))
    } catch (error) {
      console.error(error)
      setDepartments([])
      showToast(error.response?.data?.message || 'Gagal memuat data departemen.', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(fetchDepartments, 300)
    return () => window.clearTimeout(timer)
  }, [fetchDepartments])

  const stats = useMemo(() => ({
    total: departments.length,
    active: departments.filter((department) => department.is_active).length,
    inactive: departments.filter((department) => !department.is_active).length,
  }), [departments])

  const openCreateModal = () => {
    if (!canManage) return

    setIsEditing(false)
    setSelectedDepartment(null)
    setFormData(initialDepartmentForm)
    setFormErrors({})
    setShowFormModal(true)
  }

  const openEditModal = (department) => {
    if (!canManage) return

    setIsEditing(true)
    setSelectedDepartment(department)
    setFormData({
      code: department.code,
      name: department.name,
      description: department.description || '',
      is_active: department.is_active,
    })
    setFormErrors({})
    setShowFormModal(true)
  }

  const closeFormModal = () => {
    if (isSubmitting) return

    setShowFormModal(false)
    setSelectedDepartment(null)
    setFormErrors({})
  }

  const handleInputChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setFormErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canManage) return

    setIsSubmitting(true)
    setFormErrors({})

    try {
      const payload = mapDepartmentFormToPayload(formData)

      if (isEditing && selectedDepartment) {
        await departmentService.update(selectedDepartment.id, payload)
        showToast('Departemen berhasil diperbarui.')
      } else {
        await departmentService.create(payload)
        showToast('Departemen berhasil ditambahkan.')
      }

      setShowFormModal(false)
      setSelectedDepartment(null)
      setFormData(initialDepartmentForm)
      await fetchDepartments()
    } catch (error) {
      console.error(error)
      setFormErrors(getValidationErrors(error))
      showToast(error.response?.data?.message || 'Gagal menyimpan departemen.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (department) => {
    if (!canManage) return

    const confirmed = window.confirm(`Hapus departemen ${department.name}? Data akan di-soft-delete.`)
    if (!confirmed) return

    try {
      await departmentService.delete(department.id)
      showToast('Departemen berhasil dihapus.')
      await fetchDepartments()
    } catch (error) {
      console.error(error)
      showToast(error.response?.data?.message || 'Gagal menghapus departemen.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Building2 className="h-4 w-4" />
            Organization Master Data
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Master Departemen</h1>
          <p className="mt-1 text-gray-600">Kelola struktur departemen yang digunakan oleh data karyawan.</p>
        </div>

        {canManage && (
          <button type="button" onClick={openCreateModal} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Departemen
          </button>
        )}
      </div>

      {!canManage && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Role Manager memiliki akses baca. Perubahan data departemen hanya dapat dilakukan oleh Admin dan HR.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Total Ditampilkan" value={stats.total} />
        <StatCard icon={<CircleCheck className="h-5 w-5" />} label="Aktif" value={stats.active} />
        <StatCard icon={<CircleX className="h-5 w-5" />} label="Nonaktif" value={stats.inactive} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari kode, nama, atau deskripsi departemen..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <DepartmentTable
          departments={departments}
          isLoading={isLoading}
          canManage={canManage}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

      {showFormModal && canManage && (
        <DepartmentFormModal
          isEditing={isEditing}
          formData={formData}
          errors={formErrors}
          isSubmitting={isSubmitting}
          onChange={handleInputChange}
          onClose={closeFormModal}
          onSubmit={handleSubmit}
        />
      )}

      {toast && (
        <div className={`fixed right-4 top-4 z-[60] rounded-lg px-6 py-3 text-white shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

export default MasterDataPage
