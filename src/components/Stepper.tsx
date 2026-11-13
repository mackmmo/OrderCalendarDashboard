// ─── Stepper ──────────────────────────────────────────────────────────────────

const buttonClass =
  'flex h-10 w-10 items-center justify-center border border-stone-300 text-lg leading-none text-stone-500 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-25 md:h-7 md:w-7 md:text-base'

export function Stepper({
  value,
  max,
  onChange,
  disabled = false,
}: {
  value: number
  max: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="One less pallet done"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={disabled || value === 0}
        className={buttonClass}
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        −
      </button>
      <span
        className="w-12 text-center text-sm tabular-nums text-stone-900"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {value}
        <span className="text-stone-400">/{max}</span>
      </span>
      <button
        type="button"
        aria-label="One more pallet done"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value === max}
        className={buttonClass}
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        +
      </button>
    </div>
  )
}
