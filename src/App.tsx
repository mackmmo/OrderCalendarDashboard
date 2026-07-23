import { useEffect, useState } from 'react'
import {getSalesOrders,updateSalesOrder,} from './api/orders'
import {transformOrders, type CalendarData,} from './utils/TransformOrders'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Qty {
  ordered: number
  done: number
  orderId: number | null
}

interface StoreOrder {
  id: string
  store: string
  bso: Qty
  fourPack: Qty
  finishedAt: Date | null
  shippedAt: Date | null
}

export interface ProductTotals {
  ordered: number
  finished: number
  remaining: number
}

export interface WeeklyTotals {
  bso: ProductTotals
  fourPack: ProductTotals
  totalOrdered: number
  totalFinished: number
  totalRemaining: number
}
// ─── Calendar Helpers ─────────────────────────────────────────────────────────

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeeks(
  year: number,
  month: number,
): Date[][] {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Move backward to the Monday of the week
  // containing the first day of the month.
  const startDate = new Date(firstDayOfMonth)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  const daysBackToMonday =
    firstDayOfWeek === 0
      ? 6
      : firstDayOfWeek - 1

  startDate.setDate(
    firstDayOfMonth.getDate() - daysBackToMonday,
  )

  // Move forward to the Friday of the week
  // containing the last day of the month.
  const endDate = new Date(lastDayOfMonth)
  const lastDayOfWeek = lastDayOfMonth.getDay()

  const daysForwardToFriday =
    lastDayOfWeek === 0
      ? 5
      : lastDayOfWeek === 6
        ? 6
        : 5 - lastDayOfWeek

  endDate.setDate(
    lastDayOfMonth.getDate() + daysForwardToFriday,
  )

  const weeks: Date[][] = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const week: Date[] = []

    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    weeks.push(week)

    // Skip Saturday and Sunday.
    currentDate.setDate(currentDate.getDate() + 2)
  }

  return weeks
}

const DAY_LABELS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Totals',
]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function fmtTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function fmtLongDate(date: Date) {
  const dayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][date.getDay()]

  return `${dayName}, ${
    MONTH_NAMES[date.getMonth()]
  } ${date.getDate()}`
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
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
// ─── Analytics types and functions ───────────────────────────────────────────

export function calculateWeeklyTotals(
  orders: StoreOrder[],
): WeeklyTotals {
  const totals: WeeklyTotals = {
    bso: {
      ordered: 0,
      finished: 0,
      remaining: 0,
    },
    
    fourPack: {
      ordered: 0,
      finished: 0,
      remaining: 0,
    },

    totalOrdered: 0,
    totalFinished: 0,
    totalRemaining: 0,
  }

  for (const order of orders) {
    totals.bso.ordered += order.bso.ordered
    totals.bso.finished += order.bso.done

    totals.fourPack.ordered += order.fourPack.ordered
    totals.fourPack.finished += order.fourPack.done
  }

  totals.bso.remaining =
    totals.bso.ordered - totals.bso.finished

  totals.fourPack.remaining =
    totals.fourPack.ordered - totals.fourPack.finished

  totals.totalOrdered =
    totals.bso.ordered + totals.fourPack.ordered

  totals.totalFinished =
    totals.bso.finished + totals.fourPack.finished

  totals.totalRemaining =
    totals.bso.remaining + totals.fourPack.remaining

  return totals
}
// ─── Status Toggle ────────────────────────────────────────────────────────────

