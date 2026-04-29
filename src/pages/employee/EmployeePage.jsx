import { useState, useEffect, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import employeeService from '../../services/employeeService'
import { useAuthStore } from '../../store/authStore'
import EmployeeTable from './components/EmployeeTable'
import EmployeeFormModal from './components/EmployeeFormModal'
import EmployeeDetailModal from './components/EmployeeDetailModal'
import { initialFormData, mapFormDataToPayload, normalizeEmployee } from './employee.helpers'

const EmployeePage = () => {
  const { user } = useAuthStore()
  const canManageEmployee = ['admin', 'hr'].includes(user?.role)
  const canDeleteEmployee = user?.role === 'admin'

  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)
  const [formData, setFormData] = useState(initialFormData)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await employeeService.getAll()
      const paginatedEmployees = res.data?.data
      const employeesData = Array.isArray(paginatedEmployees?.data) ? paginatedEmployees.data : []
      setEmployees(employeesData.map(normalizeEmployee))
    } catch (err) {
      console.error(err)
      showToast('Gagal memuat data karyawan', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    if (!canManageEmployee) return

    setIsEditing(false)
    setSelectedEmployee(null)
    setFormData({
      ...initialFormData,
      join_date: new Date().toISOString().split('T')[0],
    })
    setShowFormModal(true)
  }

  const handleEditClick = (employee) => {
    if (!canManageEmployee) return

    const normalizedEmployee = normalizeEmployee(employee)
    setIsEditing(true)
    setSelectedEmployee(normalizedEmployee)
    setFormData({
      name: normalizedEmployee?.name || '',
      email: normalizedEmployee?.email || '',
      nik: normalizedEmployee?.nik || '',
      phone: normalizedEmployee?.phone || '',
      address: normalizedEmployee?.address || '',
      position: normalizedEmployee?.position || '',
      department: normalizedEmployee?.department || '',
      join_date: normalizedEmployee?.join_date || '',
      status: normalizedEmployee?.status || 'active',
      role: normalizedEmployee?.role || 'employee',
    })
    setShowFormModal(true)
  }

  const handleDetailClick = (employee) => {
    setSelectedEmployee(normalizeEmployee(employee))
    setShowDetailModal(true)
  }

  const handleDeleteClick = async (employee) => {
    if (!canDeleteEmployee) return

    const normalizedEmployee = normalizeEmployee(employee)
    const confirmDelete = window.confirm(`Hapus data karyawan ${normalizedEmployee?.name || 'ini'}?`)
    if (!confirmDelete) return

    try {
      await employeeService.delete(normalizedEmployee.id)
      showToast('Data karyawan berhasil dihapus')
      fetchEmployees()
    } catch (err) {
      console.error(err)
      showToast('Gagal menghapus data karyawan', 'error')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!canManageEmployee) {
      showToast('Anda tidak memiliki akses untuk mengelola data karyawan.', 'error')
      return
    }

    try {
      const payload = mapFormDataToPayload(formData)

      if (isEditing && selectedEmployee) {
        await employeeService.update(selectedEmployee.id, payload)
        showToast('Data karyawan berhasil diperbarui')
      } else {
        await employeeService.create(payload)
        showToast('Data karyawan berhasil ditambahkan')
      }

      setShowFormModal(false)
      setFormData(initialFormData)
      setSelectedEmployee(null)
      setIsEditing(false)
      fetchEmployees()
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.message || 'Gagal menyimpan data karyawan', 'error')
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const search = searchQuery.toLowerCase()
    return (
      employee.name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search) ||
      employee.department.toLowerCase().includes(search) ||
      employee.position.toLowerCase().includes(search) ||
      employee.nik.toLowerCase().includes(search) ||
      employee.employee_number.toLowerCase().includes(search)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management Pegawai</h1>
          <p className="text-gray-600 mt-1">Kelola data pegawai dan informasi SDM</p>
        </div>
        {canManageEmployee && (
          <button
            onClick={handleAddClick}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Pegawai
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, NIK, departemen..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <EmployeeTable
          employees={filteredEmployees}
          isLoading={isLoading}
          canManageEmployee={canManageEmployee}
          canDeleteEmployee={canDeleteEmployee}
          onDetail={handleDetailClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </div>

      {showFormModal && canManageEmployee && (
        <EmployeeFormModal
          isEditing={isEditing}
          formData={formData}
          onChange={handleInputChange}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleSubmit}
        />
      )}

      {showDetailModal && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default EmployeePage
