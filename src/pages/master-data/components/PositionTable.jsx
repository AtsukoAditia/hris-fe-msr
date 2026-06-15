import { Edit2, Trash2 } from 'lucide-react'

const PositionTable = ({ positions, isLoading, canManage, onEdit, onDelete }) => {
  if (isLoading) return <div className="p-10 text-center text-gray-500">Memuat data jabatan...</div>
  if (positions.length === 0) return <div className="p-10 text-center text-gray-500">Belum ada jabatan yang sesuai.</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">Kode</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">Jabatan</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">Departemen</th>
            <th className="px-6 py-4 text-left text-xs font-medium uppercase text-gray-500">Status</th>
            {canManage && <th className="px-6 py-4 text-right text-xs font-medium uppercase text-gray-500">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {positions.map((position) => (
            <tr key={position.id} className="hover:bg-gray-50">
              <td className="px-6 py-4"><span className="rounded-md bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">{position.code}</span></td>
              <td className="px-6 py-4"><div className="font-medium text-gray-900">{position.name}</div><div className="text-sm text-gray-500">{position.description || '-'}</div></td>
              <td className="px-6 py-4 text-sm"><div className="font-medium text-gray-700">{position.department?.name || '-'}</div><div className="text-xs text-gray-500">{position.department?.code || '-'}</div></td>
              <td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${position.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{position.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
              {canManage && (
                <td className="px-6 py-4 text-right">
                  <button type="button" onClick={() => onEdit(position)} aria-label={`Edit ${position.name}`} className="p-2 text-gray-400 hover:text-yellow-600"><Edit2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(position)} aria-label={`Hapus ${position.name}`} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PositionTable
