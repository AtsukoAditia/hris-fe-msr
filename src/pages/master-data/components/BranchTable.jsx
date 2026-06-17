import { Edit2, MapPin, Trash2 } from 'lucide-react'

const BranchTable = ({ branches, isLoading, canManage, onEdit, onDelete }) => {
  if (isLoading) return <div className="p-8 text-center text-gray-500">Memuat data cabang...</div>
  if (branches.length === 0) return <div className="p-8 text-center text-gray-500">Belum ada data cabang</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cabang</th>
            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lokasi</th>
            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Area Absensi</th>
            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Karyawan</th>
            <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            {canManage && <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {branches.map((branch) => (
            <tr key={branch.id} className="hover:bg-gray-50">
              <td className="px-5 py-4">
                <div className="font-medium text-gray-900">{branch.name}</div>
                <div className="text-xs text-gray-500">{branch.code}</div>
              </td>
              <td className="px-5 py-4 text-sm text-gray-700">
                <div className="flex max-w-xs items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" /><span>{branch.address || '-'}</span></div>
                <div className="mt-1 text-xs text-gray-500">{branch.timezone}</div>
              </td>
              <td className="px-5 py-4 text-sm text-gray-700">
                <div>{branch.radius_meters} meter</div>
                <div className="mt-1 text-xs text-gray-500">{formatCoordinate(branch.latitude)}, {formatCoordinate(branch.longitude)}</div>
              </td>
              <td className="px-5 py-4 text-sm text-gray-700">{branch.employees_count}</td>
              <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${branch.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{branch.is_active ? 'Aktif' : 'Nonaktif'}</span></td>
              {canManage && (
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button type="button" onClick={() => onEdit(branch)} aria-label={`Edit ${branch.name}`} title="Edit" className="p-2 text-gray-400 hover:text-yellow-600"><Edit2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => onDelete(branch)} aria-label={`Hapus ${branch.name}`} title="Hapus" className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
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

const formatCoordinate = (value) => value === '' || value === null || value === undefined ? '-' : Number(value).toFixed(7)

export default BranchTable
