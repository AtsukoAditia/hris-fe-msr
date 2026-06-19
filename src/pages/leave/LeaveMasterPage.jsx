import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import leaveAdminService from '../../services/leaveAdminService'

// ==================== Constants ====================

const ACCRUAL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

const TABS = [
  { id: 'leave-types', label: 'Leave Types' },
  { id: 'policies', label: 'Policies' },
  { id: 'holidays', label: 'Holidays' },
  { id: 'balances', label: 'Balances' },
]

// ==================== Status Badge ====================

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-600'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}

// ==================== Modal ====================

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

// ==================== Confirm Dialog ====================

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  )
}

// ==================== Loading / Empty ====================

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <p>{message}</p>
    </div>
  )
}

// ==================== Alert ====================

function Alert({ type, message, onClose }) {
  if (!message) return null
  const bgColor = type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
  return (
    <div className={`px-4 py-3 rounded-lg border mb-4 flex justify-between items-center ${bgColor}`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100">&times;</button>
    </div>
  )
}

// ==================== Form Field ====================

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
const selectClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white'
const btnPrimary = 'px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
const btnSecondary = 'px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200'

// ==================== Leave Types Tab ====================

function LeaveTypesTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({ name: '', code: '', requires_balance: true, max_days: '', is_active: true })

  const load = async () => {
    try {
      setLoading(true)
      const res = await leaveAdminService.getLeaveTypes()
      setItems(res.data.data)
    } catch {
      setAlert({ type: 'error', message: 'Failed to load leave types' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', requires_balance: true, max_days: '', is_active: true }); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, code: item.code, requires_balance: item.requires_balance, max_days: item.max_days ?? '', is_active: item.is_active }); setErrors({}); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = { ...form, max_days: form.max_days !== '' ? Number(form.max_days) : null }
      if (editing) {
        await leaveAdminService.updateLeaveType(editing.id, payload)
        setAlert({ type: 'success', message: 'Leave type updated' })
      } else {
        await leaveAdminService.createLeaveType(payload)
        setAlert({ type: 'success', message: 'Leave type created' })
      }
      setModalOpen(false)
      load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setAlert({ type: 'error', message: err.response?.data?.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await leaveAdminService.deleteLeaveType(deleteTarget.id)
      setAlert({ type: 'success', message: 'Leave type deleted' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' })
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ message: '' })} />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Leave Types</h3>
        <button onClick={openCreate} className={btnPrimary}>+ Add Leave Type</button>
      </div>
      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState message="No leave types found" /> : (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Requires Balance</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Max Days</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.requires_balance ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.max_days ?? '—'}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge isActive={item.is_active} /></td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Leave Type' : 'Create Leave Type'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required error={errors.name?.[0]}>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>
          <FormField label="Code" required error={errors.code?.[0]}>
            <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </FormField>
          <FormField label="Requires Balance">
            <select className={selectClass} value={form.requires_balance ? '1' : '0'} onChange={(e) => setForm({ ...form, requires_balance: e.target.value === '1' })}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </FormField>
          <FormField label="Max Days" error={errors.max_days?.[0]}>
            <input type="number" min="0" className={inputClass} value={form.max_days} onChange={(e) => setForm({ ...form, max_days: e.target.value })} placeholder="Unlimited if empty" />
          </FormField>
          <FormField label="Status">
            <select className={selectClass} value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Leave Type" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
    </div>
  )
}

// ==================== Policies Tab ====================

function PoliciesTab() {
  const [items, setItems] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [errors, setErrors] = useState({})
  const emptyForm = { leave_type_id: '', name: '', days_per_year: '', accrual: 'none', carry_forward: false, max_carry_forward: '', is_active: true }
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    try {
      setLoading(true)
      const [polRes, ltRes] = await Promise.all([
        leaveAdminService.getLeavePolicies(),
        leaveAdminService.getLeaveTypes(),
      ])
      setItems(polRes.data.data)
      setLeaveTypes(ltRes.data.data)
    } catch {
      setAlert({ type: 'error', message: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({
      leave_type_id: item.leave_type_id,
      name: item.name,
      days_per_year: item.days_per_year,
      accrual: item.accrual || 'none',
      carry_forward: item.carry_forward,
      max_carry_forward: item.max_carry_forward ?? '',
      is_active: item.is_active,
    })
    setErrors({})
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = {
        leave_type_id: Number(form.leave_type_id),
        name: form.name,
        days_per_year: Number(form.days_per_year),
        accrual: form.accrual,
        carry_forward: form.carry_forward,
        max_carry_forward: form.max_carry_forward !== '' ? Number(form.max_carry_forward) : null,
        is_active: form.is_active,
      }
      if (editing) {
        await leaveAdminService.updateLeavePolicy(editing.id, payload)
        setAlert({ type: 'success', message: 'Policy updated' })
      } else {
        await leaveAdminService.createLeavePolicy(payload)
        setAlert({ type: 'success', message: 'Policy created' })
      }
      setModalOpen(false)
      load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setAlert({ type: 'error', message: err.response?.data?.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await leaveAdminService.deleteLeavePolicy(deleteTarget.id)
      setAlert({ type: 'success', message: 'Policy deleted' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' })
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ message: '' })} />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Leave Policies</h3>
        <button onClick={openCreate} className={btnPrimary}>+ Add Policy</button>
      </div>
      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState message="No leave policies found" /> : (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days/Year</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Accrual</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Carry Forward</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Max CF</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.leave_type?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.days_per_year}</td>
                  <td className="px-4 py-3 text-sm text-center capitalize">{item.accrual || 'none'}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.carry_forward ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.max_carry_forward ?? '—'}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge isActive={item.is_active} /></td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Policy' : 'Create Policy'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Leave Type" required error={errors.leave_type_id?.[0]}>
            <select className={selectClass} value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })} required>
              <option value="">Select leave type</option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>{lt.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Name" required error={errors.name?.[0]}>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>
          <FormField label="Days Per Year" required error={errors.days_per_year?.[0]}>
            <input type="number" min="0" className={inputClass} value={form.days_per_year} onChange={(e) => setForm({ ...form, days_per_year: e.target.value })} required />
          </FormField>
          <FormField label="Accrual" error={errors.accrual?.[0]}>
            <select className={selectClass} value={form.accrual} onChange={(e) => setForm({ ...form, accrual: e.target.value })}>
              {ACCRUAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </FormField>
          <FormField label="Carry Forward">
            <select className={selectClass} value={form.carry_forward ? '1' : '0'} onChange={(e) => setForm({ ...form, carry_forward: e.target.value === '1' })}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </FormField>
          {form.carry_forward && (
            <FormField label="Max Carry Forward Days" error={errors.max_carry_forward?.[0]}>
              <input type="number" min="0" className={inputClass} value={form.max_carry_forward} onChange={(e) => setForm({ ...form, max_carry_forward: e.target.value })} />
            </FormField>
          )}
          <FormField label="Status">
            <select className={selectClass} value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Policy" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
    </div>
  )
}

// ==================== Holidays Tab ====================

function HolidaysTab() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [errors, setErrors] = useState({})
  const emptyForm = { name: '', date: '', is_recurring: false, is_active: true }
  const [form, setForm] = useState(emptyForm)

  const load = async () => {
    try {
      setLoading(true)
      const res = await leaveAdminService.getHolidays()
      setItems(res.data.data)
    } catch {
      setAlert({ type: 'error', message: 'Failed to load holidays' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => { setEditing(item); setForm({ name: item.name, date: item.date, is_recurring: item.is_recurring, is_active: item.is_active }); setErrors({}); setModalOpen(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = { ...form }
      if (editing) {
        await leaveAdminService.updateHoliday(editing.id, payload)
        setAlert({ type: 'success', message: 'Holiday updated' })
      } else {
        await leaveAdminService.createHoliday(payload)
        setAlert({ type: 'success', message: 'Holiday created' })
      }
      setModalOpen(false)
      load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setAlert({ type: 'error', message: err.response?.data?.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await leaveAdminService.deleteHoliday(deleteTarget.id)
      setAlert({ type: 'success', message: 'Holiday deleted' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' })
      setDeleteTarget(null)
    }
  }

  return (
    <div>
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ message: '' })} />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Holidays</h3>
        <button onClick={openCreate} className={btnPrimary}>+ Add Holiday</button>
      </div>
      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState message="No holidays found" /> : (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Recurring</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{item.date}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.is_recurring ? '✓' : '—'}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge isActive={item.is_active} /></td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Holiday' : 'Create Holiday'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" required error={errors.name?.[0]}>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </FormField>
          <FormField label="Date" required error={errors.date?.[0]}>
            <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </FormField>
          <FormField label="Recurring">
            <select className={selectClass} value={form.is_recurring ? '1' : '0'} onChange={(e) => setForm({ ...form, is_recurring: e.target.value === '1' })}>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
          </FormField>
          <FormField label="Status">
            <select className={selectClass} value={form.is_active ? '1' : '0'} onChange={(e) => setForm({ ...form, is_active: e.target.value === '1' })}>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Holiday" message={`Are you sure you want to delete "${deleteTarget?.name}"?`} />
    </div>
  )
}

// ==================== Balances Tab ====================

function BalancesTab() {
  const [items, setItems] = useState([])
  const [employees, setEmployees] = useState([])
  const [leaveTypes, setLeaveTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [adjustModalOpen, setAdjustModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [errors, setErrors] = useState({})
  const [filters, setFilters] = useState({ employee_id: '', leave_type_id: '' })
  const emptyForm = { employee_id: '', leave_type_id: '', year: new Date().getFullYear(), total_entitled: 0, total_used: 0, total_pending: 0, carried_forward: 0 }
  const emptyAdjust = { employee_id: '', leave_type_id: '', year: new Date().getFullYear(), adjustment: '', note: '' }
  const [form, setForm] = useState(emptyForm)
  const [adjustForm, setAdjustForm] = useState(emptyAdjust)

  const load = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.employee_id) params.employee_id = filters.employee_id
      if (filters.leave_type_id) params.leave_type_id = filters.leave_type_id
      const [balRes, empRes, ltRes] = await Promise.all([
        leaveAdminService.getLeaveBalances(params),
        leaveAdminService.getEmployees({ per_page: 500 }),
        leaveAdminService.getLeaveTypes(),
      ])
      setItems(balRes.data.data)
      setEmployees(empRes.data.data)
      setLeaveTypes(ltRes.data.data)
    } catch {
      setAlert({ type: 'error', message: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  const openEdit = (item) => {
    setEditing(item)
    setForm({
      employee_id: item.employee_id,
      leave_type_id: item.leave_type_id,
      year: item.year,
      total_entitled: item.total_entitled,
      total_used: item.total_used,
      total_pending: item.total_pending,
      carried_forward: item.carried_forward,
    })
    setErrors({})
    setModalOpen(true)
  }
  const openAdjust = (item) => {
    setAdjustForm({ ...emptyAdjust, employee_id: item.employee_id, leave_type_id: item.leave_type_id, year: item.year })
    setErrors({})
    setAdjustModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      const payload = {
        employee_id: Number(form.employee_id),
        leave_type_id: Number(form.leave_type_id),
        year: Number(form.year),
        total_entitled: Number(form.total_entitled),
        total_used: Number(form.total_used),
        total_pending: Number(form.total_pending),
        carried_forward: Number(form.carried_forward),
      }
      if (editing) {
        await leaveAdminService.updateLeaveBalance(editing.id, payload)
        setAlert({ type: 'success', message: 'Balance updated' })
      } else {
        await leaveAdminService.createLeaveBalance(payload)
        setAlert({ type: 'success', message: 'Balance created' })
      }
      setModalOpen(false)
      load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setAlert({ type: 'error', message: err.response?.data?.message || 'Operation failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleAdjust = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    try {
      await leaveAdminService.adjustLeaveBalance({
        employee_id: Number(adjustForm.employee_id),
        leave_type_id: Number(adjustForm.leave_type_id),
        year: Number(adjustForm.year),
        adjustment: Number(adjustForm.adjustment),
        note: adjustForm.note,
      })
      setAlert({ type: 'success', message: 'Balance adjusted' })
      setAdjustModalOpen(false)
      load()
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {})
      else setAlert({ type: 'error', message: err.response?.data?.message || 'Adjustment failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await leaveAdminService.deleteLeaveBalance(deleteTarget.id)
      setAlert({ type: 'success', message: 'Balance deleted' })
      setDeleteTarget(null)
      load()
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed' })
      setDeleteTarget(null)
    }
  }

  const getEmployeeName = (item) => item.employee?.user?.name || `Employee #${item.employee_id}`
  const getLeaveTypeName = (item) => item.leave_type?.name || `Type #${item.leave_type_id}`

  return (
    <div>
      <Alert type={alert.type} message={alert.message} onClose={() => setAlert({ message: '' })} />
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Leave Balances</h3>
        <div className="flex gap-2">
          <select className={`${selectClass} w-auto`} value={filters.employee_id} onChange={(e) => setFilters({ ...filters, employee_id: e.target.value })}>
            <option value="">All Employees</option>
            {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.user?.name}</option>)}
          </select>
          <select className={`${selectClass} w-auto`} value={filters.leave_type_id} onChange={(e) => setFilters({ ...filters, leave_type_id: e.target.value })}>
            <option value="">All Leave Types</option>
            {leaveTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
          </select>
          <button onClick={openCreate} className={btnPrimary}>+ Add Balance</button>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : items.length === 0 ? <EmptyState message="No leave balances found" /> : (
        <div className="overflow-x-auto bg-white rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Year</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Entitled</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Used</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pending</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Carried Forward</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{getEmployeeName(item)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{getLeaveTypeName(item)}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.year}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.total_entitled}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.total_used}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.total_pending}</td>
                  <td className="px-4 py-3 text-sm text-center">{item.carried_forward}</td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button onClick={() => openAdjust(item)} className="text-green-600 hover:text-green-800 mr-2">Adjust</button>
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                    <button onClick={() => setDeleteTarget(item)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Balance' : 'Create Balance'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Employee" required error={errors.employee_id?.[0]}>
            <select className={selectClass} value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.user?.name}</option>)}
            </select>
          </FormField>
          <FormField label="Leave Type" required error={errors.leave_type_id?.[0]}>
            <select className={selectClass} value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })} required>
              <option value="">Select leave type</option>
              {leaveTypes.map((lt) => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
            </select>
          </FormField>
          <FormField label="Year" required error={errors.year?.[0]}>
            <input type="number" min="2020" className={inputClass} value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Entitled" error={errors.total_entitled?.[0]}>
              <input type="number" min="0" className={inputClass} value={form.total_entitled} onChange={(e) => setForm({ ...form, total_entitled: e.target.value })} />
            </FormField>
            <FormField label="Carried Forward" error={errors.carried_forward?.[0]}>
              <input type="number" min="0" className={inputClass} value={form.carried_forward} onChange={(e) => setForm({ ...form, carried_forward: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Used" error={errors.total_used?.[0]}>
              <input type="number" min="0" className={inputClass} value={form.total_used} onChange={(e) => setForm({ ...form, total_used: e.target.value })} />
            </FormField>
            <FormField label="Total Pending" error={errors.total_pending?.[0]}>
              <input type="number" min="0" className={inputClass} value={form.total_pending} onChange={(e) => setForm({ ...form, total_pending: e.target.value })} />
            </FormField>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Saving...' : editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
      <Modal open={adjustModalOpen} onClose={() => setAdjustModalOpen(false)} title="Adjust Balance">
        <form onSubmit={handleAdjust} className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <p>Employee: <strong>{employees.find((e) => e.id == adjustForm.employee_id)?.user?.name || adjustForm.employee_id}</strong></p>
            <p>Leave Type: <strong>{leaveTypes.find((lt) => lt.id == adjustForm.leave_type_id)?.name || adjustForm.leave_type_id}</strong></p>
            <p>Year: <strong>{adjustForm.year}</strong></p>
          </div>
          <FormField label="Adjustment (use negative to deduct)" required error={errors.adjustment?.[0]}>
            <input type="number" className={inputClass} value={form.adjustment} onChange={(e) => setAdjustForm({ ...adjustForm, adjustment: e.target.value })} placeholder="e.g. 5 or -3" required />
          </FormField>
          <FormField label="Note" error={errors.note?.[0]}>
            <input className={inputClass} value={adjustForm.note} onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} placeholder="Reason for adjustment" />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAdjustModalOpen(false)} className={btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Adjusting...' : 'Apply Adjustment'}</button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Balance" message="Are you sure you want to delete this balance record?" />
    </div>
  )
}

// ==================== Main Page ====================

export default function LeaveMasterPage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('leave-types')

  const isAdminHR = ['admin', 'hr'].includes(user?.role)
  if (!isAdminHR) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 text-sm">You do not have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leave Management</h1>
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-6 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      {activeTab === 'leave-types' && <LeaveTypesTab />}
      {activeTab === 'policies' && <PoliciesTab />}
      {activeTab === 'holidays' && <HolidaysTab />}
      {activeTab === 'balances' && <BalancesTab />}
    </div>
  )
}