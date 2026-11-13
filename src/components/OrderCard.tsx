import { useState } from 'react'
import type { Qty, StatusField, StoreOrder } from './Types.ts'
import { Stepper } from './Stepper.tsx'
import { StatusToggle } from './StatusToggle.tsx'
import { StatusBadge } from './StatusBadge.tsx'

// ─── Order Card ───────────────────────────────────────────────────────────────

export interface OrderCardHandlers {
  onDoneChange: (qty: Qty, total: number) => Promise<void>
  onStatusChange: (
    order: StoreOrder,
    field: StatusField,
    value: boolean,
  ) => Promise<void>
}

function ProductRow({
  label,
  qty,
  disabled,
  onChange,
}: {
  label: string
  qty: Qty
  disabled: boolean
  onChange: (total: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="w-12 flex-shrink-0 text-xs font-medium uppercase tracking-widest text-stone-500"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {label}
        </span>

        <span className="whitespace-nowrap text-xs text-stone-400">
          {qty.ordered} {qty.ordered === 1 ? 'pallet' : 'pallets'}
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <Stepper
          value={qty.done}
          max={qty.ordered}
          disabled={disabled}
          onChange={onChange}
        />
      </div>
    </div>
  )
}

export default function OrderCard({
  order,
  onDoneChange,
  onStatusChange,
}: { order: StoreOrder } & OrderCardHandlers) {
  const [saving, setSaving] = useState(false)

  async function run(action: () => Promise<void>) {
    setSaving(true)

    try {
      await action()
    } finally {
      setSaving(false)
    }
  }

  function toggle(field: StatusField, current: boolean) {
    void run(() => onStatusChange(order, field, !current))
  }

  const totalOrdered = order.bso.ordered + order.fourPack.ordered
  const totalDone = order.bso.done + order.fourPack.done

  return (
    <div
      className={`mb-3 border bg-white transition-opacity ${
        order.status === 'done' ? 'opacity-70' : ''
      }`}
      style={{ borderColor: '#E0DDD8' }}
    >
      {/* Store header */}
      <div
        className="flex items-start justify-between gap-3 border-b px-4 py-2.5"
        style={{ borderColor: '#E0DDD8' }}
      >
        <div className="min-w-0">
          <p
            className="truncate text-base font-semibold uppercase tracking-wide text-stone-900"
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '0.08em',
            }}
          >
            {order.store}
          </p>

          <p
            className="text-[11px] text-stone-400 tabular-nums"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            SO {order.salesOrderNumbers.join(', ')} · {totalDone}/{totalOrdered} pal
          </p>
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* Product rows */}
      <div className="divide-y divide-stone-100">
        {order.bso.ordered > 0 && (
          <ProductRow
            label="BSO"
            qty={order.bso}
            disabled={saving}
            onChange={(total) => void run(() => onDoneChange(order.bso, total))}
          />
        )}

        {order.fourPack.ordered > 0 && (
          <ProductRow
            label="4PAK"
            qty={order.fourPack}
            disabled={saving}
            onChange={(total) => void run(() => onDoneChange(order.fourPack, total))}
          />
        )}
      </div>

      {/* Status sign-offs */}
      <div
        className="border-t px-4 py-2"
        style={{ borderColor: '#E0DDD8', backgroundColor: '#FAFAF8' }}
      >
        <StatusToggle
          label="In Progress"
          signOff={order.started}
          disabled={saving}
          onToggle={() => toggle('in_progress', !!order.started)}
        />
        <StatusToggle
          label="Order Finished"
          signOff={order.finished}
          disabled={saving}
          onToggle={() => toggle('finished', !!order.finished)}
        />
        <StatusToggle
          label="Order Shipped"
          signOff={order.shipped}
          disabled={saving}
          onToggle={() => toggle('shipped', !!order.shipped)}
        />

        {order.qbDone && (
          <p
            className="pt-1.5 text-xs text-stone-500"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Closed &amp; invoiced in QuickBooks
          </p>
        )}
      </div>
    </div>
  )
}
