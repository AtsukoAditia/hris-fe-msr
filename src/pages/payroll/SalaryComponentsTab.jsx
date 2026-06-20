import { useCallback, useEffect, useState } from 'react'
import payrollService from '../../services/payrollService'
import {
  getErrorMessage,
  getValidationErrors,
  mapSalaryComponentPayload,
  normalizePagination,
  normalizeRows,
  salaryComponentInitial,
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

const SalaryComponentsTab = () => {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [filters, setFilters] = useState({ search: '', type: '', status: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(salaryComponentInitial)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (filters.search.trim()) params.search = filters.search.trim()
      if (filters.type) params.type = filters.type
      if (filters.status) params.status = filters.status

      const response = await payrollService.listSalaryComponents(params)
      setRows(normalizeRows(response))
      setPagination(normalizePagination(response))
    } catch (error) {
      setRows([])
      setAlert({ type: 'error', message: getErrorMessage(error, 'Komponen gaji gagal dimuat.') })
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
    setForm(salaryComponentInitial)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      code: item.code || '',
      name: item.name || '',
      type: item.type || 'earning',
      calculation_type: item.calculation_type || 'fixed',
      default_amount: item.default_amount ?? '',
      percentage: item.percentage ?? '',
      formula: item.formula || '',
      description: item.description || '',
      is_active: item.is_active !== false,
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const payload = mapSalaryComponentPayload(form)
      if (editing) {
        await payrollService.updateSalaryComponent(editing.id, payload)
        setAlert({ type: 'success', message: 'Komponen gaji berhasil diperbarui.' })
      } else {
        await payrollService.createSalaryComponent(payload)
        setAlert({ type: 'success', message: 'Komponen gaji berhasil dibuat.' })
      }
      setModalOpen(false)
      await load()
    } catch (error) {
      setErrors(getValidationErrors(error))
      if (error?.response?.status !== 422) {
        setAlert({ type: 'error', message: getErrorMessage(error, 'Komponen gaji gagal disimpan.') })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus komponen gaji "${item.name}"?`)) return
    try {
      await payrollService.deleteSalaryComponent(item.id)
      setAlert({ type: 'success', message: 'Komponen gaji berhasil dihapus.' })
      await load()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Komponen gaji gagal dihapus.') })
    }
  }

  return (
    <div className="space-y-4">
      <Alert alert={alert} onClose={() => setAlert({ message: '' })} />

      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid flex-1 gap-3 sm:grid-cols-3">
          <Field label="Cari">
            <input
              className={inputClass}
              value={filters.search}
              onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, search: event.target.value })) }}
              placeholder="Kode atau nama"
            />
          </Field>
          <Field label="Tipe">
            <select className={selectClass} value={filters.type} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, type: event.target.value })) }}>
              <option value="">Semua tipe</option>
              <option value="earning">Pendapatan</option>
              <option value="deduction">Potongan</option>
            </select>
          </Field>
          <Field label="Status">
            <select className={selectClass} value={filters.status} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value })) }}>
              <option value="">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </Field>
        </div>
        <button type="button" onClick={openCreate} className={primaryButton}>+ Tambah Komponen</button>
      </div>

      {loading ? <LoadingState /> : rows.length === 0 ? (
        <EmptyState title="Belum ada komponen gaji" description="Tambahkan pendapatan atau potongan untuk profil gaji karyawan." />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border bg-white md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">Perhitungan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-medium">{item.code}</td>
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 capitalize">{item.type === 'earning' ? 'Pendapatan' : 'Potongan'}</td>
                    <td className="px-4 py-3 capitalize">{item.calculation_type}</td>
                    <td className="px-4 py-3">{item.is_active ? 'Aktif' : 'Nonaktif'}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => openEdit(item)} className="mr-3 font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                      <button type="button" onClick={() => handleDelete(item)} className="font-medium text-red-600 hover:text-red-800">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {rows.map((item) => (
              <article key={item.id} className="rounded-xl border bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-semibold text-indigo-700">{item.code}</p>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{item.type === 'earning' ? 'Pendapatan' : 'Potongan'} · {item.calculation_type}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => openEdit(item)} className={secondaryButton}>Edit</button>
                  <button type="button" onClick={() => handleDelete(item)} className={dangerButton}>Hapus</button>
                </div>
              </article>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Komponen Gaji' : 'Tambah Komponen Gaji'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kode" required error={errors.code}>
              <input name="code" className={inputClass} value={form.code} onChange={handleChange} required />
            </Field>
            <Field label="Nama" required error={errors.name}>
              <input name="name" className={inputClass} value={form.name} onChange={handleChange} required />
            </Field>
            <Field label="Tipe" required error={errors.type}>
              <select name="type" className={selectClass} value={form.type} onChange={handleChange}>
                <option value="earning">Pendapatan</option>
                <option value="deduction">Potongan</option>
              </select>
            </Field>
            <Field label="Jenis Perhitungan" required error={errors.calculation_type}>
              <select name="calculation_type" className={selectClass} value={form.calculation_type} onChange={handleChange}>
                <option value="fixed">Fixed</option>
                <option value="percentage">Percentage</option>
                <option value="formula">Formula-ready</option>
              </select>
            </Field>
          </div>

          {form.calculation_type === 'percentage' ? (
            <Field label="Persentase dari Gaji Pokok" error={errors.percentage}>
              <input name="percentage" type="number" min="0" step="0.0001" className={inputClass} value={form.percentage} onChange={handleChange} />
            </Field>
          ) : (
            <Field label="Nominal Default" error={errors.default_amount}>
              <input name="default_amount" type="number" min="0" step="0.01" className={inputClass} value={form.default_amount} onChange={handleChange} />
            </Field>
          )}

          {form.calculation_type === 'formula' && (
            <Field label="Formula / Catatan Perhitungan" error={errors.formula}>
              <textarea name="formula" rows="3" className={inputClass} value={form.formula} onChange={handleChange} placeholder="Formula disimpan sebagai konfigurasi; evaluator lanjutan belum diaktifkan." />
            </Field>
          )}

          <Field label="Deskripsi" error={errors.description}>
            <textarea name="description" rows="3" className={inputClass} value={form.description} onChange={handleChange} />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} /> Aktif
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={secondaryButton}>Batal</button>
            <button type="submit" disabled={submitting} className={primaryButton}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SalaryComponentsTab
