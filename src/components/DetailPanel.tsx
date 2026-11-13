import type { CalendarData } from '../utils/TransformOrders.ts'
import { fmtLongDate } from './CalendarHelper.ts'
import OrderCard, { type OrderCardHandlers } from './OrderCard.tsx'

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  of,
}: {
  label: string
  value: number
  of?: number
}) {
  return (
    <div>
      <p className="mb-0.5 text-xs text-stone-400">{label}</p>
      <p
        className="text-lg font-medium leading-none text-stone-900 tabular-nums"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {value}
        {of !== undefined && (
          <span className="text-base text-stone-400">/{of}</span>
        )}
      </p>
    </div>
  )
}

export function DetailPanel({
  selectedKey,
  orders,
  onClose,
  ...handlers
}: {
  selectedKey: string | null
  orders: CalendarData
  // Shown on phones, where the panel covers the calendar
  onClose?: () => void
} & OrderCardHandlers) {
  if (!selectedKey) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center border-l"
        style={{ borderColor: '#E0DDD8', backgroundColor: '#FAF9F6' }}
      >
        <span
          className="text-sm tracking-wide text-stone-400"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          select a day
        </span>
      </div>
    )
  }

  const [yr, mo, dy] = selectedKey.split('-').map(Number)
  const date = new Date(yr, mo - 1, dy)
  const dayOrders = orders[selectedKey] ?? []

  const totalPallets = dayOrders.reduce((s, o) => s + o.bso.ordered + o.fourPack.ordered, 0)
  const donePallets = dayOrders.reduce((s, o) => s + o.bso.done + o.fourPack.done, 0)
  const startedCount = dayOrders.filter((o) => !!o.started).length
  const finishedCount = dayOrders.filter((o) => !!o.finished).length
  const shippedCount = dayOrders.filter((o) => !!o.shipped).length

  return (
    <div
      className="flex h-full flex-col md:border-l"
      style={{ borderColor: '#E0DDD8', backgroundColor: '#FAF9F6' }}
    >
      {/* Panel header */}
      <div
        className="flex-shrink-0 border-b px-4 pb-4 pt-4 md:px-5 md:pt-5"
        style={{ borderColor: '#E0DDD8' }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="-ml-1 mb-2 flex h-10 items-center gap-1 px-1 text-sm text-stone-500 md:hidden"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            ‹ calendar
          </button>
        )}

        <p
          className="mb-1 text-xs uppercase tracking-widest text-stone-400"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Order Detail
        </p>
        <h2
          className="text-2xl font-semibold leading-tight text-stone-900"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.02em' }}
        >
          {fmtLongDate(date)}
        </h2>

        {/* Summary row */}
        {dayOrders.length > 0 && (
          <div
            className="mt-3 flex flex-wrap gap-x-5 gap-y-3 border-t pt-3"
            style={{ borderColor: '#E0DDD8' }}
          >
            <Stat label="Pallets" value={donePallets} of={totalPallets} />
            <Stat label="Locations" value={dayOrders.length} />
            <Stat label="Started" value={startedCount} of={dayOrders.length} />
            <Stat label="Finished" value={finishedCount} of={dayOrders.length} />
            <Stat label="Shipped" value={shippedCount} of={dayOrders.length} />
          </div>
        )}
      </div>

      {/* Order cards */}
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4 md:px-5">
        {dayOrders.length === 0 ? (
          <p
            className="text-sm text-stone-400"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            No orders scheduled.
          </p>
        ) : (
          dayOrders.map((ord) => (
            <OrderCard key={ord.id} order={ord} {...handlers} />
          ))
        )}
      </div>
    </div>
  )
}
