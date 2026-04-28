import { useState, useEffect, useCallback } from 'react'
import employeeService from '../../services/employeeService'

const EmployeePage = () => {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await employeeService.getAll()
      setEmployees(res.data?.data || [])
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

  const handleViewDetail = async (employee) => {
    try {
      const res = await employeeService.getById(employee.id)
      setSelectedEmployee(res.data?.data || employee)
      setShowDetailModal(true)
    } catch (err) {
      setSelectedEmployee(employee)
      setShowDetailModal(true)
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase()
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Karyawan</h1>
        <p className="text-gray-500 text-sm mt-1">Daftar karyawan yang terdaftar dalam sistem</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan... (nama, email, jabatan, departemen)"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div>
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">👥</p>
              <p className="font-medium">
                {searchQuery ? 'Tidak ada karyawan yang cocok dengan pencarian' : 'Tidak ada data karyawan'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleViewDetail(employee)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-lg">
                        {employee.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.name || 'Nama tidak tersedia'}</p>
                        <p className="text-sm text-gray-500">{employee.email || '-'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{employee.position || employee.role || '-'}</p>
                      <p className="text-xs text-gray-400">{employee.department || employee.dept || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total Count */}
          {filteredEmployees.length > 0 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Menampilkan {filteredEmployees.length} dari {employees.length} karyawan
            </p>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Detail Karyawan</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-3xl">
                {selectedEmployee.name?.charAt(0).toUpperCase() || '?'}
              </div>
            </div>

            {/* Employee Info */}
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Nama Lengkap</p>
                <p className="text-gray-900 font-medium">{selectedEmployee.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Email</p>
                <p className="text-gray-700">{selectedEmployee.email || '-'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Jabatan</p>
                  <p className="text-gray-700">{selectedEmployee.position || selectedEmployee.role || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Departemen</p>
                  <p className="text-gray-700">{selectedEmployee.department || selectedEmployee.dept || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">No. Telepon</p>
                  <p className="text-gray-700">{selectedEmployee.phone || selectedEmployee.phone_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Tanggal Bergabung</p>
                  <p className="text-gray-700">{formatDate(selectedEmployee.join_date || selectedEmployee.hire_date)}</p>
                </div>
              </div>
              {selectedEmployee.address && (
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Alamat</p>
                  <p className="text-gray-700">{selectedEmployee.address}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Status</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                  selectedEmployee.status === 'active' || selectedEmployee.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedEmployee.status === 'active' || selectedEmployee.is_active ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeePage
