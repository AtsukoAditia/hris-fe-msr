import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserCog } from 'lucide-react'
import { authService } from '../../services/authService'
import profileChangeRequestService from '../../services/profileChangeRequestService'
import { useAuthStore } from '../../store/authStore'
import CredentialCard from './CredentialCard'
import DataChangeForm from './DataChangeForm'
import RequestFilterBar from './RequestFilterBar'
import RequestList from './RequestList'
import RequestDetailPanel from './RequestDetailPanel'
import {
  buildChangeRequestPayload,
  buildFilterParams,
  initialPasswordForm,
  initialRequestFilters,
  initialRequestForm,
  normalizeDetailResponse,
  normalizeListResponse,
} from './selfService.helpers'

const EmployeeSelfServicePage = () => {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()
  const [credentialForm, setCredentialForm] = useState(initialPasswordForm)
  const [credentialErrors, setCredentialErrors] = useState({})
  const [savingCredential, setSavingCredential] = useState(false)
  const [requestForm, setRequestForm] = useState(initialRequestForm)
  const [requestErrors, setRequestErrors] = useState({})
  const [savingRequest, setSavingRequest] = useState(false)
  const [filters, setFilters] = useState(initialRequestFilters)
  const [requests, setRequests] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setPageError('')
    try {
      const response = await profileChangeRequestService.getMine(buildFilterParams(filters, page))
      const list = normalizeListResponse(response)
      setRequests(list.items)
      setPagination(list.pagination)
    } catch (error) {
      setRequests([])
      setPagination(null)
      setPageError(error.response?.data?.message || 'Gagal memuat request perubahan profil.')
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const changeCredentialForm = (event) => {
    const { name, value } = event.target
    setCredentialForm((current) => ({ ...current, [name]: value }))
    setCredentialErrors((current) => ({ ...current, [name]: undefined }))
  }

  const submitCredential = async (event) => {
    event.preventDefault()
    setSavingCredential(true)
    setCredentialErrors({})

    try {
      await authService.changePassword(credentialForm)
      notify('Kredensial berhasil diperbarui. Silakan masuk kembali.')
      window.setTimeout(() => {
        clearAuth()
        navigate('/login', { replace: true })
      }, 700)
    } catch (error) {
      setCredentialErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal memperbarui kredensial.', 'error')
    } finally {
      setSavingCredential(false)
    }
  }

  const changeRequestForm = (event) => {
    const { name, value } = event.target
    setRequestForm((current) => ({ ...current, [name]: value }))
    setRequestErrors((current) => ({ ...current, [name]: undefined, [`changes.${current.field}`]: undefined, changes: undefined }))
  }

  const submitRequest = async (event) => {
    event.preventDefault()
    setSavingRequest(true)
    setRequestErrors({})

    try {
      await profileChangeRequestService.createMine(buildChangeRequestPayload(requestForm))
      setRequestForm(initialRequestForm)
      notify('Request perubahan profil berhasil diajukan.')
      await loadRequests()
    } catch (error) {
      setRequestErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal mengajukan request.', 'error')
    } finally {
      setSavingRequest(false)
    }
  }

  const changeFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters(initialRequestFilters)
    setPage(1)
  }

  const openDetail = async (request) => {
    try {
      const response = await profileChangeRequestService.getMineDetail(request.id)
      setSelectedRequest(normalizeDetailResponse(response))
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal memuat detail request.', 'error')
    }
  }

  const cancelRequest = async (request) => {
    if (!window.confirm(`Batalkan request #${request.id}?`)) return
    try {
      await profileChangeRequestService.cancelMine(request.id)
      notify('Request berhasil dibatalkan.')
      await loadRequests()
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal membatalkan request.', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600"><UserCog className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employee Self-Service</h1>
            <p className="mt-1 text-gray-600">Kelola akun, ajukan perubahan profil, dan pantau status review.</p>
          </div>
        </div>
      </header>

      <CredentialCard form={credentialForm} errors={credentialErrors} submitting={savingCredential} onChange={changeCredentialForm} onSubmit={submitCredential} />
      <DataChangeForm form={requestForm} errors={requestErrors} submitting={savingRequest} onChange={changeRequestForm} onSubmit={submitRequest} />
      <RequestFilterBar filters={filters} onChange={changeFilter} onReset={resetFilters} />

      {pageError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{pageError}<button type="button" onClick={loadRequests} className="ml-2 font-semibold underline">Coba lagi</button></div>}
      <RequestList requests={requests} loading={loading} pagination={pagination} page={page} onPageChange={setPage} onDetail={openDetail} onCancel={cancelRequest} />

      {selectedRequest && <RequestDetailPanel request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      {toast && <div className={`fixed right-4 top-4 z-[60] max-w-sm rounded-lg px-5 py-3 text-sm text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{toast.message}</div>}
    </div>
  )
}

export default EmployeeSelfServicePage
