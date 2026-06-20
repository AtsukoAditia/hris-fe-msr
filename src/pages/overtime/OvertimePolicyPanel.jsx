import { useCallback, useEffect, useState } from 'react'
import overtimeService from '../../services/overtimeService'
import { emptyPolicyForm, formatMinutes, getErrorMessage, normalizeRows } from './overtime.helpers'

const OvertimePolicyPanel = ({ onPoliciesChanged }) => {
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(emptyPolicyForm)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 3000)
  }, [])

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await overtimeService.listPolicies({ per_page: 100 })
      setRows(normalizeRows(response.data))
    } catch (error) {
      setRows([])
      notify(getErrorMessage(error, 'Gagal memuat policy lembur.'), 'error')
    } finally {
      setIsLoading(false)
    }
  }, [notify])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setSelected(null)
    setForm(emptyPolicyForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setSelected(item)
    setForm({
      name: item.name || '',
      description: item.description || '',
      daily_max_minutes: Number(item.daily_max_minutes || 0),
      weekly_max_minutes: Number(item.weekly_max_minutes || 0),
      rate_multiplier: Number(item.rate_multiplier || 1),
      is_active: Boolean(item.is_active),
    })
    setModalOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return notify('Nama policy wajib diisi.', 'error')
    if (Number(form.daily_max_minutes) < 1 || Number(form.weekly_max_minutes) < Number(form.daily_max_minutes)) {
      return notify('Batas mingguan harus sama atau lebih besar dari batas harian.', 'error')
    }
    if (Number(form.rate_multiplier) < 1) return notify('Pengali tarif minimal 1.', 'error')

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      daily_max_minutes: Number(form.daily_max_minutes),
      weekly_max_minutes: Number(form.weekly_max_minutes),
      rate_multiplier: Number(form.rate_multiplier),
      is_active: Boolean(form.is_active),
    }

    setBusy(selected?.id || 'create')
    try {
      if (selected) await overtimeService.updatePolicy(selected.id, payload)
      else await overtimeService.createPolicy(payload)
      notify(selected ? 'Policy lembur diperbarui.' : 'Policy lembur dibuat.')
      setModalOpen(false)
      await load()
      await onPoliciesChanged?.()
    } catch (error) {
      notify(getErrorMessage(error, 'Gagal menyimpan policy lembur.'), 'error')
    } finally {
      setBusy(null)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Hapus policy “${item.name}”?`)) return
    setBusy(item.id)
    try {
      await overtimeService.deletePolicy(item.id)
      notify('Policy lembur dihapus.')
      await load()
      await onPoliciesChanged?.()
    } catch (error) {
      notify(getErrorMessage(error, 'Policy yang sudah dipakai tidak dapat dihapus.'), 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      {toast && <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg text-white text-sm ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>{toast.message}</div>}
      <div className="flex justify-between items-center gap-3">
        <p className="text-sm text-gray-500">{rows.filter((item) => item.is_active).length} policy aktif dari {rows.length} policy.</p>
        <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Tambah Policy</button>
      </div>

      {isLoading ? <Loading /> : rows.length === 0 ? <Empty /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map((item) => (
            <article key={item.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between gap-3">
                <div><h3 className="font-semibold text-gray-900">{item.name}</h3><p className="text-sm text-gray-500 mt-1">{item.description || 'Tanpa deskripsi'}</p></div>
                <span className={`text-xs px-2.5 py-1 rounded-full h-fit ${item.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <Metric label="Harian" value={formatMinutes(item.daily_max_minutes)} />
                <Metric label="Mingguan" value={formatMinutes(item.weekly_max_minutes)} />
                <Metric label="Tarif" value={`${item.rate_multiplier}x`} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} disabled={busy === item.id} className="border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-lg text-sm">Edit</button>
                <button onClick={() => remove(item)} disabled={busy === item.id} className="border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-sm">Hapus</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && <PolicyModal form={form} setForm={setForm} busy={busy !== null} title={selected ? 'Edit policy lembur' : 'Tambah policy lembur'} onClose={() => setModalOpen(false)} onSave={save} />}
    </div>
  )
}

const PolicyModal = ({ form, setForm, busy, title, onClose, onSave }) => (
  <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
    <div role="dialog" aria-modal="true" className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
      <div className="flex justify-between"><h2 className="text-lg font-semibold">{title}</h2><button aria-label="Tutup modal" onClick={onClose}>✕</button></div>
      <Input label="Nama policy" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
      <Input label="Deskripsi" value={form.description} onChange={(value) => setForm((current) => ({ ...current, description: value }))} multiline />
      <div className="grid grid-cols-2 gap-3"><Input label="Maks. harian (menit)" type="number" value={form.daily_max_minutes} onChange={(value) => setForm((current) => ({ ...current, daily_max_minutes: value }))} /><Input label="Maks. mingguan (menit)" type="number" value={form.weekly_max_minutes} onChange={(value) => setForm((current) => ({ ...current, weekly_max_minutes: value }))} /></div>
      <Input label="Pengali tarif" type="number" step="0.1" value={form.rate_multiplier} onChange={(value) => setForm((current) => ({ ...current, rate_multiplier: value }))} />
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} />Policy aktif</label>
      <div className="flex gap-3"><button onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm">Batal</button><button onClick={onSave} disabled={busy} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm disabled:opacity-50">{busy ? 'Menyimpan...' : 'Simpan'}</button></div>
    </div>
  </div>
)

const Input = ({ label, value, onChange, type = 'text', step, multiline = false }) => { const id = `policy-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`; return <div><label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>{multiline ? <textarea id={id} rows={3} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" /> : <input id={id} type={type} min={type === 'number' ? 1 : undefined} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />}</div> }
const Metric = ({ label, value }) => <div><p className="text-xs text-gray-400">{label}</p><p className="font-medium text-gray-800">{value}</p></div>
const Loading = () => <div className="py-12 flex justify-center"><div className="h-8 w-8 border-b-2 border-indigo-600 rounded-full animate-spin" /></div>
const Empty = () => <div className="bg-white rounded-xl border py-12 text-center text-gray-500">Belum ada policy lembur.</div>

export default OvertimePolicyPanel
