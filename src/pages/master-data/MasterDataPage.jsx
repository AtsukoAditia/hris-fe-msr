import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import DepartmentPanel from './DepartmentPanel'
import PositionTab from './tabs/PositionTab'
import BranchTab from './tabs/BranchTab'

const MasterDataPage = () => {
  const { user } = useAuthStore()
  const [tab, setTab] = useState('department')
  const canManage = ['admin', 'hr'].includes(user?.role)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Organisasi</h1>
        <p className="mt-1 text-gray-600">Kelola departemen, jabatan, dan lokasi kerja karyawan.</p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <TabButton active={tab === 'department'} onClick={() => setTab('department')}>Departemen</TabButton>
        <TabButton active={tab === 'position'} onClick={() => setTab('position')}>Jabatan</TabButton>
        <TabButton active={tab === 'branch'} onClick={() => setTab('branch')}>Cabang / Lokasi</TabButton>
      </div>
      {tab === 'department' && <DepartmentPanel />}
      {tab === 'position' && <PositionTab canManage={canManage} />}
      {tab === 'branch' && <BranchTab canManage={canManage} />}
    </div>
  )
}

const TabButton = ({ active, onClick, children }) => (
  <button type="button" onClick={onClick} className={active ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white' : 'rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100'}>{children}</button>
)

export default MasterDataPage
