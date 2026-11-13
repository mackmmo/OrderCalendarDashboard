import { fmtStamp } from './CalendarHelper.ts'
import type { SignOff } from './Types.ts'

// ─── Status Toggle ────────────────────────────────────────────────────────────

export function StatusToggle({
  label,
  signOff,
  onToggle,
  disabled = false,
}: {
  label: string
  signOff: SignOff | null
  onToggle: () => void
  disabled?: boolean
}) {
  const checked = !!signOff

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={checked}
      className="group flex min-h-11 w-full items-center gap-3 py-1.5 text-left transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50"
    >
      <span
        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors ${
          checked
            ? 'border-stone-900 bg-stone-900'
            : 'border-stone-300 group-hover:border-stone-500'
        }`}
      >
        {checked && (
          <span className="text-[10px] font-bold leading-none text-white">✓</span>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <span className="text-sm text-stone-700">{label}</span>

        {signOff && (
          <span
            className="text-xs text-stone-400"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {signOff.by ?? 'unknown'} · {fmtStamp(signOff.at)}
          </span>
        )}
      </span>
    </button>
  )
}
