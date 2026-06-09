import { Edit2, Eye, Trash2, User } from 'lucide-react'

const EmployeeTable = ({
  employees,
  isLoading,
  canManageEmployee,
  canDeleteEmployee,
  onDetail,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Memuat data karyawan...</div>
  }

  if (employees.length === 0) {
    return <div className="p-8 text-center text-gray-500">Belum ada data karyawan</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pegawai</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pegawai</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jabatan</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departemen</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employee.name || '-'}</div>
                    <div className="text-sm text-gray-500">{employee.email || '-'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{employee.formatted_employee_number || employee.employee_number || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{employee.nik || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{employee.position || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{employee.department || '-'}</td>
              <td className="px-6 py-4">
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                  {employee.role || '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {employee.status === 'active' ? 'Aktif' : 'Nonaktif'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button type="button" onClick={() => onDetail(employee)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Detail">
                    <Eye className="w-4 h-4" />
                  </button>
                  {canManageEmployee && (
                    <button type="button" onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-yellow-600 transition-colors" title="Edit">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDeleteEmployee && (
                    <button type="button" onClick={() => onDelete(employee)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EmployeeTable
