import { AlertTriangle, CheckCircle2, Clock3, Files, InfinityIcon } from 'lucide-react'

const DocumentSummary = ({ summary }) => {
  const cards = [
    { key: 'total', label: 'Total Dokumen', icon: Files, className: 'text-indigo-600 bg-indigo-50' },
    { key: 'valid', label: 'Berlaku', icon: CheckCircle2, className: 'text-green-600 bg-green-50' },
    { key: 'expiring', label: `Segera Kedaluwarsa (${summary.warning_days || 30} hari)`, icon: Clock3, className: 'text-amber-600 bg-amber-50' },
    { key: 'expired', label: 'Kedaluwarsa', icon: AlertTriangle, className: 'text-red-600 bg-red-50' },
    { key: 'without_expiry', label: 'Tanpa Kedaluwarsa', icon: InfinityIcon, className: 'text-gray-600 bg-gray-100' },
  ]

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map(({ key, label, icon: Icon, className }) => (
        <article key={key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className={`inline-flex rounded-lg p-2 ${className}`}><Icon className="h-5 w-5" /></div>
          <p className="mt-3 text-2xl font-bold text-gray-900">{summary[key] || 0}</p>
          <p className="mt-1 text-xs font-medium text-gray-500 sm:text-sm">{label}</p>
        </article>
      ))}
    </section>
  )
}

export default DocumentSummary
