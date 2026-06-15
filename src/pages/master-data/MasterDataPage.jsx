import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import DepartmentTab from './tabs/DepartmentTab'
import PositionTab from './tabs/PositionTab'

const MasterDataPage = () => {
  const { user } = useAuthStore()
  const [tab, setTab] = useState('department')
  const canManage = ['admin', 'hr'].includes(user?.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Organisasi</h1>
        <p className="mt-1 text-gray-600">Kelola departemen dan jabatan untuk data karyawan.</p>
      </div>
      <div className="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <button type="button" onClick={() => setTab('department')} className={tab === 'department' ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white' : 'rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100'}>Departemen</button>
        <button type="button" onClick={() => setTab('position')} className={tab === 'position' ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white' : 'rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100'}>Jabatan</button>
      </div>
      {tab === 'department' ? <DepartmentTab /> : <PositionTab canManage={canManage} />}
    </div>
  )
}

export default MasterDataPage
