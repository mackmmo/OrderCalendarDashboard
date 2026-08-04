import { fmtTime } from './CalendarHelper.ts'

// ─── Status Toggle ────────────────────────────────────────────────────────────

export function StatusToggle({
  label,
  timestamp,
  onToggle,
}: {
  label: string
  timestamp: Date | null
  onToggle: () => void
}) {
  const checked = !!timestamp
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-2.5 text-left w-full group py-1 hover:opacity-80 transition-opacity"
    >
      <span
        className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-stone-900 border-stone-900'
            : 'border-stone-300 group-hover:border-stone-500'
        }`}
      >
        {checked && (
          <span className="text-white text-[9px] leading-none font-bold">✓</span>
        )}
      </span>
      <span className="text-sm text-stone-700">
        {label}
        {timestamp && (
          <span
            className="ml-2 text-stone-400 text-xs"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {fmtTime(timestamp)}
          </span>
        )}
      </span>
    </button>
  )
}