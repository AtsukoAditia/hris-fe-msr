import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import documentService from '../../services/documentService'
import profileService from '../../services/profileService'
import DocumentFilters from './components/DocumentFilters'
import DocumentFormModal from './components/DocumentFormModal'
import DocumentList from './components/DocumentList'
import DocumentSummary from './components/DocumentSummary'
import ReplaceDocumentModal from './components/ReplaceDocumentModal'
import {
  buildFilterParams,
  downloadBlobResponse,
  initialDocumentFilters,
  initialDocumentForm,
  mapMetadataPayload,
  normalizeCategories,
  normalizeDocumentList,
  normalizeSummary,
  toDocumentForm,
  toReplaceFormData,
  toUploadFormData,
} from './document.helpers'

const DocumentsPage = () => {
  const { employeeId } = useParams()
  const isAdminView = Boolean(employeeId)
  const [documents, setDocuments] = useState([])
  const [categories, setCategories] = useState([])
  const [summary, setSummary] = useState(normalizeSummary())
  const [employee, setEmployee] = useState(null)
  const [filters, setFilters] = useState(initialDocumentFilters)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [formData, setFormData] = useState(initialDocumentForm)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [replaceDocument, setReplaceDocument] = useState(null)
  const [replacementFile, setReplacementFile] = useState(null)
  const [replaceError, setReplaceError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const loadCategories = useCallback(async () => {
    try {
      setCategories(normalizeCategories(await documentService.getCategories()))
    } catch {
      setCategories([])
    }
  }, [])

  const loadEmployee = useCallback(async () => {
    if (!isAdminView) return
    try {
      const response = await profileService.getByEmployee(employeeId)
      setEmployee(response?.data?.data?.employee || null)
    } catch {
      setEmployee(null)
    }
  }, [employeeId, isAdminView])

  const loadDocuments = useCallback(async () => {
    setLoading(true)
    setPageError('')
    try {
      const params = buildFilterParams(filters, page)
      const [listResponse, summaryResponse] = await Promise.all([
        isAdminView
          ? documentService.getEmployeeDocuments(employeeId, params)
          : documentService.getMine(params),
        isAdminView
          ? documentService.getSummary({ employee_id: employeeId, expires_within_days: params.expires_within_days })
          : documentService.getMineSummary({ expires_within_days: params.expires_within_days }),
      ])
      const list = normalizeDocumentList(listResponse)
      setDocuments(list.items)
      setPagination(list.pagination)
      setSummary(normalizeSummary(summaryResponse))
    } catch (error) {
      setDocuments([])
      setPagination(null)
      setPageError(error.response?.data?.message || 'Gagal memuat dokumen.')
    } finally {
      setLoading(false)
    }
  }, [employeeId, filters, isAdminView, page])

  useEffect(() => {
    loadCategories()
    loadEmployee()
  }, [loadCategories, loadEmployee])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  const changeFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters(initialDocumentFilters)
    setPage(1)
  }

  const changeForm = (event) => {
    const { name, value, type, checked, files } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files?.[0] || null : value,
    }))
    setFormErrors((current) => ({ ...current, [name]: undefined }))
  }

  const openUpload = () => {
    setSelectedDocument(null)
    setFormData(initialDocumentForm)
    setFormErrors({})
    setFormOpen(true)
  }

  const openEdit = (document) => {
    setSelectedDocument(document)
    setFormData(toDocumentForm(document))
    setFormErrors({})
    setFormOpen(true)
  }

  const submitDocument = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setFormErrors({})
    try {
      if (selectedDocument) {
        await documentService.updateEmployeeDocument(employeeId, selectedDocument.id, mapMetadataPayload(formData))
      } else {
        await documentService.uploadEmployeeDocument(employeeId, toUploadFormData(formData))
      }
      setFormOpen(false)
      notify(selectedDocument ? 'Metadata dokumen berhasil diperbarui.' : 'Dokumen berhasil diunggah.')
      await loadDocuments()
    } catch (error) {
      setFormErrors(error.response?.data?.errors || {})
      notify(error.response?.data?.message || 'Gagal menyimpan dokumen.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const submitReplacement = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setReplaceError('')
    try {
      await documentService.replaceEmployeeDocument(employeeId, replaceDocument.id, toReplaceFormData(replacementFile))
      setReplaceDocument(null)
      setReplacementFile(null)
      notify('File dokumen berhasil diganti.')
      await loadDocuments()
    } catch (error) {
      setReplaceError(error.response?.data?.errors?.file?.[0] || error.response?.data?.message || 'Gagal mengganti file.')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteDocument = async (document) => {
    if (!window.confirm(`Hapus dokumen ${document.title}?`)) return
    try {
      await documentService.deleteEmployeeDocument(employeeId, document.id)
      notify('Dokumen berhasil dihapus.')
      await loadDocuments()
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal menghapus dokumen.', 'error')
    }
  }

  const downloadDocument = async (document) => {
    setDownloadingId(document.id)
    try {
      const response = isAdminView
        ? await documentService.downloadEmployeeDocument(employeeId, document.id)
        : await documentService.downloadMine(document.id)
      downloadBlobResponse(response, document.file?.original_name || 'document')
    } catch (error) {
      notify(error.response?.data?.message || 'Gagal mengunduh dokumen.', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          {isAdminView && <Link to="/employee" aria-label="Kembali ke daftar karyawan" className="mt-1 rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><ArrowLeft className="h-5 w-5" /></Link>}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isAdminView ? 'Dokumen Karyawan' : 'Dokumen Saya'}</h1>
            <p className="mt-1 text-gray-600">{isAdminView ? `${employee?.name || `Employee #${employeeId}`} · ${employee?.employee_number || ''}` : 'Lihat dan unduh dokumen kepegawaian Anda.'}</p>
          </div>
        </div>
        {isAdminView && <button type="button" onClick={openUpload} className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"><Plus className="mr-2 h-4 w-4" />Unggah Dokumen</button>}
      </header>

      <DocumentSummary summary={summary} />
      <DocumentFilters filters={filters} categories={categories} onChange={changeFilter} onReset={resetFilters} />

      {pageError && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{pageError}<button type="button" onClick={loadDocuments} className="ml-2 font-semibold underline">Coba lagi</button></div>}
      <DocumentList documents={documents} loading={loading} canManage={isAdminView} downloadingId={downloadingId} onDownload={downloadDocument} onEdit={openEdit} onReplace={(document) => { setReplaceDocument(document); setReplacementFile(null); setReplaceError('') }} onDelete={deleteDocument} />

      {pagination?.last_page > 1 && (
        <nav aria-label="Pagination dokumen" className="flex items-center justify-center gap-3">
          <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Sebelumnya</button>
          <span className="text-sm text-gray-600">Halaman {pagination.current_page} dari {pagination.last_page}</span>
          <button type="button" disabled={page >= pagination.last_page} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40">Berikutnya</button>
        </nav>
      )}

      {formOpen && <DocumentFormModal document={selectedDocument} categories={categories} formData={formData} errors={formErrors} submitting={submitting} onChange={changeForm} onClose={() => !submitting && setFormOpen(false)} onSubmit={submitDocument} />}
      {replaceDocument && <ReplaceDocumentModal document={replaceDocument} file={replacementFile} error={replaceError} submitting={submitting} onFileChange={(event) => setReplacementFile(event.target.files?.[0] || null)} onClose={() => !submitting && setReplaceDocument(null)} onSubmit={submitReplacement} />}
      {toast && <div className={`fixed right-4 top-4 z-[60] max-w-sm rounded-lg px-5 py-3 text-sm text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>{toast.message}</div>}
    </div>
  )
}

export default DocumentsPage
