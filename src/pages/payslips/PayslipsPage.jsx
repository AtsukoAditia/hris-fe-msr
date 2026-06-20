import { useCallback, useEffect, useState } from 'react'
import payrollService from '../../services/payrollService'
import { saveBlobResponse } from '../../utils/downloadResponse'
import { formatCurrency, formatDate, getErrorMessage, normalizePagination, normalizeRows, statusClass } from '../payroll/payroll.helpers'
import { Alert, EmptyState, LoadingState, Modal, Pagination, primaryButton, secondaryButton } from '../payroll/ui'

const PayslipsPage = () => {
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [downloading, setDownloading] = useState(null)
  const [detail, setDetail] = useState(null)
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setAlert({ type: 'success', message: '' })
    try {
      const response = await payrollService.listMyPayslips({ page, per_page: 12 })
      setRows(normalizeRows(response))
      setPagination(normalizePagination(response))
    } catch (error) {
      setRows([])
      setAlert({ type: 'error', message: getErrorMessage(error, 'Riwayat slip gaji gagal dimuat.') })
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    load()
  }, [load])

  const openDetail = async (payroll) => {
    setDetailLoading(true)
    setAlert({ type: 'success', message: '' })
    try {
      const response = await payrollService.getMyPayslip(payroll.id)
      setDetail(response?.data?.data ?? response?.data ?? payroll)
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Detail slip gaji gagal dimuat.') })
    } finally {
      setDetailLoading(false)
    }
  }

  const download = async (payroll) => {
    setDownloading(payroll.id)
    setAlert({ type: 'success', message: '' })
    try {
      const response = await payrollService.downloadMyPayslip(payroll.id)
      saveBlobResponse(response, `payslip-${payroll.id}.pdf`)
    } catch (error) {
      setAlert({ type: 'error', message: getErrorMessage(error, 'Slip gaji gagal diunduh.') })
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Slip Gaji Saya</h1>
        <p className="mt-1 text-sm text-gray-500">Lihat rincian pendapatan, potongan, dan unduh slip gaji yang sudah difinalisasi.</p>
      </header>

      <Alert alert={alert} onClose={() => setAlert({ type: 'success', message: '' })} />

      {loading ? <LoadingState /> : rows.length === 0 ? (
        <EmptyState title="Belum ada slip gaji" description="Slip gaji akan muncul setelah payroll difinalisasi oleh HR." />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Pendapatan</th>
                  <th className="px-4 py-3 text-right">Potongan</th>
                  <th className="px-4 py-3 text-right">Gaji Bersih</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((payroll) => (
                  <tr key={payroll.id}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-900">{payroll.period?.name || '-'}</p><p className="text-xs text-gray-500">{formatDate(payroll.period?.start_date)} – {formatDate(payroll.period?.end_date)}</p></td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(payroll.status)}`}>{payroll.status}</span></td>
                    <td className="px-4 py-3 text-right">{formatCurrency(payroll.total_earnings, payroll.currency)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(payroll.total_deductions, payroll.currency)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(payroll.net_salary, payroll.currency)}</td>
                    <td className="px-4 py-3"><div className="flex justify-end gap-2"><button type="button" className={secondaryButton} onClick={() => openDetail(payroll)} disabled={detailLoading}>Detail</button><button type="button" className={primaryButton} onClick={() => download(payroll)} disabled={downloading === payroll.id}>{downloading === payroll.id ? 'Mengunduh...' : 'Unduh PDF'}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 md:hidden">
            {rows.map((payroll) => (
              <article key={payroll.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-gray-900">{payroll.period?.name || '-'}</h2><p className="text-xs text-gray-500">{formatDate(payroll.period?.start_date)} – {formatDate(payroll.period?.end_date)}</p></div><span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass(payroll.status)}`}>{payroll.status}</span></div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-gray-500">Pendapatan</p><p>{formatCurrency(payroll.total_earnings, payroll.currency)}</p></div><div><p className="text-xs text-gray-500">Potongan</p><p>{formatCurrency(payroll.total_deductions, payroll.currency)}</p></div><div className="col-span-2 rounded-lg bg-indigo-50 p-3"><p className="text-xs text-indigo-600">Gaji Bersih</p><p className="font-semibold text-indigo-800">{formatCurrency(payroll.net_salary, payroll.currency)}</p></div></div>
                <div className="mt-4 flex gap-2"><button type="button" className={`${secondaryButton} flex-1`} onClick={() => openDetail(payroll)}>Detail</button><button type="button" className={`${primaryButton} flex-1`} onClick={() => download(payroll)} disabled={downloading === payroll.id}>{downloading === payroll.id ? 'Mengunduh...' : 'Unduh PDF'}</button></div>
              </article>
            ))}
          </div>

          <Pagination pagination={pagination} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <Modal open={Boolean(detail) || detailLoading} title="Rincian Slip Gaji" onClose={() => !detailLoading && setDetail(null)} size="max-w-3xl">
        {detailLoading ? <LoadingState /> : detail && <PayslipDetail payroll={detail} onDownload={() => download(detail)} downloading={downloading === detail.id} />}
      </Modal>
    </div>
  )
}

const PayslipDetail = ({ payroll, onDownload, downloading }) => {
  const earnings = (payroll.items || []).filter((item) => item.type === 'earning')
  const deductions = (payroll.items || []).filter((item) => item.type === 'deduction')

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-gray-500">Periode</p><p className="font-medium">{payroll.period?.name || '-'}</p></div><div><p className="text-xs text-gray-500">Status</p><span className={`inline-block rounded-full px-2 py-1 text-xs ${statusClass(payroll.status)}`}>{payroll.status}</span></div></div>
      <Breakdown title="Pendapatan" rows={earnings} currency={payroll.currency} empty="Tidak ada komponen pendapatan." />
      <Breakdown title="Potongan" rows={deductions} currency={payroll.currency} empty="Tidak ada komponen potongan." />
      <div className="grid gap-3 sm:grid-cols-3"><Summary label="Total Pendapatan" value={formatCurrency(payroll.total_earnings, payroll.currency)} /><Summary label="Total Potongan" value={formatCurrency(payroll.total_deductions, payroll.currency)} /><Summary label="Gaji Bersih" value={formatCurrency(payroll.net_salary, payroll.currency)} highlight /></div>
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-200 p-4 text-sm sm:grid-cols-5"><Metric label="Hari Hadir" value={payroll.attendance_days} /><Metric label="Hari Absen" value={payroll.absent_days} /><Metric label="Menit Terlambat" value={payroll.late_minutes} /><Metric label="Cuti Unpaid" value={payroll.unpaid_leave_days} /><Metric label="Menit Lembur" value={payroll.overtime_minutes} /></div>
      <div className="flex justify-end"><button type="button" className={primaryButton} onClick={onDownload} disabled={downloading}>{downloading ? 'Mengunduh...' : 'Unduh Slip PDF'}</button></div>
    </div>
  )
}

const Breakdown = ({ title, rows, currency, empty }) => <section><h3 className="mb-2 font-semibold text-gray-900">{title}</h3>{rows.length === 0 ? <p className="text-sm text-gray-500">{empty}</p> : <div className="divide-y rounded-xl border border-gray-200">{rows.map((item) => <div key={item.id || `${item.code}-${item.name}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><div><p className="font-medium text-gray-800">{item.name}</p><p className="text-xs text-gray-500">{item.code} · {item.source}</p></div><span className="font-medium">{formatCurrency(item.amount, currency)}</span></div>)}</div>}</section>
const Summary = ({ label, value, highlight = false }) => <div className={`rounded-xl p-4 ${highlight ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}><p className={`text-xs ${highlight ? 'text-indigo-100' : 'text-gray-500'}`}>{label}</p><p className="mt-1 font-semibold">{value}</p></div>
const Metric = ({ label, value }) => <div><p className="text-xs text-gray-500">{label}</p><p className="font-medium text-gray-900">{value ?? 0}</p></div>

export default PayslipsPage
