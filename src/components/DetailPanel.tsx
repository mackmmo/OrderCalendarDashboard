import { StoreOrder } from './Types.ts'
import { CalendarData } from '../utils/TransformOrders.ts'
import { fmtLongDate } from './CalendarHelper.ts'
import OrderCard from './OrderCard.tsx'
// ─── Detail Panel ─────────────────────────────────────────────────────────────

export function DetailPanel({
  selectedKey,
  orders,
  onFinishedQuantityChange,
  onFinishedChange,
  onShippedChange,
}: {
  selectedKey: string | null
  orders: CalendarData

  onFinishedQuantityChange: (
    orderId: number,
    quantity: number,
  ) => Promise<void>

  onFinishedChange: (
    order: StoreOrder,
    finished: boolean,
  ) => Promise<void>

  onShippedChange: (
    order: StoreOrder,
    shipped: boolean,
  ) => Promise<void>
}) {
  if (!selectedKey) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full border-l"
        style={{ borderColor: '#E0DDD8', backgroundColor: '#FAF9F6' }}
      >
        <span
          className="text-stone-400 text-sm tracking-wide"
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
  const finishedCount = dayOrders.filter((o) => !!o.finishedAt).length
  const shippedCount = dayOrders.filter((o) => !!o.shippedAt).length

  return (
    <div
      className="flex flex-col h-full border-l"
      style={{ borderColor: '#E0DDD8', backgroundColor: '#FAF9F6' }}
    >
      {/* Panel header */}
      <div
        className="px-5 pt-5 pb-4 border-b flex-shrink-0"
        style={{ borderColor: '#E0DDD8' }}
      >
        <p
          className="text-xs text-stone-400 uppercase tracking-widest mb-1"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          Order Detail
        </p>
        <h2
          className="text-2xl font-semibold text-stone-900 leading-tight"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.02em' }}
        >
          {fmtLongDate(date)}
        </h2>

        {/* Summary row */}
        {dayOrders.length > 0 && (
          <div
            className="mt-3 pt-3 border-t flex gap-5"
            style={{ borderColor: '#E0DDD8' }}
          >
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Pallets</p>
              <p
                className="text-lg font-medium text-stone-900 tabular-nums leading-none"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {donePallets}
                <span className="text-stone-400 text-base">/{totalPallets}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Locations</p>
              <p
                className="text-lg font-medium text-stone-900 tabular-nums leading-none"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {dayOrders.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Finished</p>
              <p
                className="text-lg font-medium text-stone-900 tabular-nums leading-none"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {finishedCount}
                <span className="text-stone-400 text-base">/{dayOrders.length}</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Shipped</p>
              <p
                className="text-lg font-medium text-stone-900 tabular-nums leading-none"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {shippedCount}
                <span className="text-stone-400 text-base">/{dayOrders.length}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order cards */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4">
        {dayOrders.length === 0 ? (
          <p
            className="text-stone-400 text-sm"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            No orders scheduled.
          </p>
        ) : (
          dayOrders.map((ord) => (
            <OrderCard
              key={ord.id}
              order={ord}
              onFinishedQuantityChange={
                onFinishedQuantityChange
              }
              onFinishedChange={onFinishedChange}
              onShippedChange={onShippedChange}
            />  
          ))
        )}
      </div>
    </div>
  )
}
