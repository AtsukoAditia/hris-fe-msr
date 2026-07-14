import { useCallback, useEffect, useState } from 'react'
import payrollService from '../../services/payrollService'
import { formatCurrency, getErrorMessage, normalizeRows } from './payroll.helpers'
import { Alert, Field, LoadingState, inputClass, primaryButton, secondaryButton, selectClass } from './ui'

const AdjustmentPanel = ({ payrollId, canEdit }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [alert, setAlert] = useState({ type: 'success', message: '' })
  const [form, setForm] = useState({ type: 'earning', code: '', name: '', amount: '', reason: '' })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await payrollService.listAdjustments(payrollId)
      setItems(normalizeRows(res))
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [payrollId])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await payrollService.addAdjustment(payrollId, {
        ...form,
        amount: Number(form.amount),
      })
      setAlert({ type: 'success', message: 'Penyesuaian berhasil ditambahkan.' })
      setForm({ type: 'earning', code: '', name: '', amount: '', reason: '' })
      setShowForm(false)
      await load()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Gagal menambahkan penyesuaian.') })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus penyesuaian ini?')) return
    try {
      await payrollService.deleteAdjustment(id)
      setAlert({ type: 'success', message: 'Penyesuaian berhasil dihapus.' })
      await load()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Gagal menghapus penyesuaian.') })
    }
  }

  const totalEarnings = items.filter((i) => i.type === 'earning').reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalDeductions = items.filter((i) => i.type === 'deduction').reduce((s, i) => s + Number(i.amount || 0), 0)

  return (
    <div className="rounded-xl border bg-white p-4 space-y-3">
      <Alert alert={alert} onClose={() => setAlert({ message: '' })} />

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Penyesuaian Manual</h3>
        {canEdit && !showForm && (
          <button type="button" onClick={() => setShowForm(true)} className={secondaryButton + ' !py-1 !px-3 !text-xs'}>+ Tambah</button>
        )}
      </div>

      {showForm && canEdit && (
        <form onSubmit={handleAdd} className="grid gap-2 sm:grid-cols-2 bg-gray-50 p-3 rounded-lg">
          <Field label="Tipe" required>
            <select className={selectClass} value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))}>
              <option value="earning">Pendapatan (+)</option>
              <option value="deduction">Potongan (-)</option>
            </select>
          </Field>
          <Field label="Kode" required>
            <input className={inputClass} value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} required maxLength={50} placeholder="ADJ-BONUS" />
          </Field>
          <Field label="Nama" required>
            <input className={inputClass} value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} required maxLength={120} placeholder="Bonus Kinerja" />
          </Field>
          <Field label="Nominal" required>
            <input type="number" min="0.01" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))} required />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Alasan">
              <input className={inputClass} value={form.reason} onChange={(e) => setForm((c) => ({ ...c, reason: e.target.value }))} maxLength={500} placeholder="Opsional" />
            </Field>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" disabled={submitting} className={primaryButton + ' !py-1.5 !text-xs'}>{submitting ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" onClick={() => setShowForm(false)} className={secondaryButton + ' !py-1.5 !text-xs'}>Batal</button>
          </div>
        </form>
      )}

      {loading ? <LoadingState /> : items.length === 0 ? (
        <p className="text-xs text-gray-500">Belum ada penyesuaian manual.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2">Tipe</th>
                <th className="px-3 py-2">Kode</th>
                <th className="px-3 py-2">Nama</th>
                <th className="px-3 py-2 text-right">Nominal</th>
                <th className="px-3 py-2">Alasan</th>
                {canEdit && <th className="px-3 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((adj) => (
                <tr key={adj.id}>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${adj.type === 'earning' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {adj.type === 'earning' ? '+' : '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{adj.code}</td>
                  <td className="px-3 py-2">{adj.name}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(adj.amount)}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{adj.reason || '-'}</td>
                  {canEdit && (
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => handleDelete(adj.id)} className="text-xs text-red-600 hover:text-red-800">Hapus</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex justify-end gap-4 text-xs">
          <span className="text-green-700">+ {formatCurrency(totalEarnings)}</span>
          <span className="text-red-700">- {formatCurrency(totalDeductions)}</span>
          <span className="font-semibold text-gray-900">Net: {formatCurrency(totalEarnings - totalDeductions)}</span>
        </div>
      )}
    </div>
  )
}

export default AdjustmentPanel
