import { APPROVAL_STEPS } from './payroll.helpers'

const stepIndex = (status) => {
  const idx = APPROVAL_STEPS.findIndex((s) => s.key === status)
  return idx >= 0 ? idx : 0
}

const ApprovalTimeline = ({ payroll }) => {
  const currentIdx = stepIndex(payroll?.status)

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-700">Alur Persetujuan</h3>
      <div className="flex items-center justify-between">
        {APPROVAL_STEPS.map((step, idx) => {
          const isComplete = idx < currentIdx
          const isCurrent = idx === currentIdx
          const isPending = idx > currentIdx
          void isPending // used for future styling

          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isComplete
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isComplete ? '✓' : step.icon}
                </div>
                <span
                  className={`mt-1 text-xs font-medium ${
                    isComplete ? 'text-green-600' : isCurrent ? 'text-indigo-700' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {idx < APPROVAL_STEPS.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 ${isComplete ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
      {payroll?.status === 'cancelled' && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          Payroll ini dibatalkan dan tidak dapat diproses lebih lanjut.
        </div>
      )}
    </div>
  )
}

export default ApprovalTimeline