function StatusToggle({
  label,
  timestamp,
  onToggle,
}: {
  label: string
  timestamp: Date | null
  onToggle: () => void
}) {
  const checked = !!timestamp
  return (
    <button
      onClick={onToggle}
      className="flex items-start gap-2.5 text-left w-full group py-1 hover:opacity-80 transition-opacity"
    >
      <span
        className={`mt-0.5 w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-stone-900 border-stone-900'
            : 'border-stone-300 group-hover:border-stone-500'
        }`}
      >
        {checked && (
          <span className="text-white text-[9px] leading-none font-bold">✓</span>
        )}
      </span>
      <span className="text-sm text-stone-700">
        {label}
        {timestamp && (
          <span
            className="ml-2 text-stone-400 text-xs"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {fmtTime(timestamp)}
          </span>
        )}
      </span>
    </button>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({
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

// ─── Day Cell ─────────────────────────────────────────────────────────────────

function DayCell({
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

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
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
// ─── Weekly Totals Column ──────────────────────────────────────────────────────────────────────

interface WeeklyTotalsColumnProps {
  totals: WeeklyTotals
  sku: 'BSO' | '4PAK'
}

function WeeklyTotalsColumn({
  totals,
  sku,
}: WeeklyTotalsColumnProps) {
  const selectedTotals =
    sku === 'BSO'
      ? totals.bso
      : totals.fourPack

  return (
    <div className="h-full border-l-2 border-stone-300 bg-stone-100 p-4">
      <p className="text-sm font-bold uppercase tracking-wider text-stone-500">
        {sku} Week
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm text-stone-500">
            Ordered
          </p>

          <p className="text-3xl font-black tabular-nums text-stone-900">
            {selectedTotals.ordered}
          </p>
        </div>

        <div>
          <p className="text-sm text-stone-500">
            Finished
          </p>

          <p className="text-3xl font-black tabular-nums text-stone-900">
            {selectedTotals.finished}
          </p>
        </div>

        <div>
          <p className="text-sm text-stone-500">
            Remaining
          </p>

          <p className="text-3xl font-black tabular-nums text-stone-900">
            {selectedTotals.remaining}
          </p>
        </div>
      </div>
    </div>
  )
}

function AnalyticsTotalsBar({
  sku,
  totals,
}: {
  sku: 'BSO' | '4PAK'
  totals: ProductTotals
}) {
  return (
    <div className="grid grid-cols-3 gap-4 border-b border-stone-300 bg-white px-6 py-4">
      <div className="border-l-4 border-stone-800 bg-stone-100 px-5 py-3">
        <p className="text-sm font-bold uppercase tracking-wider text-stone-500">
          {sku} Ordered
        </p>

        <p className="mt-1 text-4xl font-black tabular-nums text-stone-900">
          {totals.ordered}
        </p>
      </div>

      <div className="border-l-4 border-stone-800 bg-stone-100 px-5 py-3">
        <p className="text-sm font-bold uppercase tracking-wider text-stone-500">
          {sku} Finished
        </p>

        <p className="mt-1 text-4xl font-black tabular-nums text-stone-900">
          {totals.finished}
        </p>
      </div>

      <div className="border-l-4 border-stone-800 bg-stone-100 px-5 py-3">
        <p className="text-sm font-bold uppercase tracking-wider text-stone-500">
          {sku} Remaining
        </p>

        <p className="mt-1 text-4xl font-black tabular-nums text-stone-900">
          {totals.remaining}
        </p>
      </div>
    </div>
  )
}
// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [orders, setOrders] = useState<CalendarData>({})

  const [selectedKey, setSelectedKey] =
    useState<string | null>(null)

  const [month, setMonth] = useState({
    year: 2026,
    month: 6,
  })

  const [analyticsSku, setAnalyticsSku] =
    useState<'BSO' | '4PAK'>('BSO')

  async function reloadOrders() {
    try {
      const apiOrders = await getSalesOrders()
      const calendarData = transformOrders(apiOrders)

      setOrders(calendarData)

      const firstDateKey =
        Object.keys(calendarData).sort()[0]

      if (firstDateKey && !selectedKey) {
        setSelectedKey(firstDateKey)

        const [year, monthNumber] = firstDateKey
          .split('-')
          .map(Number)

        setMonth({
          year,
          month: monthNumber - 1,
        })
      }
    } catch (error) {
      console.error(
        'Failed to load orders:',
        error,
      )
    }
  }

  useEffect(() => {
    void reloadOrders()
  }, [])

  async function setStoreFinished(
    order: StoreOrder,
    finished: boolean,
  ) {
    const orderIds = [
      order.bso.orderId,
      order.fourPack.orderId,
    ].filter(
      (id): id is number => id !== null,
    )

    try {
      await Promise.all(
        orderIds.map((orderId) =>
          updateSalesOrder(orderId, {
            finished,
          }),
        ),
      )

      await reloadOrders()
    } catch (error) {
      console.error(
        'Failed to update finished status:',
        error,
      )
    }
  }

  async function setFinishedQuantity(
    orderId: number,
    quantity: number,
  ) {
    try {
      await updateSalesOrder(orderId, {
        qty_finished: quantity,
      })

      await reloadOrders()
    } catch (error) {
      console.error(
        'Failed to update finished quantity:',
        error,
      )
    }
  }

  async function setStoreShipped(
    order: StoreOrder,
    shipped: boolean,
  ) {
    const orderIds = [
      order.bso.orderId,
      order.fourPack.orderId,
    ].filter(
      (id): id is number => id !== null,
    )

    try {
      await Promise.all(
        orderIds.map((orderId) =>
          updateSalesOrder(orderId, {
            shipped,
          }),
        ),
      )

      await reloadOrders()
    } catch (error) {
      console.error(
        'Failed to update shipped status:',
        error,
      )
    }
  }

  function prevMonth() {
    setMonth((currentMonth) => {
      const date = new Date(
        currentMonth.year,
        currentMonth.month - 1,
        1,
      )

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
      }
    })
  }

  function nextMonth() {
    setMonth((currentMonth) => {
      const date = new Date(
        currentMonth.year,
        currentMonth.month + 1,
        1,
      )

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
      }
    })
  }

  const today = toKey(new Date())

  const weeks = getWeeks(
    month.year,
    month.month,
  )
const visibleMonthOrders = weeks.flatMap((week) =>
  week.flatMap((date) => {
    if (!date) {
      return []
    }

    const dateKey = toKey(date)

    return orders[dateKey] ?? []
  }),
)

const visibleMonthTotals =
  calculateWeeklyTotals(visibleMonthOrders)

const selectedMonthTotals =
  analyticsSku === 'BSO'
    ? visibleMonthTotals.bso
    : visibleMonthTotals.fourPack

  return (
    <div
      className="flex h-full flex-col"
      style={{
        backgroundColor: '#F4F2EE',
      }}
    >
      {/* App header */}
      <header
        className="flex flex-shrink-0 items-center justify-between border-b px-6"
        style={{
          borderColor: '#E0DDD8',
          backgroundColor: '#FFFFFF',
          height: 52,
        }}
      >
        <div className="flex items-baseline gap-3">
          <h1
            className="text-xl font-semibold uppercase tracking-wide text-stone-900"
            style={{
              fontFamily:
                'Barlow Condensed, sans-serif',
              letterSpacing: '0.1em',
            }}
          >
            Production Orders
          </h1>

          <span className="text-sm text-stone-300">
            ·
          </span>

          <span
            className="text-sm text-stone-500"
            style={{
              fontFamily: 'DM Mono, monospace',
            }}
          >
            {MONTH_NAMES[month.month]}{' '}
            {month.year}
          </span>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center border border-stone-200 text-sm text-stone-500 transition-colors hover:bg-stone-50"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => {
              const now = new Date()

              setMonth({
                year: now.getFullYear(),
                month: now.getMonth(),
              })
            }}
            className="h-8 border border-stone-200 px-3 text-xs text-stone-500 transition-colors hover:bg-stone-50"
            style={{
              fontFamily: 'DM Mono, monospace',
            }}
          >
            today
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center border border-stone-200 text-sm text-stone-500 transition-colors hover:bg-stone-50"
          >
            ›
          </button>
        </div>
      </header>

      {/* Analytics SKU toggle */}
      <div className="flex items-center gap-2 border-b border-stone-300 bg-white px-6 py-3">
        <span className="mr-2 text-sm font-bold uppercase tracking-wide text-stone-500">
          Products
        </span>

        <button
          type="button"
          onClick={() =>
            setAnalyticsSku('BSO')
          }
          className={`border px-4 py-2 text-sm font-bold transition-colors ${
            analyticsSku === 'BSO'
              ? 'border-stone-900 bg-stone-900 text-white'
              : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          BSO
        </button>

        <button
          type="button"
          onClick={() =>
            setAnalyticsSku('4PAK')
          }
          className={`border px-4 py-2 text-sm font-bold transition-colors ${
            analyticsSku === '4PAK'
              ? 'border-stone-900 bg-stone-900 text-white'
              : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          4PAK
        </button>
      </div>
      <AnalyticsTotalsBar
        sku={analyticsSku}
        totals={selectedMonthTotals}
      />
      {/* Dashboard body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Day headers */}
<div
  className="grid flex-shrink-0 border-b"
  style={{
    gridTemplateColumns:
      'repeat(5, minmax(0, 1fr)) 180px',
    borderColor: '#E0DDD8',
  }}
>
  {DAY_LABELS.map((label) => (
    <div
      key={label}
      className="border-r py-2 text-center"
      style={{
        borderColor: '#E0DDD8',
      }}
    >
      <span
        className="text-xs font-medium uppercase tracking-widest text-stone-400"
        style={{
          fontFamily: 'DM Mono, monospace',
        }}
      >
        {label}
      </span>
    </div>
  ))}
</div>

          {/* Calendar weeks */}
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {weeks.map((week, weekIndex) => {
              const weeklyOrders = week.flatMap((date) => {
                if (!date) {
                  return []
                }

                return orders[toKey(date)] ?? []
              })

              const weeklyTotals =
                calculateWeeklyTotals(weeklyOrders)

              return (
                <div
                  key={weekIndex}
                  className="grid items-stretch border-b"
                  style={{
                    gridTemplateColumns:
                      'repeat(5, minmax(0, 1fr)) 180px',
                    borderColor: '#E0DDD8',
                  }}
                >
                  {week.map((date, dayIndex) => {
                  const dateKey = toKey(date)

                  const outsideMonth =
                    date.getMonth() !== month.month ||
                    date.getFullYear() !== month.year

                  return (
                    <DayCell
                      key={dayIndex}
                      date={date}
                      orders={orders[dateKey] ?? []}
                      selected={dateKey === selectedKey}
                      today={dateKey === today}
                      analyticsSku={analyticsSku}
                      outsideMonth={outsideMonth}
                      onClick={() => {
                  setSelectedKey(dateKey)
                  }}
                />
              )
        })}

                  <WeeklyTotalsColumn
                    totals={weeklyTotals}
                    sku={analyticsSku}
                  />
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex w-96 flex-shrink-0 flex-col overflow-hidden">
          <DetailPanel
            selectedKey={selectedKey}
            orders={orders}
            onFinishedQuantityChange={
              setFinishedQuantity
            }
            onFinishedChange={
              setStoreFinished
            }
            onShippedChange={
              setStoreShipped
            }
          />
        </div>
      </div>
    </div>
  )
}