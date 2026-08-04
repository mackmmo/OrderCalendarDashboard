 import { StoreOrder } from './Types.ts'

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
if (!date) {
  return (
    <div
      className="border-r border-b"
      style={{
        borderColor: '#E0DDD8',
        backgroundColor: '#F4F2EE',
        minHeight: 120,
      }}
    />
  )
}
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
  (sum, order) =>
    sum + getSelectedQuantity(order).ordered,
  0,
)

const allFinished =
  visibleOrders.length > 0 &&
  visibleOrders.every((order) => !!order.finishedAt)

const allShipped =
  visibleOrders.length > 0 &&
  visibleOrders.every((order) => !!order.shippedAt)

  return (
    <button
      onClick={onClick}
      className={`h-full w-full border-r border-b p-2.5 text-left transition-colors ${
      selected
        ? 'bg-stone-900 text-white'
        : outsideMonth
          ? 'bg-stone-100 text-stone-400 hover:bg-stone-200'
          : 'bg-white text-stone-900 hover:bg-stone-50'
        }`}
      style={{
        borderColor: '#E0DDD8',
        minHeight: 160,
        display: 'block',
    }}
    >
      {/* Date number */}
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-lg font-semibold leading-none ${
            today && !selected ? 'underline underline-offset-2' : ''
          } ${selected ? 'text-white' : 'text-stone-900'}`}
          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}
        >
          {date.getDate()}
        </span>
        {orders.length > 0 && (
          <span
            className={`text-[10px] tabular-nums leading-none ${
              selected ? 'text-stone-400' : 'text-stone-300'
            }`}
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {allShipped ? '↑ shipped' : allFinished ? '✓ done' : `${totalPallets}p`}
          </span>
        )}
      </div>

      {/* Order lines */}
      <div className="space-y-1">
        {visibleOrders.map((ord) => {
  const quantity = getSelectedQuantity(ord)

  return (
    <div
      key={ord.id}
      className="flex items-baseline gap-2"
    >
      <span
        className={`flex-1 truncate text-[20px] font-medium ${
          selected
            ? 'text-stone-300'
            : 'text-stone-600'
        }`}
        style={{
          fontFamily:
            'Barlow Condensed, sans-serif',
        }}
      >
        {ord.store}
      </span>

      <span
        className={`flex-shrink-0 text-[20px] font-bold tabular-nums ${
          selected
            ? 'text-white'
            : 'text-stone-700'
        }`}
        style={{
          fontFamily: 'DM Mono, monospace',
        }}
      >
        {quantity.done}/{quantity.ordered}
      </span>
    </div>
  )
})}
      </div>
    </button>
  )
}