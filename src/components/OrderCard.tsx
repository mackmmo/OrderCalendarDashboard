import { StoreOrder } from './Types.ts'
import { Stepper }from './Stepper.tsx'
import { StatusToggle } from '../components/StatusToggle'    

// ─── Order Card ───────────────────────────────────────────────────────────────

export default function OrderCard({
  order,
  onFinishedQuantityChange,
  onFinishedChange,
  onShippedChange,
}: {
  order: StoreOrder

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

  async function setBsoDone(quantity: number) {
  if (order.bso.orderId === null) {
    return
  }

  await onFinishedQuantityChange(
    order.bso.orderId,
    quantity,
  )
}

async function setFourPackDone(quantity: number) {
  if (order.fourPack.orderId === null) {
    return
  }

  await onFinishedQuantityChange(
    order.fourPack.orderId,
    quantity,
  )
}

  async function toggleFinished() {
  const nextFinished = !order.finishedAt

  await onFinishedChange(
    order,
    nextFinished,
  )
}

async function toggleShipped() {
  const nextShipped = !order.shippedAt

  await onShippedChange(
    order,
    nextShipped,
  )
}

  const totalOrdered = order.bso.ordered + order.fourPack.ordered
  const totalDone = order.bso.done + order.fourPack.done
  const allDone = totalDone === totalOrdered

  return (
    <div
      className={`border bg-white mb-3 transition-opacity ${
        order.shippedAt ? 'opacity-60' : ''
      }`}
      style={{ borderColor: '#E0DDD8' }}
    >
      {/* Store header */}
      <div
        className="px-4 py-2.5 border-b flex items-baseline justify-between"
        style={{ borderColor: '#E0DDD8' }}
      >
        <span
          className="font-semibold tracking-wide text-stone-900 uppercase text-base"
          style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.08em' }}
        >
          {order.store}
        </span>
        <span
          className="text-stone-400 text-xs tabular-nums"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {totalDone}/{totalOrdered} pal
          {allDone && !order.finishedAt && (
            <span className="ml-2 text-stone-500">· all done</span>
          )}
        </span>
      </div>


      {/* Product rows */}
<div
  className="divide-y"
  style={{ borderColor: '#F0EDE8' }}
>
  {order.bso.ordered > 0 && (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-8 text-xs font-medium uppercase tracking-widest text-stone-500"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            BSO
          </span>

          <span className="text-xs text-stone-400">
            {order.bso.ordered}{' '}
            {order.bso.ordered === 1 ? 'pallet' : 'pallets'} ordered
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400">
            Done
          </span>

          <Stepper
            value={order.bso.done}
            max={order.bso.ordered}
            onChange={(value) => {
              void setBsoDone(value)
            }}
          />
        </div>
      </div>
    </div>
  )}

  {order.fourPack.ordered > 0 && (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-12 text-xs font-medium uppercase tracking-widest text-stone-500"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            4PAK
          </span>

          <span className="text-xs text-stone-400">
            {order.fourPack.ordered}{' '}
            {order.fourPack.ordered === 1 ? 'pallet' : 'pallets'} ordered
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-400">
            Done
          </span>

          <Stepper
            value={order.fourPack.done}
            max={order.fourPack.ordered}
            onChange={(value) => {
              void setFourPackDone(value)
            }}
          />
        </div>
      </div>
    </div>
  )}
</div>

      {/* Status toggles */}
      <div
        className="px-4 py-3 border-t space-y-0.5"
        style={{ borderColor: '#E0DDD8', backgroundColor: '#FAFAF8' }}
      >
        <StatusToggle
          label="Order Finished"
          timestamp={order.finishedAt}
          onToggle={toggleFinished}
        />
        <StatusToggle
          label="Order Shipped"
          timestamp={order.shippedAt}
          onToggle={toggleShipped}
        />
      </div>
    </div>
  )
}