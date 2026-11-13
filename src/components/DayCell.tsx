import type { StoreOrder } from './Types.ts'
import { StatusDot } from './StatusBadge.tsx'

// ─── Day Cell ─────────────────────────────────────────────────────────────────

export default function DayCell({
  date,
  orders,
  selected,
  today,
  analyticsSku,
  outsideMonth,
  onClick,
}: {
  date: Date
  orders: StoreOrder[]
  selected: boolean
  today: boolean
  analyticsSku: 'BSO' | '4PAK'
  outsideMonth: boolean
  onClick: () => void
}) {
  const visibleOrders = orders.filter((order) =>
    analyticsSku === 'BSO'
      ? order.bso.ordered > 0
      : order.fourPack.ordered > 0,
  )

  function getSelectedQuantity(order: StoreOrder) {
    return analyticsSku === 'BSO'
      ? order.bso
      : order.fourPack
  }

  const totalPallets = visibleOrders.reduce(
    (sum, order) => sum + getSelectedQuantity(order).ordered,
    0,
  )

  const every = (test: (order: StoreOrder) => boolean) =>
    visibleOrders.length > 0 && visibleOrders.every(test)

  const summary = every((o) => o.status === 'done')
    ? '✓ done'
    : every((o) => !!o.shipped)
      ? '↑ shipped'
      : every((o) => !!o.finished)
        ? '✓ finished'
        : `${totalPallets}p`

  return (
    <button
      type="button"
      onClick={onClick}
      className={`block h-full w-full min-w-0 border-b border-r p-1.5 text-left transition-colors md:p-2.5 ${
        selected
          ? 'bg-stone-900 text-white'
          : outsideMonth
            ? 'bg-stone-100 text-stone-400 hover:bg-stone-200'
            : 'bg-white text-stone-900 hover:bg-stone-50'
      }`}
      style={{ borderColor: '#E0DDD8' }}
    >
      <div className="min-h-16 md:min-h-36">
        {/* Date number */}
        <div className="mb-1.5 flex flex-wrap items-start justify-between gap-1 md:mb-2">
          <span
            className={`text-lg font-semibold leading-none ${
              today && !selected ? 'underline underline-offset-2' : ''
            } ${selected ? 'text-white' : 'text-stone-900'}`}
            style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
          >
            {date.getDate()}
          </span>

          {visibleOrders.length > 0 && (
            <span
              className="text-[10px] leading-none tabular-nums text-stone-400"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              {summary}
            </span>
          )}
        </div>

        {/* Phones and tablets: one status dot per location */}
        {visibleOrders.length > 0 && (
          <div className="flex flex-wrap gap-1 lg:hidden">
            {visibleOrders.map((ord) => (
              <StatusDot key={ord.id} status={ord.status} />
            ))}
          </div>
        )}

        {/* Large screens: one line per location */}
        <div className="hidden space-y-1 lg:block">
          {visibleOrders.map((ord) => {
            const quantity = getSelectedQuantity(ord)

            return (
              <div key={ord.id} className="flex items-center gap-2">
                <StatusDot status={ord.status} />

                <span
                  className={`min-w-0 flex-1 truncate text-lg font-medium xl:text-[20px] ${
                    selected ? 'text-stone-300' : 'text-stone-600'
                  }`}
                  style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
                >
                  {ord.store}
                </span>

                <span
                  className={`flex-shrink-0 text-lg font-bold tabular-nums xl:text-[20px] ${
                    selected ? 'text-white' : 'text-stone-700'
                  }`}
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {quantity.done}/{quantity.ordered}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </button>
  )
}
