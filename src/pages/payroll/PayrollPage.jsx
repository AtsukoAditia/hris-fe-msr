import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import PayrollListTab from './PayrollListTab'
import PeriodsTab from './PeriodsTab'
import ProfilesTab from './ProfilesTab'
import SalaryComponentsTab from './SalaryComponentsTab'

const tabs = [
  { id: 'payrolls', label: 'Payroll' },
  { id: 'periods', label: 'Periode' },
  { id: 'profiles', label: 'Profil Gaji' },
  { id: 'components', label: 'Komponen' },
]

const PayrollPage = () => {
  const user = useAuthStore((state) => state.user)
  const [activeTab, setActiveTab] = useState('payrolls')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleGenerated = () => {
    setRefreshKey((current) => current + 1)
    setActiveTab('payrolls')
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola komponen, profil gaji, periode, dan proses payroll dasar.</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">Akses: <span className="font-semibold capitalize">{user?.role || '-'}</span></div>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Payroll Foundation belum menghitung PPh 21, BPJS, atau adjustment setelah finalisasi. Finalisasi harus dilakukan setelah nominal dan data kehadiran diverifikasi.
      </div>

      <div className="overflow-x-auto border-b border-gray-200">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'payrolls' && <PayrollListTab refreshKey={refreshKey} />}
      {activeTab === 'periods' && <PeriodsTab onGenerated={handleGenerated} />}
      {activeTab === 'profiles' && <ProfilesTab />}
      {activeTab === 'components' && <SalaryComponentsTab />}
    </div>
  )
}

export default PayrollPage
