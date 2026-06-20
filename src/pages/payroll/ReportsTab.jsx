import { useCallback, useEffect, useState } from 'react'
import payrollService from '../../services/payrollService'
import { saveBlobResponse } from '../../utils/downloadResponse'
import { formatCurrency, getErrorMessage, normalizeRows, statusClass } from './payroll.helpers'
import { Alert, EmptyState, LoadingState, primaryButton, secondaryButton, selectClass, inputClass } from './ui'

const initialFilters = { payroll_period_id: '', status: '', search: '' }

const PayrollReportsTab = () => {
  const [periods, setPeriods] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState(initialFilters)
  const [summary, setSummary] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState('')
  const [downloading, setDownloading] = useState(null)
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  useEffect(() => {
    payrollService.listPayrollPeriods({ per_page: 100 })
      .then((response) => setPeriods(normalizeRows(response)))
      .catch(() => setPeriods([]))
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setAlert({ type: 'success', message: '' })
    const params = Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => String(value).trim() !== ''))
    try {
      const [summaryResponse, payrollResponse] = await Promise.all([
        payrollService.getPayrollReportSummary(params),
        payrollService.listPayrolls({ ...params, per_page: 100 }),
      ])
      setSummary(summaryResponse?.data?.data ?? summaryResponse?.data ?? null)
      setRows(normalizeRows(payrollResponse))
    } catch (error) {
      setSummary(null)
      setRows([])
      setAlert({ type: 'error', message: getErrorMessage(error, 'Laporan payroll gagal dimuat.') })
    } finally {
      setLoading(false)
    }
  }, [appliedFilters])

  useEffect(() => {
    load()
  }, [load])

  const applyFilters = (event) => {
    event.preventDefault()
    setAppliedFilters({ ...filters, search: filters.search.trim() })
  }

  const resetFilters = () => {
    setFilters(initialFilters)
    setAppliedFilters(initialFilters)
  }

  const exportReport = async (format) => {
    setExporting(format)
    setAlert({ type: 'success', message: '' })
    const params = Object.fromEntries(Object.entries(appliedFilters).filter(([, value]) => String(value).trim() !== ''))
    try {
      const response = await payrollService.exportPayrollReport(format, params)
      saveBlobResponse(response, `payroll-report.${format}`)
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, `Export ${format.toUpperCase()} gagal.`) })
    } finally {
      setExporting('')
    }
  }

  const downloadPayslip = async (payroll) => {
    setDownloading(payroll.id)
    try {
      const response = await payrollService.downloadAdminPayslip(payroll.id)
      saveBlobResponse(response, `payslip-${payroll.id}.pdf`)
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Payslip gagal diunduh.') })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-5">
      <Alert alert={alert} onClose={() => setAlert({ type: 'success', message: '' })} />

      <form onSubmit={applyFilters} className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:grid-cols-[1fr_1fr_2fr_auto]">
        <label className="space-y-1"><span className="text-xs font-medium text-gray-600">Periode</span><select aria-label="Filter periode payroll" className={selectClass} value={filters.payroll_period_id} onChange={(event) => setFilters((current) => ({ ...current, payroll_period_id: event.target.value }))}><option value="">Semua periode</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-medium text-gray-600">Status</span><select aria-label="Filter status payroll" className={selectClass} value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Semua status</option>{['draft', 'reviewed', 'finalized', 'paid', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
        <label className="space-y-1"><span className="text-xs font-medium text-gray-600">Cari Karyawan</span><input aria-label="Cari karyawan payroll" className={inputClass} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Nama atau nomor karyawan" /></label>
        <div className="flex items-end gap-2"><button type="submit" className={primaryButton}>Terapkan</button><button type="button" className={secondaryButton} onClick={resetFilters}>Reset</button></div>
      </form>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end"><button type="button" className={secondaryButton} onClick={() => exportReport('csv')} disabled={Boolean(exporting)}>{exporting === 'csv' ? 'Mengekspor...' : 'Export CSV'}</button><button type="button" className={primaryButton} onClick={() => exportReport('pdf')} disabled={Boolean(exporting)}>{exporting === 'pdf' ? 'Mengekspor...' : 'Export PDF'}</button></div>

      {loading ? <LoadingState /> : !summary ? <EmptyState title="Laporan belum tersedia" description="Pilih filter lalu coba muat kembali." /> : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><ReportCard label="Payroll Aktif" value={summary.active_records_count} /><ReportCard label="Total Pendapatan" value={formatCurrency(summary.total_earnings, summary.currency)} /><ReportCard label="Total Potongan" value={formatCurrency(summary.total_deductions, summary.currency)} /><ReportCard label="Total Gaji Bersih" value={formatCurrency(summary.total_net_salary, summary.currency)} highlight /></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{Object.entries(summary.status_counts || {}).map(([status, count]) => <div key={status} className="rounded-lg border border-gray-200 bg-white p-3 text-center"><span className={`rounded-full px-2 py-1 text-xs ${statusClass(status)}`}>{status}</span><p className="mt-2 text-xl font-semibold text-gray-900">{count}</p></div>)}</div>

          {rows.length === 0 ? <EmptyState title="Tidak ada payroll sesuai filter" /> : <ReportRows rows={rows} downloading={downloading} onDownload={downloadPayslip} />}
        </>
      )}
    </div>
  )
}

