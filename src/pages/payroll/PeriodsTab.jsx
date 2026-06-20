import { useCallback, useEffect, useState } from 'react'
import payrollService from '../../services/payrollService'
import {
  formatDate,
  getErrorMessage,
  getValidationErrors,
  normalizePagination,
  normalizeRows,
  payrollPeriodInitial,
  statusClass,
} from './payroll.helpers'
import {
  Alert,
  EmptyState,
  Field,
  LoadingState,
  Modal,
  Pagination,
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
  selectClass,
} from './ui'

const PeriodsTab = ({ onGenerated }) => {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [filters, setFilters] = useState({ search: '', status: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(payrollPeriodInitial)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (filters.search.trim()) params.search = filters.search.trim()
      if (filters.status) params.status = filters.status
      const response = await payrollService.listPayrollPeriods(params)
      setRows(normalizeRows(response))
      setPagination(normalizePagination(response))
    } catch (error) {
      setRows([])
      setAlert({ type: 'error', message: getErrorMessage(error, 'Periode payroll gagal dimuat.') })
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    const timer = window.setTimeout(load, 250)
    return () => window.clearTimeout(timer)
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(payrollPeriodInitial)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      cutoff_start_date: item.cutoff_start_date || '',
      cutoff_end_date: item.cutoff_end_date || '',
      status: item.status || 'open',
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
      }
      if (editing) {
        await payrollService.updatePayrollPeriod(editing.id, payload)
        setAlert({ type: 'success', message: 'Periode payroll berhasil diperbarui.' })
      } else {
        await payrollService.createPayrollPeriod(payload)
        setAlert({ type: 'success', message: 'Periode payroll berhasil dibuat.' })
      }
      setModalOpen(false)
      await load()
    } catch (error) {
      setErrors(getValidationErrors(error))
      if (error?.response?.status !== 422) {
        setAlert({ type: 'error', message: getErrorMessage(error, 'Periode payroll gagal disimpan.') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus periode "${item.name}"?`)) return
    try {
      await payrollService.deletePayrollPeriod(item.id)
      setAlert({ type: 'success', message: 'Periode payroll berhasil dihapus.' })
      await load()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Periode payroll gagal dihapus.') })
    }
  }

  const handleGenerate = async (item) => {
    if (!window.confirm(`Generate draft payroll untuk seluruh karyawan aktif pada periode "${item.name}"?`)) return
    setProcessingId(item.id)
    try {
      const response = await payrollService.generatePayroll(item.id)
      const count = response?.data?.meta?.generated_count ?? normalizeRows(response).length
      setAlert({ type: 'success', message: `${count} draft payroll berhasil dibuat atau dihitung ulang.` })
      await load()
      onGenerated?.(item)
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Draft payroll gagal dibuat.') })
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Alert alert={alert} onClose={() => setAlert({ message: '' })} />

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <Field label="Cari Periode">
            <input
              className={inputClass}
              value={filters.search}
              onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, search: event.target.value })) }}
              placeholder="Contoh: Juni 2026"
            />
          </Field>
          <Field label="Status">
            <select className={selectClass} value={filters.status} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value })) }}>
              <option value="">Semua status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
        </div>
        <button type="button" onClick={openCreate} className={primaryButton}>+ Tambah Periode</button>
      </div>

      {loading ? <LoadingState /> : rows.length === 0 ? (
        <EmptyState title="Belum ada periode payroll" description="Buat periode dan cutoff sebelum melakukan generate payroll." />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border bg-white lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Cutoff</th>
                  <th className="px-4 py-3">Payroll</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3">{formatDate(item.start_date)} – {formatDate(item.end_date)}</td>
                    <td className="px-4 py-3">{formatDate(item.cutoff_start_date)} – {formatDate(item.cutoff_end_date)}</td>
                    <td className="px-4 py-3">{item.payrolls_count ?? 0}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {item.status === 'open' && <button type="button" disabled={processingId === item.id} onClick={() => handleGenerate(item)} className="mr-3 font-medium text-green-700 hover:text-green-900 disabled:opacity-50">{processingId === item.id ? 'Memproses...' : 'Generate'}</button>}
                      <button type="button" onClick={() => openEdit(item)} className="mr-3 font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                      <button type="button" onClick={() => handleDelete(item)} className="font-medium text-red-600 hover:text-red-800">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 lg:hidden">
            {rows.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-600">{formatDate(item.start_date)} – {formatDate(item.end_date)}</p>
                    <p className="text-xs text-gray-500">Cutoff: {formatDate(item.cutoff_start_date)} – {formatDate(item.cutoff_end_date)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>
                </div>
                <p className="mt-3 text-sm text-gray-600">{item.payrolls_count ?? 0} payroll</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.status === 'open' && <button type="button" disabled={processingId === item.id} onClick={() => handleGenerate(item)} className={primaryButton}>{processingId === item.id ? 'Memproses...' : 'Generate'}</button>}
                  <button type="button" onClick={() => openEdit(item)} className={secondaryButton}>Edit</button>
                  <button type="button" onClick={() => handleDelete(item)} className={dangerButton}>Hapus</button>
                </div>
              </article>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Periode Payroll' : 'Tambah Periode Payroll'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Periode" required error={errors.name}>
            <input name="name" className={inputClass} value={form.name} onChange={handleChange} required placeholder="Juni 2026" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tanggal Mulai" required error={errors.start_date}>
              <input name="start_date" type="date" className={inputClass} value={form.start_date} onChange={handleChange} required />
            </Field>
            <Field label="Tanggal Selesai" required error={errors.end_date}>
              <input name="end_date" type="date" className={inputClass} value={form.end_date} onChange={handleChange} required />
            </Field>
            <Field label="Cutoff Mulai" required error={errors.cutoff_start_date}>
              <input name="cutoff_start_date" type="date" className={inputClass} value={form.cutoff_start_date} onChange={handleChange} required />
            </Field>
            <Field label="Cutoff Selesai" required error={errors.cutoff_end_date}>
              <input name="cutoff_end_date" type="date" className={inputClass} value={form.cutoff_end_date} onChange={handleChange} required />
            </Field>
          </div>
          <Field label="Status" required error={errors.status}>
            <select name="status" className={selectClass} value={form.status} onChange={handleChange}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={secondaryButton}>Batal</button>
            <button type="submit" disabled={submitting} className={primaryButton}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default PeriodsTab
