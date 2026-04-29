import { BadgeCheck, Briefcase, Calendar, Hash, Mail, MapPin, Phone, Shield, User, X } from 'lucide-react'

const EmployeeDetailModal = ({ employee, onClose }) => {
  if (!employee) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detail Pegawai</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{employee.name}</h3>
              <p className="text-gray-600">{employee.position || '-'}</p>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {employee.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{employee.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Hash className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">NIK</p>
                  <p className="text-gray-900">{employee.nik || '-'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Telepon</p>
                  <p className="text-gray-900">{employee.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Alamat</p>
                  <p className="text-gray-900">{employee.address || '-'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Briefcase className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Departemen</p>
                  <p className="text-gray-900">{employee.department || '-'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <BadgeCheck className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="text-gray-900 capitalize">{employee.role || '-'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tanggal Bergabung</p>
                  <p className="text-gray-900">{employee.join_date || '-'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">No. Pegawai</p>
                  <p className="text-gray-900">{employee.formatted_employee_number || employee.employee_number || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailModal
