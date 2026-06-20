import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import overtimeService from '../../services/overtimeService'
import OvertimePolicyPanel from './OvertimePolicyPanel'
import OvertimeRequestPanel from './OvertimeRequestPanel'
import { getErrorMessage, normalizeRows } from './overtime.helpers'

const OvertimePage = () => {
  const user = useAuthStore((state) => state.user)
  const role = user?.role || 'employee'
  const canReview = ['admin', 'hr', 'manager'].includes(role)
  const canManagePolicies = ['admin', 'hr'].includes(role)
  const [activeTab, setActiveTab] = useState('mine')
  const [activePolicies, setActivePolicies] = useState([])
  const [policyError, setPolicyError] = useState('')
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true)

  const tabs = useMemo(() => {
    const items = [{ value: 'mine', label: 'Pengajuan Saya' }]
    if (canReview) items.push({ value: 'review', label: 'Review Pengajuan' })
    if (canManagePolicies) items.push({ value: 'policies', label: 'Policy Lembur' })
    return items
  }, [canManagePolicies, canReview])

  const loadActivePolicies = useCallback(async () => {
    setIsLoadingPolicies(true)
    setPolicyError('')
    try {
      const response = await overtimeService.listActivePolicies({ per_page: 100 })
      setActivePolicies(normalizeRows(response.data))
    } catch (error) {
      setActivePolicies([])
      setPolicyError(getErrorMessage(error, 'Policy lembur aktif gagal dimuat.'))
    } finally {
      setIsLoadingPolicies(false)
    }
  }, [])

  useEffect(() => {
    loadActivePolicies()
  }, [loadActivePolicies])

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lembur</h1>
          <p className="text-sm text-gray-500 mt-1">Ajukan, review, dan kelola policy lembur sesuai hak akses.</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          Role: <span className="font-semibold capitalize">{role}</span>
        </div>
      </header>

      {policyError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-amber-800">{policyError}</p>
          <button onClick={loadActivePolicies} className="text-sm font-medium text-amber-900 underline">Coba lagi</button>
        </div>
      )}

      <div className="overflow-x-auto border-b border-gray-200">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.value ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoadingPolicies && activeTab === 'mine' ? (
        <div className="py-12 flex justify-center"><div className="h-8 w-8 border-b-2 border-indigo-600 rounded-full animate-spin" /></div>
      ) : (
        <>
          {activeTab === 'mine' && <OvertimeRequestPanel mode="mine" role={role} user={user} activePolicies={activePolicies} />}
          {activeTab === 'review' && canReview && <OvertimeRequestPanel mode="review" role={role} user={user} activePolicies={activePolicies} />}
          {activeTab === 'policies' && canManagePolicies && <OvertimePolicyPanel onPoliciesChanged={loadActivePolicies} />}
        </>
      )}
    </div>
  )
}

export default OvertimePage
