import { useCallback, useEffect, useMemo, useState } from 'react'
import employeeService from '../../services/employeeService'
import payrollService from '../../services/payrollService'
import { formatCurrency, formatDate, getErrorMessage, getValidationErrors, mapSalaryProfilePayload, normalizeRows, salaryProfileInitial } from './payroll.helpers'
import { Alert, EmptyState, Field, LoadingState, Modal, dangerButton, inputClass, primaryButton, secondaryButton, selectClass } from './ui'

const getEmployeeName = (employee) => employee?.user?.name || employee?.name || employee?.full_name || `Employee #${employee?.id}`

const ProfilesTab = () => {
  const [employees, setEmployees] = useState([])
  const [components, setComponents] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [profiles, setProfiles] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(salaryProfileInitial)
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const selectedEmployee = useMemo(() => employees.find((item) => String(item.id) === String(employeeId)), [employeeId, employees])

  const loadOptions = useCallback(async () => {
    setLoadingOptions(true)
    try {
      const [employeeResponse, componentResponse] = await Promise.all([
        employeeService.getAll({ per_page: 100, status: 'active' }),
        payrollService.listSalaryComponents({ per_page: 100, active_only: 1 }),
      ])
      const employeeRows = normalizeRows(employeeResponse)
      setEmployees(employeeRows)
      setComponents(normalizeRows(componentResponse))
      setEmployeeId((current) => current || String(employeeRows[0]?.id || ''))
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Pilihan profil gaji gagal dimuat.') })
    } finally {
      setLoadingOptions(false)
    }
  }, [])

  const loadProfiles = useCallback(async () => {
    if (!employeeId) {
      setProfiles([])
      return
    }
    setLoading(true)
    try {
      setProfiles(normalizeRows(await payrollService.listSalaryProfiles(employeeId)))
    } catch (error) {
      setProfiles([])
      setAlert({ type: 'error', message: getErrorMessage(error, 'Profil gaji gagal dimuat.') })
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => { loadOptions() }, [loadOptions])
  useEffect(() => { loadProfiles() }, [loadProfiles])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...salaryProfileInitial, basic_salary: selectedEmployee?.basic_salary ?? '', effective_from: new Date().toISOString().slice(0, 10) })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (profile) => {
    setEditing(profile)
    setForm({
      basic_salary: profile.basic_salary ?? '',
      currency: profile.currency || 'IDR',
      effective_from: profile.effective_from || '',
      effective_to: profile.effective_to || '',
      is_active: profile.is_active !== false,
      notes: profile.notes || '',
      components: (profile.components || []).map((item) => ({
        salary_component_id: item.salary_component_id,
        amount: item.amount ?? '',
        percentage: item.percentage ?? '',
        formula: item.formula || '',
      })),
    })
    setErrors({})
    setModalOpen(true)
  }

  const toggleComponent = (component) => {
    setForm((current) => {
      const exists = current.components.some((item) => String(item.salary_component_id) === String(component.id))
      const assignment = {
        salary_component_id: component.id,
        amount: component.calculation_type === 'fixed' ? component.default_amount ?? '' : '',
        percentage: component.calculation_type === 'percentage' ? component.percentage ?? '' : '',
        formula: component.calculation_type === 'formula' ? component.formula || '' : '',
      }
      return {
        ...current,
        components: exists
          ? current.components.filter((item) => String(item.salary_component_id) !== String(component.id))
          : [...current.components, assignment],
      }
    })
  }

  const updateComponent = (componentId, field, value) => {
    setForm((current) => ({
      ...current,
      components: current.components.map((item) => String(item.salary_component_id) === String(componentId) ? { ...item, [field]: value } : item),
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    if (!employeeId) return
    setSubmitting(true)
    setErrors({})
    try {
      const payload = mapSalaryProfilePayload(form)
      if (editing) await payrollService.updateSalaryProfile(editing.id, payload)
      else await payrollService.createSalaryProfile(employeeId, payload)
      setAlert({ type: 'success', message: `Profil gaji berhasil ${editing ? 'diperbarui' : 'dibuat'}.` })
      setModalOpen(false)
      await loadProfiles()
    } catch (error) {
      setErrors(getValidationErrors(error))
      if (error?.response?.status !== 422) setAlert({ type: 'error', message: getErrorMessage(error, 'Profil gaji gagal disimpan.') })
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (profile) => {
    if (!window.confirm(`Hapus profil efektif ${formatDate(profile.effective_from)}?`)) return
    try {
      await payrollService.deleteSalaryProfile(profile.id)
      setAlert({ type: 'success', message: 'Profil gaji berhasil dihapus.' })
      await loadProfiles()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Profil gaji gagal dihapus.') })
    }
  }

  if (loadingOptions) return <LoadingState />

  return (
    <div className="space-y-4">
      <Alert alert={alert} onClose={() => setAlert({ message: '' })} />
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xl">
          <Field label="Karyawan">
            <select className={selectClass} value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>
              <option value="">Pilih karyawan</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{getEmployeeName(employee)} · {employee.employee_number || '-'}</option>)}
            </select>
          </Field>
        </div>
        <button type="button" onClick={openCreate} disabled={!employeeId} className={primaryButton}>+ Tambah Profil</button>
      </div>

      {selectedEmployee && <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4"><h3 className="font-semibold text-indigo-900">{getEmployeeName(selectedEmployee)}</h3><p className="text-sm text-indigo-700">{selectedEmployee.employee_number || '-'} · {selectedEmployee.department_name || selectedEmployee.department || '-'} · {selectedEmployee.position_name || selectedEmployee.position || '-'}</p></div>}

      {loading ? <LoadingState /> : !employeeId ? <EmptyState title="Pilih karyawan" /> : profiles.length === 0 ? <EmptyState title="Belum ada profil gaji" description="Buat profil efektif untuk sumber payroll." /> : (
        <div className="grid gap-4 xl:grid-cols-2">
          {profiles.map((profile) => (
            <article key={profile.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs uppercase text-gray-500">Gaji Pokok</p><p className="text-xl font-bold">{formatCurrency(profile.basic_salary, profile.currency)}</p><p className="mt-2 text-sm text-gray-600">{formatDate(profile.effective_from)} – {profile.effective_to ? formatDate(profile.effective_to) : 'seterusnya'}</p></div>
                <span className={`rounded-full px-2 py-1 text-xs ${profile.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{profile.is_active ? 'Aktif' : 'Nonaktif'}</span>
              </div>
              <div className="mt-4 border-t pt-4 text-sm text-gray-600">{profile.components?.length || 0} komponen tambahan</div>
              <div className="mt-4 flex gap-2"><button type="button" onClick={() => openEdit(profile)} className={secondaryButton}>Edit</button><button type="button" onClick={() => remove(profile)} className={dangerButton}>Hapus</button></div>
            </article>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Profil Gaji' : 'Tambah Profil Gaji'} size="max-w-4xl">
        <form onSubmit={save} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Gaji Pokok" required error={errors.basic_salary}><input type="number" min="0" step="0.01" className={inputClass} value={form.basic_salary} onChange={(event) => setForm((current) => ({ ...current, basic_salary: event.target.value }))} required /></Field>
            <Field label="Mata Uang" required error={errors.currency}><input maxLength="3" className={inputClass} value={form.currency} onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} required /></Field>
            <Field label="Efektif Mulai" required error={errors.effective_from}><input type="date" className={inputClass} value={form.effective_from} onChange={(event) => setForm((current) => ({ ...current, effective_from: event.target.value }))} required /></Field>
            <Field label="Efektif Sampai" error={errors.effective_to}><input type="date" className={inputClass} value={form.effective_to} onChange={(event) => setForm((current) => ({ ...current, effective_to: event.target.value }))} /></Field>
          </div>
          <Field label="Catatan" error={errors.notes}><textarea rows="2" className={inputClass} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></Field>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} /> Aktif</label>

          <section className="space-y-3">
            <div><h3 className="font-semibold">Komponen Gaji</h3><p className="text-sm text-gray-500">Pilih komponen dan isi override bila diperlukan.</p></div>
            {components.map((component) => {
              const assignment = form.components.find((item) => String(item.salary_component_id) === String(component.id))
              return (
                <div key={component.id} className={`rounded-xl border p-4 ${assignment ? 'border-indigo-300 bg-indigo-50/40' : ''}`}>
                  <label className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1" checked={Boolean(assignment)} onChange={() => toggleComponent(component)} /><span><strong>{component.name}</strong> <span className="font-mono text-xs text-gray-500">{component.code}</span><span className="block text-xs text-gray-500">{component.type} · {component.calculation_type}</span></span></label>
                  {assignment && <div className="mt-3 pl-6">{component.calculation_type === 'percentage' ? <input aria-label={`${component.name} percentage`} type="number" min="0" step="0.0001" className={inputClass} value={assignment.percentage ?? ''} onChange={(event) => updateComponent(component.id, 'percentage', event.target.value)} /> : component.calculation_type === 'formula' ? <textarea aria-label={`${component.name} formula`} rows="2" className={inputClass} value={assignment.formula || ''} onChange={(event) => updateComponent(component.id, 'formula', event.target.value)} /> : <input aria-label={`${component.name} amount`} type="number" min="0" step="0.01" className={inputClass} value={assignment.amount ?? ''} onChange={(event) => updateComponent(component.id, 'amount', event.target.value)} />}</div>}
                </div>
              )
            })}
          </section>

          <div className="flex justify-end gap-3"><button type="button" onClick={() => setModalOpen(false)} className={secondaryButton}>Batal</button><button type="submit" disabled={submitting} className={primaryButton}>{submitting ? 'Menyimpan...' : 'Simpan Profil'}</button></div>
        </form>
      </Modal>
    </div>
  )
}

export default ProfilesTab
