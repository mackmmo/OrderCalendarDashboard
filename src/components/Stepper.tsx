export function Stepper({
  value,
  max,
  onChange,
}: {
  value: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value === 0}
        className="w-6 h-6 border border-stone-300 text-stone-500 hover:bg-stone-50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-base leading-none transition-colors"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        −
      </button>
      <span
        className="text-sm tabular-nums text-stone-900 w-12 text-center"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {value}<span className="text-stone-400">/{max}</span>
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value === max}
        className="w-6 h-6 border border-stone-300 text-stone-500 hover:bg-stone-50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-base leading-none transition-colors"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        +
      </button>
    </div>
  )
}