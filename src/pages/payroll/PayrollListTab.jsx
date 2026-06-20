import { useCallback, useEffect, useMemo, useState } from 'react'
import payrollService from '../../services/payrollService'
import { formatCurrency, formatDate, getErrorMessage, nextPayrollActions, normalizePagination, normalizeRows, statusClass } from './payroll.helpers'
import { Alert, EmptyState, Field, LoadingState, Modal, Pagination, dangerButton, inputClass, primaryButton, secondaryButton, selectClass } from './ui'

const PayrollListTab = ({ refreshKey = 0 }) => {
  const [rows, setRows] = useState([])
  const [periods, setPeriods] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [filters, setFilters] = useState({ search: '', payroll_period_id: '', status: '' })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [processing, setProcessing] = useState('')
  const [detail, setDetail] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const loadPeriods = useCallback(async () => {
    try {
      const response = await payrollService.listPayrollPeriods({ per_page: 100 })
      setPeriods(normalizeRows(response))
    } catch {
      setPeriods([])
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (filters.search.trim()) params.search = filters.search.trim()
      if (filters.payroll_period_id) params.payroll_period_id = filters.payroll_period_id
      if (filters.status) params.status = filters.status
      const response = await payrollService.listPayrolls(params)
      setRows(normalizeRows(response))
      setPagination(normalizePagination(response))
    } catch (error) {
      setRows([])
      setAlert({ type: 'error', message: getErrorMessage(error, 'Data payroll gagal dimuat.') })
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { loadPeriods() }, [loadPeriods])
  useEffect(() => {
    const timer = window.setTimeout(load, 250)
    return () => window.clearTimeout(timer)
  }, [load, refreshKey])

  const summary = useMemo(() => rows.reduce((result, item) => ({
    total: result.total + 1,
    earnings: result.earnings + Number(item.total_earnings || 0),
    deductions: result.deductions + Number(item.total_deductions || 0),
    net: result.net + Number(item.net_salary || 0),
  }), { total: 0, earnings: 0, deductions: 0, net: 0 }), [rows])

  const openDetail = async (item) => {
    setDetailLoading(true)
    setDetail(item)
    try {
      const response = await payrollService.getPayroll(item.id)
      setDetail(response?.data?.data || item)
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Detail payroll gagal dimuat.') })
    } finally {
      setDetailLoading(false)
    }
  }

  const runAction = async (item, action) => {
    const labels = {
      recalculate: 'hitung ulang',
      review: 'review',
      finalize: 'finalisasi',
      paid: 'tandai sudah dibayar',
    }
    if (!window.confirm(`Lanjutkan aksi ${labels[action]} untuk payroll ${item.employee?.name || item.id}?`)) return

    setProcessing(`${action}-${item.id}`)
    try {
      const request = {
        recalculate: payrollService.recalculatePayroll,
        review: payrollService.reviewPayroll,
        finalize: payrollService.finalizePayroll,
        paid: payrollService.markPayrollPaid,
      }[action]
      const response = await request(item.id)
      const updated = response?.data?.data
      setAlert({ type: 'success', message: `Payroll berhasil di-${labels[action]}.` })
      if (detail?.id === item.id && updated) setDetail(updated)
      await load()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Status payroll gagal diperbarui.') })
    } finally {
      setProcessing('')
    }
  }

  const cancelPayroll = async (event) => {
    event.preventDefault()
    if (!cancelTarget) return
    setProcessing(`cancel-${cancelTarget.id}`)
    try {
      await payrollService.cancelPayroll(cancelTarget.id, cancelReason.trim())
      setAlert({ type: 'success', message: 'Payroll berhasil dibatalkan.' })
      if (detail?.id === cancelTarget.id) setDetail(null)
      setCancelTarget(null)
      setCancelReason('')
      await load()
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Payroll gagal dibatalkan.') })
    } finally {
      setProcessing('')
    }
  }

  const renderActions = (item) => {
    const actions = nextPayrollActions(item.status)
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => openDetail(item)} className={secondaryButton}>Detail</button>
        {actions.canRecalculate && <button type="button" disabled={Boolean(processing)} onClick={() => runAction(item, 'recalculate')} className={secondaryButton}>Hitung Ulang</button>}
        {actions.canReview && <button type="button" disabled={Boolean(processing)} onClick={() => runAction(item, 'review')} className={primaryButton}>Review</button>}
        {actions.canFinalize && <button type="button" disabled={Boolean(processing)} onClick={() => runAction(item, 'finalize')} className={primaryButton}>Finalisasi</button>}
        {actions.canMarkPaid && <button type="button" disabled={Boolean(processing)} onClick={() => runAction(item, 'paid')} className={primaryButton}>Sudah Dibayar</button>}
        {actions.canCancel && <button type="button" disabled={Boolean(processing)} onClick={() => { setCancelTarget(item); setCancelReason('') }} className={dangerButton}>Batalkan</button>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert alert={alert} onClose={() => setAlert({ message: '' })} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Payroll pada Halaman" value={summary.total} />
        <SummaryCard label="Total Pendapatan" value={formatCurrency(summary.earnings)} />
        <SummaryCard label="Total Potongan" value={formatCurrency(summary.deductions)} />
        <SummaryCard label="Total Bersih" value={formatCurrency(summary.net)} />
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-3">
        <Field label="Cari Karyawan"><input className={inputClass} value={filters.search} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, search: event.target.value })) }} placeholder="Nama atau nomor karyawan" /></Field>
        <Field label="Periode"><select className={selectClass} value={filters.payroll_period_id} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, payroll_period_id: event.target.value })) }}><option value="">Semua periode</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></Field>
        <Field label="Status"><select className={selectClass} value={filters.status} onChange={(event) => { setPage(1); setFilters((current) => ({ ...current, status: event.target.value })) }}><option value="">Semua status</option>{['draft', 'reviewed', 'finalized', 'paid', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}</select></Field>
      </div>

      {loading ? <LoadingState /> : rows.length === 0 ? <EmptyState title="Belum ada payroll" description="Generate draft dari tab Periode Payroll." /> : (
        <>
          <div className="hidden overflow-x-auto rounded-xl border bg-white xl:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Karyawan</th><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Pendapatan</th><th className="px-4 py-3">Potongan</th><th className="px-4 py-3">Bersih</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr></thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {rows.map((item) => <tr key={item.id} className="align-top hover:bg-gray-50"><td className="px-4 py-3"><strong>{item.employee?.name || `Employee #${item.employee_id}`}</strong><span className="block text-xs text-gray-500">{item.employee?.employee_number || '-'}</span></td><td className="px-4 py-3">{item.period?.name || `#${item.payroll_period_id}`}</td><td className="px-4 py-3">{formatCurrency(item.total_earnings, item.currency)}</td><td className="px-4 py-3">{formatCurrency(item.total_deductions, item.currency)}</td><td className="px-4 py-3 font-semibold">{formatCurrency(item.net_salary, item.currency)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span></td><td className="px-4 py-3">{renderActions(item)}</td></tr>)}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 xl:hidden">
            {rows.map((item) => <article key={item.id} className="rounded-xl border bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{item.employee?.name || `Employee #${item.employee_id}`}</h3><p className="text-sm text-gray-500">{item.period?.name || `Periode #${item.payroll_period_id}`}</p></div><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span></div><div className="mt-4 grid grid-cols-3 gap-2 text-sm"><Metric label="Pendapatan" value={formatCurrency(item.total_earnings, item.currency)} /><Metric label="Potongan" value={formatCurrency(item.total_deductions, item.currency)} /><Metric label="Bersih" value={formatCurrency(item.net_salary, item.currency)} strong /></div><div className="mt-4">{renderActions(item)}</div></article>)}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <Modal open={Boolean(detail)} onClose={() => setDetail(null)} title="Detail Payroll" size="max-w-5xl">
        {detailLoading ? <LoadingState /> : detail && <PayrollDetail payroll={detail} actions={renderActions(detail)} />}
      </Modal>

      <Modal open={Boolean(cancelTarget)} onClose={() => setCancelTarget(null)} title="Batalkan Payroll">
        <form onSubmit={cancelPayroll} className="space-y-4"><p className="text-sm text-gray-600">Pembatalan dicatat ke audit log dan tidak dapat diproses ulang pada record yang sama.</p><Field label="Alasan" required><textarea rows="4" minLength="5" required className={inputClass} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></Field><div className="flex justify-end gap-3"><button type="button" onClick={() => setCancelTarget(null)} className={secondaryButton}>Kembali</button><button type="submit" disabled={cancelReason.trim().length < 5 || Boolean(processing)} className={dangerButton}>Konfirmasi Pembatalan</button></div></form>
      </Modal>
    </div>
  )
}

const SummaryCard = ({ label, value }) => <div className="rounded-xl border bg-white p-4"><p className="text-xs uppercase text-gray-500">{label}</p><p className="mt-1 text-xl font-bold text-gray-900">{value}</p></div>
const Metric = ({ label, value, strong }) => <div><p className="text-xs text-gray-500">{label}</p><p className={strong ? 'font-semibold' : ''}>{value}</p></div>

const PayrollDetail = ({ payroll, actions }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><SummaryCard label="Gaji Pokok" value={formatCurrency(payroll.basic_salary, payroll.currency)} /><SummaryCard label="Pendapatan" value={formatCurrency(payroll.total_earnings, payroll.currency)} /><SummaryCard label="Potongan" value={formatCurrency(payroll.total_deductions, payroll.currency)} /><SummaryCard label="Gaji Bersih" value={formatCurrency(payroll.net_salary, payroll.currency)} /></div>
    <div className="rounded-xl bg-gray-50 p-4 text-sm"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Hari Hadir" value={payroll.attendance_days ?? 0} /><Metric label="Hari Absen" value={payroll.absent_days ?? 0} /><Metric label="Menit Terlambat" value={payroll.late_minutes ?? 0} /><Metric label="Cuti Tidak Dibayar" value={payroll.unpaid_leave_days ?? 0} /><Metric label="Menit Lembur" value={payroll.overtime_minutes ?? 0} /></div></div>
    <div><h3 className="mb-3 font-semibold">Rincian Komponen</h3>{payroll.items?.length ? <div className="overflow-x-auto rounded-xl border"><table className="min-w-full divide-y text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Kode</th><th className="px-4 py-3">Nama</th><th className="px-4 py-3">Sumber</th><th className="px-4 py-3">Tipe</th><th className="px-4 py-3 text-right">Nominal</th></tr></thead><tbody className="divide-y">{payroll.items.map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono">{item.code}</td><td className="px-4 py-3">{item.name}</td><td className="px-4 py-3">{item.source}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount, payroll.currency)}</td></tr>)}</tbody></table></div> : <EmptyState title="Tidak ada rincian komponen" />}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><div><span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClass(payroll.status)}`}>{payroll.status}</span><p className="mt-2 text-xs text-gray-500">Periode: {payroll.period?.name || '-'} · Dibuat: {formatDate(payroll.generated_at || payroll.created_at)}</p></div>{actions}</div>
  </div>
)

export default PayrollListTab
