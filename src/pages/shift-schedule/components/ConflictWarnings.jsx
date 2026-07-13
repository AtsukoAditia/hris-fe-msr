import { useState } from 'react';

export default function ConflictWarnings({ conflicts = [], onDismiss }) {
  const [dismissed, setDismissed] = useState(new Set());

  if (!conflicts.length) return null;

  const visible = conflicts.filter((_, i) => !dismissed.has(i));
  if (!visible.length) return null;

  const handleDismiss = (index) => {
    const newDismissed = new Set(dismissed);
    newDismissed.add(index);
    setDismissed(newDismissed);
    if (onDismiss) onDismiss(index);
  };

  const getSeverity = (type) => {
    if (type === 'max_hours' || type === 'overlap') return 'error';
    return 'warning';
  };

  const severityStyles = {
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    error: 'bg-red-50 border-red-300 text-red-800',
  };

  return (
    <div className="space-y-2">
      {conflicts.map((conflict, index) => {
        if (dismissed.has(index)) return null;
        const severity = getSeverity(conflict.type);
        return (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border ${severityStyles[severity]}`}
          >
            <span className="flex-shrink-0 mt-0.5">
              {severity === 'error' ? '🔴' : '⚠️'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{conflict.message}</p>
              <p className="text-xs opacity-75 mt-0.5">
                {conflict.type.replace('_', ' ').toUpperCase()} • {conflict.date}
              </p>
            </div>
            <button
              onClick={() => handleDismiss(index)}
              className="flex-shrink-0 text-current opacity-50 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