const ReportRows = ({ rows, downloading, onDownload }) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div className="hidden md:block"><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-4 py-3">Karyawan</th><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Gaji Bersih</th><th className="px-4 py-3 text-right">Payslip</th></tr></thead><tbody className="divide-y divide-gray-100">{rows.map((payroll) => <tr key={payroll.id}><td className="px-4 py-3"><p className="font-medium">{payroll.employee?.name || '-'}</p><p className="text-xs text-gray-500">{payroll.employee?.employee_number || '-'}</p></td><td className="px-4 py-3">{payroll.period?.name || '-'}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${statusClass(payroll.status)}`}>{payroll.status}</span></td><td className="px-4 py-3 text-right font-medium">{formatCurrency(payroll.net_salary, payroll.currency)}</td><td className="px-4 py-3 text-right">{['finalized', 'paid'].includes(payroll.status) ? <button type="button" className={secondaryButton} onClick={() => onDownload(payroll)} disabled={downloading === payroll.id}>{downloading === payroll.id ? 'Mengunduh...' : 'Unduh'}</button> : <span className="text-xs text-gray-400">Belum tersedia</span>}</td></tr>)}</tbody></table></div>
    <div className="divide-y md:hidden">{rows.map((payroll) => <article key={payroll.id} className="space-y-3 p-4"><div className="flex items-start justify-between"><div><p className="font-medium text-gray-900">{payroll.employee?.name || '-'}</p><p className="text-xs text-gray-500">{payroll.employee?.employee_number || '-'} · {payroll.period?.name || '-'}</p></div><span className={`rounded-full px-2 py-1 text-xs ${statusClass(payroll.status)}`}>{payroll.status}</span></div><p className="font-semibold text-gray-900">{formatCurrency(payroll.net_salary, payroll.currency)}</p>{['finalized', 'paid'].includes(payroll.status) && <button type="button" className={`${secondaryButton} w-full`} onClick={() => onDownload(payroll)} disabled={downloading === payroll.id}>{downloading === payroll.id ? 'Mengunduh...' : 'Unduh Payslip'}</button>}</article>)}</div>
  </div>
)

const ReportCard = ({ label, value, highlight = false }) => <div className={`rounded-xl border p-4 ${highlight ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-white'}`}><p className={`text-xs ${highlight ? 'text-indigo-600' : 'text-gray-500'}`}>{label}</p><p className={`mt-1 text-lg font-semibold ${highlight ? 'text-indigo-800' : 'text-gray-900'}`}>{value ?? 0}</p></div>

export default PayrollReportsTab
