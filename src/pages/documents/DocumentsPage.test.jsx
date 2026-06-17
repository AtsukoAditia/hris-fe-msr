import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DocumentsPage from './DocumentsPage'

const mocks = vi.hoisted(() => ({
  getCategories: vi.fn(), getMine: vi.fn(), getMineSummary: vi.fn(), downloadMine: vi.fn(),
  getEmployeeDocuments: vi.fn(), getSummary: vi.fn(), uploadEmployeeDocument: vi.fn(),
  updateEmployeeDocument: vi.fn(), replaceEmployeeDocument: vi.fn(), deleteEmployeeDocument: vi.fn(),
  downloadEmployeeDocument: vi.fn(), getByEmployee: vi.fn(),
}))

vi.mock('../../services/documentService', () => ({ default: {
  getCategories: mocks.getCategories,
  getMine: mocks.getMine,
  getMineSummary: mocks.getMineSummary,
  downloadMine: mocks.downloadMine,
  getEmployeeDocuments: mocks.getEmployeeDocuments,
  getSummary: mocks.getSummary,
  uploadEmployeeDocument: mocks.uploadEmployeeDocument,
  updateEmployeeDocument: mocks.updateEmployeeDocument,
  replaceEmployeeDocument: mocks.replaceEmployeeDocument,
  deleteEmployeeDocument: mocks.deleteEmployeeDocument,
  downloadEmployeeDocument: mocks.downloadEmployeeDocument,
} }))
vi.mock('../../services/profileService', () => ({ default: { getByEmployee: mocks.getByEmployee } }))

const documentItem = {
  id: 7,
  employee_id: 42,
  category: 'employment',
  category_label: 'Kepegawaian',
  title: 'Employment Contract',
  description: 'Permanent contract',
  labels: ['contract'],
  file: { original_name: 'contract.pdf', size_bytes: 2048, version: 1 },
  issue_date: '2026-01-01',
  expiry_date: '2026-07-01',
  expiry_status: 'expiring',
  days_until_expiry: 14,
  is_confidential: true,
}

const listResponse = () => ({ data: { data: {
  data: [documentItem], current_page: 1, last_page: 1, per_page: 15, total: 1,
} } })
const summaryResponse = () => ({ data: { data: {
  total: 1, valid: 0, expiring: 1, expired: 0, without_expiry: 0, warning_days: 30,
} } })
const categoriesResponse = { data: { data: [
  { value: 'employment', label: 'Kepegawaian' },
  { value: 'identity', label: 'Identitas' },
] } }

const renderPage = (path = '/documents') => render(
  <MemoryRouter initialEntries={[path]}>
    <Routes>
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/employee/:employeeId/documents" element={<DocumentsPage />} />
      <Route path="/employee" element={<div>Employee List</div>} />
    </Routes>
  </MemoryRouter>,
)

describe('Employee Documents page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getCategories.mockResolvedValue(categoriesResponse)
    mocks.getMine.mockResolvedValue(listResponse())
    mocks.getMineSummary.mockResolvedValue(summaryResponse())
    mocks.getEmployeeDocuments.mockResolvedValue(listResponse())
    mocks.getSummary.mockResolvedValue(summaryResponse())
    mocks.getByEmployee.mockResolvedValue({ data: { data: { employee: { id: 42, name: 'Managed Employee', employee_number: 'EMP-0042' } } } })
    mocks.uploadEmployeeDocument.mockResolvedValue({ data: { data: documentItem } })
    mocks.updateEmployeeDocument.mockResolvedValue({ data: { data: documentItem } })
    mocks.replaceEmployeeDocument.mockResolvedValue({ data: { data: documentItem } })
    mocks.deleteEmployeeDocument.mockResolvedValue({ data: { success: true } })
    mocks.downloadMine.mockResolvedValue({ data: new Blob(['file']), headers: { 'content-disposition': 'attachment; filename="contract.pdf"' } })
    mocks.downloadEmployeeDocument.mockResolvedValue({ data: new Blob(['file']), headers: { 'content-disposition': 'attachment; filename="contract.pdf"' } })
    URL.createObjectURL = vi.fn(() => 'blob:test')
    URL.revokeObjectURL = vi.fn()
    HTMLAnchorElement.prototype.click = vi.fn()
    window.confirm = vi.fn(() => true)
  })

  it('loads self-service summary and documents without management actions', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Dokumen Saya' })).toBeInTheDocument()
    expect(screen.getByText('Employment Contract')).toBeInTheDocument()
    expect(screen.getAllByText('Segera Kedaluwarsa')).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Unggah Dokumen' })).not.toBeInTheDocument()
    expect(screen.queryByTitle('Edit metadata')).not.toBeInTheDocument()
    expect(mocks.getMine).toHaveBeenCalled()
  })

  it('downloads a self-service document through the private endpoint', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Employment Contract')
    await user.click(screen.getByRole('button', { name: 'Unduh' }))

    await waitFor(() => expect(mocks.downloadMine).toHaveBeenCalledWith(7))
    expect(URL.createObjectURL).toHaveBeenCalled()
  })

  it('uploads a document from the Admin Employee route', async () => {
    const user = userEvent.setup()
    renderPage('/employee/42/documents')

    expect(await screen.findByRole('heading', { name: 'Dokumen Karyawan' })).toBeInTheDocument()
    expect(await screen.findByText(/Managed Employee/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Unggah Dokumen' }))
    const dialog = screen.getByRole('dialog', { name: 'Unggah Dokumen Karyawan' })
    const file = new File(['%PDF'], 'new-contract.pdf', { type: 'application/pdf' })
    await user.upload(within(dialog).getByLabelText('File Dokumen'), file)
    await user.selectOptions(within(dialog).getByLabelText('Kategori'), 'employment')
    await user.type(within(dialog).getByLabelText('Judul Dokumen'), 'New Contract')
    fireEvent.submit(dialog.querySelector('form'))

    await waitFor(() => expect(mocks.uploadEmployeeDocument).toHaveBeenCalledWith('42', expect.any(FormData)))
    const submitted = mocks.uploadEmployeeDocument.mock.calls[0][1]
    expect(submitted.get('file').name).toBe('new-contract.pdf')
  })

  it('edits metadata and replaces a file from the Admin route', async () => {
    const user = userEvent.setup()
    renderPage('/employee/42/documents')
    await screen.findByText('Employment Contract')

    await user.click(screen.getByTitle('Edit metadata'))
    const editDialog = screen.getByRole('dialog', { name: 'Edit Metadata Dokumen' })
    await user.clear(within(editDialog).getByLabelText('Judul Dokumen'))
    await user.type(within(editDialog).getByLabelText('Judul Dokumen'), 'Updated Contract')
    await user.click(within(editDialog).getByRole('button', { name: 'Perbarui Metadata', exact: true }))
    await waitFor(() => expect(mocks.updateEmployeeDocument).toHaveBeenCalledWith('42', 7, expect.objectContaining({ title: 'Updated Contract' })))

    await user.click(screen.getByTitle('Ganti file'))
    const replaceDialog = screen.getByRole('dialog', { name: 'Ganti File Dokumen' })
    await user.upload(within(replaceDialog).getByLabelText('File Baru'), new File(['%PDF'], 'replacement.pdf', { type: 'application/pdf' }))
    fireEvent.submit(replaceDialog.querySelector('form'))
    await waitFor(() => expect(mocks.replaceEmployeeDocument).toHaveBeenCalledWith('42', 7, expect.any(FormData)))
  })
})
