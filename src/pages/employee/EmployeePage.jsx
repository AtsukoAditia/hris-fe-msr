import { useState, useEffect, useCallback } from 'react'
import employeeService from '../../services/employeeService'
import { Plus, Search, Edit2, Trash2, Eye, Shield, User, MapPin, Phone, Calendar, Briefcase, Mail, BadgeCheck, X, Hash } from 'lucide-react'

const initialFormData = {
  name: '',
  email: '',
  nik: '',
  phone: '',
  address: '',
  position: '',
  department: '',
  join_date: '',
  status: 'active',
  role: 'employee',
}

const EmployeePage = () => {
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
      const employeesData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.data?.data)
          ? res.data.data.data
          : []
      setEmployees(employeesData)
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
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    setIsEditing(false)
    setSelectedEmployee(null)
    setFormData({
      ...initialFormData,
      join_date: new Date().toISOString().split('T')[0],
    })
    setShowFormModal(true)
  }

  const handleEditClick = (employee) => {
    setIsEditing(true)
    setSelectedEmployee(employee)
    setFormData({
      name: employee.user?.name || employee.full_name || '',
      email: employee.user?.email || '',
      nik: employee.nik || '',
      phone: employee.phone || '',
      address: employee.address || '',
      position: employee.position || '',
      department: employee.department || '',
      join_date: employee.join_date ? String(employee.join_date).split('T')[0] : '',
      status: employee.is_active ? 'active' : 'inactive',
      role: employee.user?.role || 'employee',
    })
    setShowFormModal(true)
  }

  const handleDeleteClick = async (employee) => {
    const confirmed = window.confirm(`Hapus data karyawan ${employee.user?.name || employee.full_name || 'ini'}?`)
    if (!confirmed) return

    try {
      await employeeService.delete(employee.id)
      showToast('Data karyawan berhasil dihapus')
      fetchEmployees()
    } catch (err) {
      console.error(err)
      showToast('Gagal menghapus data karyawan', 'error')
    }
  }

  const handleDetailClick = (employee) => {
    setSelectedEmployee(employee)
    setShowDetailModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const payload = {
      name: formData.name,
      email: formData.email,
      nik: formData.nik,
      phone: formData.phone,
      address: formData.address,
      position: formData.position,
      department: formData.department,
      join_date: formData.join_date,
      status: formData.status,
      role: formData.role,
    }

    try {
      if (isEditing && selectedEmployee) {
        await employeeService.update(selectedEmployee.id, payload)
        showToast('Data karyawan berhasil diperbarui')
      } else {
        await employeeService.create(payload)
        showToast('Data karyawan berhasil ditambahkan')
      }

      setShowFormModal(false)
      setFormData(initialFormData)
      fetchEmployees()
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.message || 'Gagal menyimpan data karyawan', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEmployees = (Array.isArray(employees) ? employees : []).filter((employee) => {
    const keyword = searchQuery.toLowerCase()
    const name = employee.user?.name || employee.full_name || ''
    const email = employee.user?.email || ''
    const nik = employee.nik || ''
    const employeeNumber = employee.formatted_employee_number || employee.employee_number || ''
    const department = employee.department || ''
    const position = employee.position || ''

    return [name, email, nik, employeeNumber, department, position]
      .some(value => String(value).toLowerCase().includes(keyword))
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Karyawan</h1>
          <p className="text-gray-600 mt-1">Kelola data user dan karyawan HRIS.</p>
        </div>

        <button
          onClick={handleAddClick}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          Tambah Karyawan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Cari nama, email, NIK, nomor karyawan, departemen, atau jabatan"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Karyawan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Karyawan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIK</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Departemen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Belum ada data karyawan.</td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{employee.user?.name || employee.full_name || '-'}</div>
                          <div className="text-sm text-gray-500">{employee.user?.email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{employee.formatted_employee_number || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.nik || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.position || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{employee.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {employee.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleDetailClick(employee)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEditClick(employee)} className="p-2 rounded-lg hover:bg-blue-100 text-blue-600" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(employee)} className="p-2 rounded-lg hover:bg-red-100 text-red-600" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{isEditing ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
                <p className="text-sm text-gray-500 mt-1">Data user dan employee akan disimpan bersamaan.</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan NIK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jabatan</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan jabatan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departemen</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Masukkan departemen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Bergabung</label>
                  <input
                    type="date"
                    name="join_date"
                    value={formData.join_date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="hr">HR</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Masukkan alamat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                  {isLoading ? 'Menyimpan...' : isEditing ? 'Update Karyawan' : 'Simpan Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Detail Karyawan</h2>
                <p className="text-sm text-gray-500 mt-1">Informasi lengkap data employee dan user.</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEmployee.user?.name || selectedEmployee.full_name || '-'}</h3>
                  <p className="text-gray-500">{selectedEmployee.user?.email || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Hash className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nomor Karyawan</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.formatted_employee_number || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <BadgeCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">NIK</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.nik || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.user?.email || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.phone || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Jabatan</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.position || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.user?.role || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.join_date || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
                  <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Alamat</p>
                    <p className="font-medium text-gray-900">{selectedEmployee.address || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-xl shadow-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default EmployeePage
