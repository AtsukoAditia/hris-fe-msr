import { Edit2, Trash2 } from 'lucide-react'

const DepartmentTable = ({ departments, isLoading, canManage, onEdit, onDelete }) => {
  if (isLoading) {
    return <div className="p-10 text-center text-gray-500">Memuat data departemen...</div>
  }

  if (departments.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="font-medium text-gray-700">Belum ada departemen yang sesuai.</p>
        <p className="mt-1 text-sm text-gray-500">Ubah pencarian atau filter status untuk melihat data lain.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kode</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Departemen</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Deskripsi</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            {canManage && <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {departments.map((department) => (
            <tr key={department.id} className="transition-colors hover:bg-gray-50">
              <td className="px-6 py-4">
                <span className="inline-flex rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {department.code}
                </span>
              </td>
              <td className="px-6 py-4 font-medium text-gray-900">{department.name}</td>
              <td className="max-w-md px-6 py-4 text-sm text-gray-600">{department.description || '-'}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${department.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {department.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </td>
              {canManage && (
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => onEdit(department)} className="rounded-lg p-2 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600" title="Edit departemen" aria-label={`Edit ${department.name}`}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onDelete(department)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" title="Hapus departemen" aria-label={`Hapus ${department.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DepartmentTable
