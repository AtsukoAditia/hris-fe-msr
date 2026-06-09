import { BadgeCheck, Briefcase, Calendar, Hash, Mail, MapPin, Phone, Shield, User, Users, X } from 'lucide-react'

const EmployeeDetailModal = ({ employee, onClose }) => {
  if (!employee) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detail Pegawai</h2>
          <button type="button" onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{employee.name || '-'}</h3>
              <p className="text-gray-600">{employee.position || '-'}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {employee.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                  {employee.role || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <InfoItem icon={<Mail />} label="Email" value={employee.email} />
              <InfoItem icon={<Hash />} label="NIK" value={employee.nik} />
              <InfoItem icon={<Phone />} label="Telepon" value={employee.phone} />
              <InfoItem icon={<Calendar />} label="Tanggal Lahir" value={employee.birth_date} />
              <InfoItem icon={<Users />} label="Gender" value={formatGender(employee.gender)} />
              <InfoItem icon={<MapPin />} label="Alamat" value={employee.address} />
            </div>

            <div className="space-y-4">
              <InfoItem icon={<Briefcase />} label="Departemen" value={employee.department} />
              <InfoItem icon={<BadgeCheck />} label="Role" value={employee.role} capitalize />
              <InfoItem icon={<Calendar />} label="Tanggal Bergabung" value={employee.join_date} />
              <InfoItem icon={<Briefcase />} label="Tipe Kerja" value={formatEmploymentType(employee.employment_type)} />
              <InfoItem icon={<Shield />} label="No. Pegawai" value={employee.formatted_employee_number || employee.employee_number} />
            </div>
          </div>

          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoItem = ({ icon, label, value, capitalize = false }) => (
  <div className="flex items-start">
    <span className="w-5 h-5 text-gray-400 mr-3 mt-0.5 [&>svg]:w-5 [&>svg]:h-5">{icon}</span>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-gray-900 ${capitalize ? 'capitalize' : ''}`}>{value || '-'}</p>
    </div>
  </div>
)

const formatGender = (value) => {
  const map = {
    male: 'Laki-laki',
    female: 'Perempuan',
  }

  return map[value] || value || '-'
}

const formatEmploymentType = (value) => {
  const map = {
    permanent: 'Permanent',
    contract: 'Contract',
    internship: 'Internship',
  }

  return map[value] || value || '-'
}

export default EmployeeDetailModal
