import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, Search, Users, UserCheck, UserX } from 'lucide-react'
import employeeService from '../../services/employeeService'
import departmentService from '../../services/departmentService'
import positionService from '../../services/positionService'
import { useAuthStore } from '../../store/authStore'
import EmployeeTable from './components/EmployeeTable'
import EmployeeFormModal from './components/EmployeeFormModal'
import EmployeeDetailModal from './components/EmployeeDetailModal'
import { initialFormData, mapFormDataToPayload, normalizeEmployee, normalizePagination, normalizeRows } from './employee.helpers'
import { normalizeDepartmentRows } from '../master-data/department.helpers'
import { normalizePositionRows } from '../master-data/position.helpers'

const EmployeePage = () => {
  const { user } = useAuthStore()
  const canManageEmployee = ['admin', 'hr'].includes(user?.role)
  const canDeleteEmployee = user?.role === 'admin'

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMasters, setIsLoadingMasters] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }

  const fetchMasters = useCallback(async () => {
    setIsLoadingMasters(true)
    try {
      const [departmentResponse, positionResponse] = await Promise.all([
        departmentService.getAll({ active_only: true }),
        positionService.getAll({ active_only: true }),
      ])
      setDepartments(normalizeDepartmentRows(departmentResponse))
      setPositions(normalizePositionRows(positionResponse))
    } catch (error) {
      console.error(error)
      setDepartments([])
      setPositions([])
      showToast(error.response?.data?.message || 'Gagal memuat master organisasi.', 'error')
    } finally {
      setIsLoadingMasters(false)
    }
  }, [])

  const fetchEmployees = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params = { page, per_page: pagination.per_page }
      if (searchQuery.trim()) params.search = searchQuery.trim()
      if (statusFilter) params.status = statusFilter
      if (departmentFilter) params.department_id = departmentFilter
      if (positionFilter) params.position_id = positionFilter

      const response = await employeeService.getAll(params)
      const paginatedEmployees = response.data?.data
      setEmployees(normalizeRows(paginatedEmployees).map(normalizeEmployee).filter(Boolean))
      setPagination(normalizePagination(paginatedEmployees))
    } catch (error) {
      console.error(error)
      setEmployees([])
      showToast(error.response?.data?.messae || 'Gagal memuat data karyawan', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [departmentFilter, pagination.per_page, positionFilter, searchQuery, statusFilter])

  useEffect(() => { fetchMasters() }, [fetchMasters])
  useEffect(() => {
    const timer = window.setTimeout(() => fetchEmployees(1), 350)
    return () => window.clearTimeout(timer)
  }, [fetchEmployees])

  const formPositions = useMemo(
    () => positions.filter((item) => String(item.department_id) === String(formData.department_id)),
    [formData.department_id, positions],
  )

  const filterPositions = useMemo(
    () => departmentFilter
      ? positions.filter((item) => String(item.department_id) === String(departmentFilter))
      : positions,
    [departmentFilter, positions],
  )

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'department_id' ? { position_id: '' } : {}),
    }))
    setFormErrors((current) => ({
      ...current,
      [name]: undefined,
      ...(name === 'department_id' ? { position_id: undefined } : {}),
    }))
  }

  const handleDepartmentFilter = (value) => {
    setDepartmentFilter(value)
    const selectedPositionIsValid = positions.some((item) => (
      String(item.id) === String(positionFilter)
      && (!value || String(item.department_id) === String(value))
    ))
    if (positionFilter && !selectedPositionIsValid) setPositionFilter('')
  }

  const handleAddClick = () => {
    setIsEditing(false)
    setSelectedEmployee(null)
    setFormErrors({})
    setFormData({ ...initialFormData, join_date: new Date().toISOString().split('T')[0] })
    setShowFormModal(true)
  }

  const handleEditClick = (employee) => {
    const item = normalizeEmployee(employee)
    setIsEditing(true)
    setSelectedEmployee(item)
    setFormErrors({})
    setFormData({
      name: item?.name || '',
      email: item?.email || '',
      nik: item?.nik || '',
      phone: item?.phone || '',
      address: item?.address || '',
      birth_date: item?.birth_date || '',
      gender: item?.gender || '',
      department_id: item?.department_id ? String(item.department_id) : '',
      position_id: item?.position_id ? String(item.position_id) : '',
      join_date: item?.join_date || '',
      employment_type: item?.employment_type || 'permanent',
      status: item?.status || 'active',
      role: item?.role || 'employee',
    })
    setShowFormModal(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFormErrors({})
    try {
      const payload = mapFormDataToPayload(formData)
      if (isEditing && selectedEmployee) await employeeService.update(selectedEmployee.id, payload)
      else await employeeService.create(payload)

      showToast(isEditing ? 'Data karyawan berhasil diperbarui' : 'Data karyawan berhasil ditambahkan')
      setShowFormModal(false)
      setFormData(initialFormData)
      setSelectedEmployee(null)
      setIsEditing(false)
      fetchEmployees(isEditing ? pagination.current_page : 1)
    } catch (error) {
      console.error(error)
      setFormErrors(error.response?.data?.errors || {})
      showToast(error.response?.data?.message || 'Gagal menyimpan data karyawan', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = async (employee) => {
    const item = normalizeEmployee(employee)
    if (!window.confirm(`Hapus data karyawan ${item?.name || 'ini'}?`)) return
    try {
      await employeeService.delete(item.id)
      showToast('Data karyawan berhasil dihapus')
      fetchEmployees(pagination.current_page)
    } catch (error) {
      showToast(error.response?.data?.messae || 'Gagal menghapus data karyawan', 'error')
    }
  }

  const handleFaceUpdated = (employee) => {
    const item = normalizeEmployee(employee)
    if (!item) return
    setSelectedEmployee(item)
    setEmployees((current) => current.map((row) => row.id === item.id ? item : row))
    showToast('Foto wajah absensi berhasil disimpan')
  }

  const stats = {
    total: pagination.total,
    active: employees.filter((item) => item.status === 'active').length,
    inactive: employees.filter((item) => item.status === 'inactive').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management Pegawai</h1>
          <p className="mt-1 text-gray-600">Kelola data pegawai dan informasi SGM</p>
        </div>
        {canManageEmployee && (
          <button onClick={handleAddClick} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pegawai
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Data" value={stats.total} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Aktif di Halaman Ini" value={stats.active} />
        <StatCard icon={<UserX className="h-5 w-5" />} label="Nonaktif di Halaman Ini" value={stats.inactive} />
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari karyawan..." className="form-input pl-10" />
          </div>
          <select value={departmentFilter} onChange={(event) => handleDepartmentFilter(event.target.value)} className="form-input">
            <option value="">Semua Departemen</option>
            {departments.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
          </select>
          <select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)} className="form-input">
            <option value="">Semua Jabatan</option>
            {filterPositions.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-input">
            <option value="">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          canManageEmployee={canManageEmployee}
          canDeleteEmployee={canDeleteEmployee}
          onDetail={(item) => {
            setSelectedEmployee(normalizeEmployee(item))
            setShowDetailModal(true)
          }}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <p>Halaman {pagination.current_page} dari {pagination.last_page} • Total {pagination.total}</p>
        <div className="flex gap-2">
          <button disabled={pagination.current_page <= 1 || isLoading} onClick={() => fetchEmployees(pagination.current_page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Sebelumnya</button>
          <button disabled={pagination.current_page >= pagination.last_page || isLoading} onClick={() => fetchEmployees(pagination.current_page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Berikutnya</button>
        </div>
      </div>

      {showFormModal && (
        <EmployeeFormModal
          isEditing={isEditing}
          formData={formData}
          departments={departments}
          positions={formPositions}
          isLoadingDepartments={isLoadingMasters}
          isLoadingPositions={isLoadingMasters}
          errors={formErrors}
          isSubmitting={isSubmitting}
          onChange={handleInputChange}
          onClose={() => !isSubmitting && setShowFormModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showDetailModal && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setShowDetailModal(false)}
          onFaceUpdated={handleFaceUpdated}
        />
      )}

      {toast && (
        <div className={`fixed right-4 top-4 z-50 rounded-lg px-6 py-3 text-white shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
)

export default EmployeePage
