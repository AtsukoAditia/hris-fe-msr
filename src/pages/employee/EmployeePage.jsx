import { useState, useEffect, useCallback } from 'react'
import employeeService from '../../services/employeeService'
import { Plus, Search, MoreVertical, Edit2, Trash2, Eye, UserPlus, Shield, User, MapPin, Phone, Calendar, Briefcase, Mail, BadgeCheck, X } from 'lucide-react'

const EmployeePage = () => {
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    position: '',
    department: '',
    join_date: '',
    status: 'active',
    role: 'employee'
  })

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddClick = () => {
    setIsEditing(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      position: '',
      department: '',
      join_date: new Date().toISOString().split('T')[0],
      status: 'active',
      role: 'employee'
    })
    setShowFormModal(true)
  }

  const handleEditClick = (employee) => {
    setIsEditing(true)
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name || '',
      email: employee.email || '',
      phone: employee.phone || '',
      address: employee.address || '',
      position: employee.position || '',
      department: employee.department || '',
      join_date: employee.join_date || '',
      status: employee.status || 'active',
      role: employee.role || 'employee'
    })
    setShowFormModal(true)
  }

  const handleDeleteClick = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) {
      try {
        await employeeService.delete(id)
        showToast('Karyawan berhasil dihapus')
        fetchEmployees()
      } catch (err) {
        showToast('Gagal menghapus karyawan', 'error')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isEditing) {
        await employeeService.update(selectedEmployee.id, formData)
        showToast('Data karyawan berhasil diperbarui')
      } else {
        await employeeService.create(formData)
        showToast('Karyawan baru berhasil ditambahkan')
      }
      setShowFormModal(false)
      fetchEmployees()
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className=\"p-4 md:p-6 pb-24\">
      <div className=\"flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6\">
        <div>
          <h1 className=\"text-2xl font-bold text-gray-800\">Manajemen Karyawan</h1>
          <p className=\"text-gray-500\">Kelola data dan hak akses karyawan MSR</p>
        </div>
        <button 
          onClick={handleAddClick}
          className=\"flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors\"
        >
          <Plus size={20} />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Search & Stats */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6\">
        <div className=\"md:col-span-2 relative\">
          <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 text-gray-400\" size={20} />
          <input
            type=\"text\"
            placeholder=\"Cari nama, email, atau departemen...\"
            className=\"w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none\"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className=\"bg-white p-3 rounded-lg border flex items-center gap-3\">
          <div className=\"p-2 bg-indigo-50 text-indigo-600 rounded-lg\">
            <User size={20} />
          </div>
          <div>
            <p className=\"text-xs text-gray-500\">Total</p>
            <p className=\"font-bold\">{employees.length}</p>
          </div>
        </div>
        <div className=\"bg-white p-3 rounded-lg border flex items-center gap-3\">
          <div className=\"p-2 bg-green-50 text-green-600 rounded-lg\">
            <BadgeCheck size={20} />
          </div>
          <div>
            <p className=\"text-xs text-gray-500\">Aktif</p>
            <p className=\"font-bold\">{employees.filter(e => e.is_active !== false).length}</p>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className=\"bg-white p-4 rounded-xl border animate-pulse\">
              <div className=\"flex items-center gap-4 mb-4\">
                <div className=\"w-12 h-12 bg-gray-200 rounded-full\"></div>
                <div className=\"flex-1\">
                  <div className=\"h-4 bg-gray-200 rounded w-3/4 mb-2\"></div>
                  <div className=\"h-3 bg-gray-100 rounded w-1/2\"></div>
                </div>
              </div>
              <div className=\"space-y-2\">
                <div className=\"h-3 bg-gray-100 rounded w-full\"></div>
                <div className=\"h-3 bg-gray-100 rounded w-5/6\"></div>
              </div>
            </div>
          ))
        ) : filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className=\"bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group\">
              <div className=\"p-4\">
                <div className=\"flex items-start justify-between mb-4\">
                  <div className=\"flex items-center gap-3\">
                    <div className=\"w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg\">
                      {employee.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className=\"font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors\">{employee.name}</h3>
                      <p className=\"text-xs text-gray-500\">{employee.position} • {employee.department}</p>
                    </div>
                  </div>
                  <div className=\"flex gap-1\">
                    <button 
                      onClick={() => { setSelectedEmployee(employee); setShowDetailModal(true); }}
                      className=\"p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors\"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditClick(employee)}
                      className=\"p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors\"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(employee.id)}
                      className=\"p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors\"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className=\"space-y-2 text-sm text-gray-600 border-t pt-4\">
                  <div className=\"flex items-center gap-2\">
                    <Mail size={14} className=\"text-gray-400\" />
                    <span>{employee.email}</span>
                  </div>
                  <div className=\"flex items-center gap-2\">
                    <Phone size={14} className=\"text-gray-400\" />
                    <span>{employee.phone || '-'}</span>
                  </div>
                  <div className=\"flex items-center justify-between mt-4\">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                      employee.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {employee.is_active !== false ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <span className=\"text-[10px] text-gray-400 uppercase tracking-wider font-bold\">
                      {employee.role || 'employee'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className=\"col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed\">
            <UserPlus size={48} className=\"mx-auto text-gray-300 mb-4\" />
            <p className=\"text-gray-500\">Tidak ada data karyawan ditemukan</p>
          </div>
        )}
      </div>

      {/* Form Modal (Add/Edit) */}
      {showFormModal && (
        <div className=\"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm\">
          <div className=\"bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl\">
            <div className=\"p-6 border-b flex items-center justify-between\">
              <h2 className=\"text-xl font-bold\">{isEditing ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}</h2>
              <button onClick={() => setShowFormModal(false)} className=\"p-2 hover:bg-gray-100 rounded-full\">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className=\"flex-1 overflow-y-auto p-6\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                <div className=\"md:col-span-2\">
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Nama Lengkap</label>
                  <input
                    name=\"name\"
                    required
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Email</label>
                  <input
                    type=\"email\"
                    name=\"email\"
                    required
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">No. Telepon</label>
                  <input
                    name=\"phone\"
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Departemen</label>
                  <select
                    name=\"department\"
                    required
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value=\"\">Pilih Departemen</option>
                    <option value=\"IT\">IT</option>
                    <option value=\"HR\">HR</option>
                    <option value=\"Finance\">Finance</option>
                    <option value=\"Marketing\">Marketing</option>
                    <option value=\"Operational\">Operational</option>
                  </select>
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Jabatan</label>
                  <input
                    name=\"position\"
                    required
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.position}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Tanggal Bergabung</label>
                  <input
                    type=\"date\"
                    name=\"join_date\"
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.join_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Role Sistem</label>
                  <select
                    name=\"role\"
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value=\"employee\">Employee</option>
                    <option value=\"manager\">Manager</option>
                    <option value=\"hr\">HR Admin</option>
                    <option value=\"admin\">System Admin</option>
                  </select>
                </div>
                <div className=\"md:col-span-2\">
                  <label className=\"block text-sm font-medium text-gray-700 mb-1\">Alamat</label>
                  <textarea
                    name=\"address\"
                    rows=\"3\"
                    className=\"w-full p-2 border rounded-lg\"
                    value={formData.address}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
              </div>
              
              <div className=\"mt-8 flex gap-3\">
                <button
                  type=\"button\"
                  onClick={() => setShowFormModal(false)}
                  className=\"flex-1 py-2 border rounded-lg hover:bg-gray-50\"
                >
                  Batal
                </button>
                <button
                  type=\"submit\"
                  disabled={isLoading}
                  className=\"flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50\"
                >
                  {isLoading ? 'Menyimpan...' : (isEditing ? 'Update Data' : 'Simpan Karyawan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEmployee && (
        <div className=\"fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm\">
          <div className=\"bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl\">
            <div className=\"bg-indigo-600 p-8 flex flex-col items-center text-white relative\">
              <button 
                onClick={() => setShowDetailModal(false)}
                className=\"absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors\"
              >
                <X size={24} />
              </button>
              <div className=\"w-24 h-24 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold mb-4 shadow-lg\">
                {selectedEmployee.name?.charAt(0)}
              </div>
              <h2 className=\"text-2xl font-bold\">{selectedEmployee.name}</h2>
              <p className=\"text-indigo-100\">{selectedEmployee.position} • {selectedEmployee.department}</p>
            </div>
            
            <div className=\"p-6 space-y-4\">
              <div className=\"grid grid-cols-2 gap-4\">
                <div className=\"flex items-center gap-3\">
                  <div className=\"p-2 bg-gray-50 rounded-lg text-gray-400\"><Mail size={18} /></div>
                  <div>
                    <p className=\"text-[10px] uppercase text-gray-400 font-bold\">Email</p>
                    <p className=\"text-sm font-medium\">{selectedEmployee.email}</p>
                  </div>
                </div>
                <div className=\"flex items-center gap-3\">
                  <div className=\"p-2 bg-gray-50 rounded-lg text-gray-400\"><Phone size={18} /></div>
                  <div>
                    <p className=\"text-[10px] uppercase text-gray-400 font-bold\">Telepon</p>
                    <p className=\"text-sm font-medium\">{selectedEmployee.phone || '-'}</p>
                  </div>
                </div>
                <div className=\"flex items-center gap-3\">
                  <div className=\"p-2 bg-gray-50 rounded-lg text-gray-400\"><Calendar size={18} /></div>
                  <div>
                    <p className=\"text-[10px] uppercase text-gray-400 font-bold\">Join Date</p>
                    <p className=\"text-sm font-medium\">{selectedEmployee.join_date || '-'}</p>
                  </div>
                </div>
                <div className=\"flex items-center gap-3\">
                  <div className=\"p-2 bg-gray-50 rounded-lg text-gray-400\"><Shield size={18} /></div>
                  <div>
                    <p className=\"text-[10px] uppercase text-gray-400 font-bold\">Sistem Role</p>
                    <p className=\"text-sm font-medium capitalize\">{selectedEmployee.role || 'employee'}</p>
                  </div>
                </div>
              </div>

              <div className=\"flex items-start gap-3 border-t pt-4\">
                <div className=\"p-2 bg-gray-50 rounded-lg text-gray-400\"><MapPin size={18} /></div>
                <div>
                  <p className=\"text-[10px] uppercase text-gray-400 font-bold\">Alamat</p>
                  <p className=\"text-sm\">{selectedEmployee.address || '-'}</p>
                </div>
              </div>

              <div className=\"mt-6\">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className=\"w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors\"
                >
                  Tutup Detail
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 text-white animate-bounce-in ${
          toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'
        }`}>
          {toast.type === 'error' ? <X size={18} /> : <BadgeCheck size={18} />}
          <span className=\"text-sm font-medium\">{toast.message}</span>
        </div>
      )}
    </div>
  )
}

export default EmployeePage
