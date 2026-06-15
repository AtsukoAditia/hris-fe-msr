import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, UserCheck, Users, UserX } from 'lucide-react'
import departmentService from '../../services/departmentService'
import employeeService from '../../services/employeeService'
import positionService from '../../services/positionService'
import { useAuthStore } from '../../store/authStore'
import { normalizeDepartmentRows } from '../master-data/department.helpers'
import { normalizePositionRows } from '../master-data/position.helpers'
import EmployeeDetailModal from './components/EmployeeDetailModal'
import EmployeeFormModal from './components/EmployeeFormModal'
import EmployeeTable from './components/EmployeeTable'
import {
  initialFormData,
  mapFormDataToPayload,
  normalizeEmployee,
  normalizePagination,
  normalizeRows,
} from './employee.helpers'

const EmployeeManagementPage = () => {
  const { user } = useAuthStore()
  const canManage = ['admin', 'hr'].includes(user?.role)
  const canDelete = user?.role === 'admin'

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [positions, setPositions] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 })
  const [filters, setFilters] = useState({ search: '', department_id: '', position_id: '', status: '' })
  const [formData, setFormData] = useState(initialFormData)
  const [formErrors, setFormErrors] = useState({})
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingMasters, setLoadingMasters] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const loadMasters = useCallback(async () => {
    setLoadingMasters(true)
    try {
      const [departmentResponse, positionResponse] = await Promise.all([
        departmentService.getAll({ active_only: true }),
        positionService.getAll({ active_only: true }),
      ])
      setDepartments(normalizeDepartmentRows(departmentResponse))
      setPositions(normalizePositionRows(positionResponse))
    } catch (error) {
      setDepartments([])
      setPositions([])
      notify(error.response?.data?.message || 'Gagal memuat master organisasi.', 'error')
    } finally {
      setLoadingMasters(false)
    }
  }, [notify])

  const loadEmployees = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, per_page: pagination.per_page }
      if (filters.search.trim()) params.search = filters.search.trim()
      if (filters.department_id) params.department_id = filters.department_id
      if (filters.position_id) params.position_id = filters.position_id
      if (filters.status) params.status = filters.status

      const response = await employeeService.getAll(params)
      const payload = response.data?.data
      setEmployees(normalizeRows(payload).map(normalizeEmployee).filter(Boolean))
      setPagination(normalizePagination(payload))
    } catch (error) {
      setEmployees([])
      notify(error.response?.data?.message || 'Gagal memuat data karyawan.', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, notify, pagination.per_page])

  useEffect(() => { loadMasters() }, [loadMasters])
  useEffect(() => {
    const timer = window.setTimeout(() => loadEmployees(1), 350)
    return () => window.clearTimeout(timer)
  }, [loadEmployees])

  const formPositions = useMemo(
    () => positions.filter((item) => String(item.department_id) === String(formData.department_id)),
    [formData.department_id, positions],
  )

  const filterPositions = useMemo(
    () => filters.department_id
      ? positions.filter((item) => String(item.department_id) === String(filters.department_id))
      : positions,
    [filters.department_id, positions],
  )

  const changeFilter = (name, value) => {
    setFilters((current) => {
      const next = { ...current, [name]: value }
      if (name === 'department_id') {
        const selectedPosition = positions.find((item) => String(item.id) === String(current.position_id))
        if (selectedPosition && String(selectedPosition.department_id) !== String(value)) next.position_id = ''
      }
      return next
    })
  }

  const changeForm = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name === 'department_id' ? { position_id: '' } : {}),
    }))
    setFormErrors((current) => ({ ...current, [name]: undefined, position_id: name === 'department_id' ? undefined : current.position_id }))
  }

  const openCreate = () => {
    setSelected(null)
    setFormErrors({})
    setFormData({ ...initialFormData, join_date: new Date().toISOString().split('T')[0] })
    setModal('form')
  }

  const openEdit = (employee) => {
    const item = normalizeEmployee(employee)
    setSelected(item)
    setFormErrors({})
    setFormData({
      name: item.name,
      email: item.email,
      nik: item.nik,
      phone: item.phone,
      address: item.address,
      birth_date: item.birth_date,
      gender: item.gender,
      department_id: item.department_id ? String(item.department_id) : '',
      position_id: item.position_id ? String(item.position_id) : '',
      join_date: item.join_date,
      employment_type: item.employment_type,
      status: item.status,
      role: item.role,
    })
    setModal('form')
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFormErrors({})
    try {
      const payload = mapFormDataToPayload(formData)
      if (selected) await employeeService.update(selected.id, payload)
      else await employeeService.create(payload)
      notify(selected ? 'Data karyawan berhasil diperbarui.' : 'Data karyawan berhasil ditambahkan.')
      setModal(null)
      await loadEmployees(selected ? pagination.current_page : 1)
    } catch (error) {
      setFormErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal menyimpan data karyawan.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (employee) => {
    const item = normalizeEmployee(employee)
    if (!window.confirm(`Hapus data karyawan ${item?.name || 'ini'}?`)) return
    try {
      await employeeService.delete(item.id)
      notify('Data karyawan berhasil dihapus.')
      await loadEmployees(pagination.current_page)
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal menghapus data karyawan.', 'error')
    }
  }

  const updateFace = (employee) => {
    const item = normalizeEmployee(employee)
    if (!item) return
    setSelected(item)
    setEmployees((current) => current.map((row) => row.id === item.id ? item : row))
    notify('Foto wajah absensi berhasil disimpan.')
  }

  const stats = {
    total: pagination.total,
    active: employees.filter((item) => item.status === 'active').length,
    inactive: employees.filter((item) => item.status === 'inactive').length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Management Pegawai</h1><p className="mt-1 text-gray-600">Kelola data pegawai dan informasi SDM</p></div>
        {canManage && <button type="button" onClick={openCreate} className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white"><Plus className="mr-2 h-4 w-4" />Tambah Pegawai</button>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={<Users className="h-5 w-5" />} label="Total Data" value={stats.total} />
        <Stat icon={<UserCheck className="h-5 w-5" />} label="Aktif di Halaman Ini" value={stats.active} />
        <Stat icon={<UserX className="h-5 w-5" />} label="Nonaktif di Halaman Ini" value={stats.inactive} />
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-5">
          <div className="relative lg:col-span-2"><Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" /><input value={filters.search} onChange={(event) => changeFilter('search', event.target.value)} placeholder="Cari karyawan..." className="form-input pl-10" /></div>
          <select value={filters.department_id} onChange={(event) => changeFilter('department_id', event.target.value)} className="form-input"><option value="">Semua Departemen</option>{departments.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select>
          <select value={filters.position_id} onChange={(event) => changeFilter('position_id', event.target.value)} className="form-input"><option value="">Semua Jabatan</option>{filterPositions.map((item) => <option key={item.id} value={item.id}>{item.code} — {item.name}</option>)}</select>
          <select value={filters.status} onChange={(event) => changeFilter('status', event.target.value)} className="form-input"><option value="">Semua Status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <EmployeeTable employees={employees} isLoading={loading} canManageEmployee={canManage} canDeleteEmployee={canDelete} onDetail={(item) => { setSelected(normalizeEmployee(item)); setModal('detail') }} onEdit={openEdit} onDelete={remove} />
      </div>

      <div className="flex flex-col justify-between gap-3 text-sm text-gray-600 sm:flex-row">
        <p>Halaman {pagination.current_page} dari {pagination.last_page} • Total {pagination.total}</p>
        <div className="flex gap-2"><button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => loadEmployees(pagination.current_page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Sebelumnya</button><button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => loadEmployees(pagination.current_page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-50">Berikutnya</button></div>
      </div>

      {modal === 'form' && <EmployeeFormModal isEditing={Boolean(selected)} formData={formData} departments={departments} positions={formPositions} isLoadingDepartments={loadingMasters} isLoadingPositions={loadingMasters} errors={formErrors} isSubmitting={submitting} onChange={changeForm} onClose={() => !submitting && setModal(null)} onSubmit={submit} />}
      {modal === 'detail' && <EmployeeDetailModal employee={selected} onClose={() => setModal(null)} onFaceUpdated={updateFace} />}
      {toast && <div className={`fixed right-4 top-4 z-50 rounded-lg px-6 py-3 text-white shadow-lg ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>{toast.message}</div>}
    </div>
  )
}

const Stat = ({ icon, label, value }) => <div className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</div><div><p className="text-xs text-gray-500">{label}</p><p className="text-xl font-bold text-gray-900">{value}</p></div></div>

export default EmployeeManagementPage
