import type { OrderStatus } from './Types.ts'

// ─── Status Badge ─────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<OrderStatus, string> = {
  queue: 'In Queue',
  in_progress: 'In Progress',
  finished: 'Finished',
  done: 'Done',
}

// Dot / badge colours, readable on white and on the dark selected cell
export const STATUS_COLORS: Record<OrderStatus, string> = {
  queue: '#A8A29E',
  in_progress: '#D97706',
  finished: '#15803D',
  done: '#1D4ED8',
}

export function StatusDot({ status }: { status: OrderStatus }) {
  return (
    <span
      aria-label={STATUS_LABELS[status]}
      title={STATUS_LABELS[status]}
      className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
      style={{ backgroundColor: STATUS_COLORS[status] }}
    />
  )
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider"
      style={{
        fontFamily: 'DM Mono, monospace',
        color: STATUS_COLORS[status],
        borderColor: STATUS_COLORS[status],
      }}
    >
      <StatusDot status={status} />
      {STATUS_LABELS[status]}
    </span>
  )
}
