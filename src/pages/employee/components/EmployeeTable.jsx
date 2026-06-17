import { ContactRound, Edit2, Eye, Trash2, User } from 'lucide-react'
import { Link } from 'react-router-dom'

const EmployeeTable = ({
  employees,
  isLoading,
  canManageEmployee,
  canDeleteEmployee,
  onDetail,
  onEdit,
  onDelete,
}) => {
  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data karyawan...</div>
  if (employees.length === 0) return <div className="p-8 text-center text-gray-500">Belum ada data karyawan</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pegawai</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">No. Pegawai</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">NIK</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Jabatan</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Departemen</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cabang</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Atasan Langsung</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"><User className="h-5 w-5 text-blue-600" /></div>
                  <div><div className="font-medium text-gray-900">{employee.name || '-'}</div><div className="text-sm text-gray-500">{employee.email || '-'}</div></div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{employee.formatted_employee_number || employee.employee_number || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">{employee.nik || '-'}</td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{employee.position_name || employee.position || '-'}</div>
                {employee.position_code && <div className="text-xs text-gray-500">{employee.position_code}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{employee.department_name || employee.department || '-'}</div>
                {employee.department_code && <div className="text-xs text-gray-500">{employee.department_code}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{employee.branch_name || '-'}</div>
                {employee.branch_code && <div className="text-xs text-gray-500">{employee.branch_code}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="font-medium">{employee.manager_name || '-'}</div>
                {(employee.manager_position_name || employee.manager_employee_number) && <div className="text-xs text-gray-500">{employee.manager_position_name || employee.manager_employee_number}</div>}
              </td>
              <td className="px-6 py-4"><span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium capitalize text-blue-800">{employee.role || '-'}</span></td>
              <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{employee.status === 'active' ? 'Aktif' : 'Nonaktif'}</span></td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button type="button" onClick={() => onDetail(employee)} className="p-2 text-gray-400 hover:text-blue-600" title="Detail"><Eye className="h-4 w-4" /></button>
                  {canManageEmployee && <Link to={`/employee/${employee.id}/profile`} className="p-2 text-gray-400 hover:text-indigo-600" title="Profil"><ContactRound className="h-4 w-4" /></Link>}
                  {canManageEmployee && <button type="button" onClick={() => onEdit(employee)} className="p-2 text-gray-400 hover:text-yellow-600" title="Edit"><Edit2 className="h-4 w-4" /></button>}
                  {canDeleteEmployee && <button type="button" onClick={() => onDelete(employee)} className="p-2 text-gray-400 hover:text-red-600" title="Hapus"><Trash2 className="h-4 w-4" /></button>}
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
