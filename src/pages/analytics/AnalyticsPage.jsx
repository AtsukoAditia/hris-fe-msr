import { useCallback, useEffect, useState } from 'react'
import analyticsService from '../../services/analyticsService'
import { formatCurrency, getErrorMessage } from '../payroll/payroll.helpers'
import { Alert, LoadingState } from '../payroll/ui'

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

export default function AnalyticsPage() {
  const [summary, setSummary] = useState(null)
  const [deptCosts, setDeptCosts] = useState([])
  const [attSummary, setAttSummary] = useState([])
  const [headcount, setHeadcount] = useState({ data: [], total: 0 })
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState({ type: 'success', message: '' })

  const load = useCallback(async () => {
    setLoading(true)
    setAlert({ type: 'success', message: '' })
    try {
      const [ex, dc, as_, hc] = await Promise.all([
        analyticsService.executiveSummary(),
        analyticsService.departmentCosts({ month, year }),
        analyticsService.attendanceSummary({ month, year }),
        analyticsService.headcount(),
      ])
      setSummary(ex?.data ?? ex)
      setDeptCosts(dc?.data?.data ?? dc?.data ?? [])
      setAttSummary(as_?.data?.data ?? as_?.data ?? [])
      setHeadcount(hc?.data ?? hc)
    } catch (e) {
      setAlert({ type: 'error', message: getErrorMessage(e, 'Gagal memuat analytics.') })
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  if (loading) return <div className="space-y-6"><header><h1 className="text-2xl font-bold text-gray-900">Analitik</h1></header><LoadingState /></div>

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Analitik & Laporan</h1>
        <p className="mt-1 text-sm text-gray-500">Ringkasan operasional perusahaan periode {MONTHS[month-1]} {year}.</p>
      </header>

      <Alert alert={alert} onClose={() => setAlert({ type: 'success', message: '' })} />

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <label className="text-sm font-medium text-gray-700">Periode:</label>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
          {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm">
          {[year-1, year, year+1].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Executive Summary */}
      {summary && (
        <>
          <Section title="Ringkasan Eksekutif">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Total Karyawan Aktif" value={summary.headcount?.total_active ?? 0} icon="👥" />
              <MetricCard label="Karyawan Baru (Bulan Ini)" value={summary.headcount?.new_hires_this_month ?? 0} icon="🆕" />
              <MetricCard label="Total Slip Gaji" value={summary.payroll?.employees_paid ?? 0} sub={`Rp ${fmt(summary.payroll?.total_net ?? 0)}`} icon="🧾" />
              <MetricCard label="Total PPh21" value={summary.payroll?.total_tax ? 'Rp ' + fmt(summary.payroll.total_tax) : 'N/A'} icon="🏛" />
            </div>
          </Section>

          <Section title="Kehadiran & Cuti">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <KpiCard label="Total Record" value={summary.attendance?.total_records ?? 0} />
              <KpiCard label="Hadir" value={summary.attendance?.present ?? 0} positive />
              <KpiCard label="Terlambat" value={summary.attendance?.late ?? 0} warn />
              <KpiCard label="Absen" value={summary.attendance?.absent ?? 0} negative />
              <KpiCard label="Cuti Disetujui" value={summary.leave?.total_approved_days ?? 0} unit="hari" />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Tingkat Kehadiran</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-bold text-gray-900">{summary.attendance?.attendance_rate ?? 0}%</span>
                  <div className="h-2 flex-1 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${summary.attendance?.attendance_rate ?? 0}%` }} />
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Cuti Bulan Ini</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {[['Disetujui', summary.leave?.approved ?? 0, 'text-green-600'],['Tertunda', summary.leave?.pending ?? 0, 'text-yellow-600'],['Ditolak', summary.leave?.rejected ?? 0, 'text-red-600']].map(([label, val, cls]) => (
                    <div key={label}><span className="text-xs text-gray-500">{label}: </span><span className={`font-semibold ${cls}`}>{val}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

      {/* Headcount Distribution */}
      {headcount.data?.length > 0 && (
        <Section title="Distribusi Karyawan per Departemen">
          <div className="space-y-3">
            {headcount.data.map((d) => (
              <div key={d.department} className="flex items-center gap-4">
                <span className="w-32 truncate text-sm font-medium text-gray-700">{d.department || 'Lainnya'}</span>
                <div className="flex-1 rounded-full bg-gray-100">
                  <div className="h-5 rounded-full bg-indigo-500 px-3 py-0.5 text-xs font-medium text-white"
                    style={{ width: `${d.percentage}%`, minWidth: d.percentage > 0 ? '2rem' : 0 }}>
                    {d.percentage > 5 ? `${d.percentage}%` : ''}
                  </div>
                </div>
                <span className="w-8 text-right text-sm text-gray-600">{d.count}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-400">Total: {headcount.total} karyawan aktif</p>
        </Section>
      )}

      {/* Department Costs */}
      {deptCosts.length > 0 && (
        <Section title="Biaya per Departemen">
          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3 text-right">Karyawan</th>
                  <th className="px-4 py-3 text-right">Gaji Dasar</th>
                  <th className="px-4 py-3 text-right">BPJS Karyawan</th>
                  <th className="px-4 py-3 text-right">BPJS Perusahaan</th>
                  <th className="px-4 py-3 text-right">PPh21</th>
                  <th className="px-4 py-3 text-right">Gaji Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {deptCosts.map((row) => (
                  <tr key={row.department} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.department || '-'}</td>
                    <td className="px-4 py-3 text-right">{row.headcount ?? 0}</td>
                    <td className="px-4 py-3 text-right">{rp(row.total_basic)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{rp(row.total_bpjs_ee)}</td>
                    <td className="px-4 py-3 text-right text-orange-600">{rp(row.total_bpjs_er)}</td>
                    <td className="px-4 py-3 text-right text-purple-600">{rp(row.total_tax)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{rp(row.total_net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Attendance by Department */}
      {attSummary.length > 0 && (
        <Section title="Kehadiran per Departemen">
          <div className="overflow-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3 text-right">Hadir</th>
                  <th className="px-4 py-3 text-right">Terlambat</th>
                  <th className="px-4 py-3 text-right">Absen</th>
                  <th className="px-4 py-3 text-right">Cuti</th>
                  <th className="px-4 py-3 text-right">Rata-rata Terlambat</th>
                  <th className="px-4 py-3 text-right">Total Lembur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attSummary.map((row) => (
                  <tr key={row.department} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.department || '-'}</td>
                    <td className="px-4 py-3 text-right text-green-700">{row.present_count ?? 0}</td>
                    <td className="px-4 py-3 text-right text-yellow-700">{row.late_count ?? 0}</td>
                    <td className="px-4 py-3 text-right text-red-700">{row.absent_count ?? 0}</td>
                    <td className="px-4 py-3 text-right text-blue-700">{row.leave_count ?? 0}</td>
                    <td className="px-4 py-3 text-right">{row.avg_late_minutes ?? 0} menit</td>
                    <td className="px-4 py-3 text-right">{row.total_overtime_minutes ?? 0} menit</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

function MetricCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  )
}

function KpiCard({ label, value, unit, positive, warn, negative }) {
  let cls = 'text-gray-900'
  if (positive) cls = 'text-green-700'
  if (warn) cls = 'text-yellow-700'
  if (negative) cls = 'text-red-700'
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${cls}`}>{value}{unit ? <span className="text-sm font-normal"> {unit}</span> : ''}</p>
    </div>
  )
}

function fmt(v) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' M'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'Jt'
  if (v >= 1_000) return (v / 1_000).toFixed(1) + 'Rb'
  return v?.toLocaleString('id-ID') ?? 0
}

function rp(v) {
  if (!v && v !== 0) return '-'
  return 'Rp ' + (v / 100).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
