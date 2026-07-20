import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Qty {
  ordered: number
  done: number
}

interface StoreOrder {
  id: string
  store: string
  bso: Qty
  mp: Qty
  finishedAt: Date | null
  shippedAt: Date | null
}

type CalendarData = Record<string, StoreOrder[]>

// ─── Seed Data ────────────────────────────────────────────────────────────────

let _uid = 0
function o(store: string, bso: number, mp: number): StoreOrder {
  return {
    id: String(++_uid),
    store,
    bso: { ordered: bso, done: 0 },
    mp: { ordered: mp, done: 0 },
    finishedAt: null,
    shippedAt: null,
  }
}


// ─── Calendar Helpers ─────────────────────────────────────────────────────────

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getWeeks(year: number, month: number): (Date | null)[][] {
  const weeks: (Date | null)[][] = []
  const total = new Date(year, month + 1, 0).getDate()
  let week: (Date | null)[] = Array(5).fill(null)
  let filled = false

  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d)
    const dow = date.getDay()
    if (dow === 0 || dow === 6) continue
    const col = dow - 1
    if (col === 0 && filled) {
      weeks.push(week)
      week = Array(5).fill(null)
      filled = false
    }
    week[col] = date
    filled = true
    if (col === 4) {
      weeks.push(week)
      week = Array(5).fill(null)
      filled = false
    }
  }
  if (filled) weeks.push(week)
  return weeks
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function fmtLongDate(d: Date) {
  const dow = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()]
  return `${dow}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
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
  onUpdate,
}: {
  order: StoreOrder
  onUpdate: (updated: StoreOrder) => void
}) {
  function setBsoDone(v: number) {
    onUpdate({ ...order, bso: { ...order.bso, done: v } })
  }
  function setMpDone(v: number) {
    onUpdate({ ...order, mp: { ...order.mp, done: v } })
  }
  function toggleFinished() {
    onUpdate({ ...order, finishedAt: order.finishedAt ? null : new Date() })
  }
  function toggleShipped() {
    onUpdate({ ...order, shippedAt: order.shippedAt ? null : new Date() })
  }

  const totalOrdered = order.bso.ordered + order.mp.ordered
  const totalDone = order.bso.done + order.mp.done
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
      <div className="divide-y" style={{ borderColor: '#F0EDE8' }}>
        {/* BSO */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium tracking-widest text-stone-500 uppercase w-8"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                BSO
              </span>
              <span className="text-xs text-stone-400">
                {order.bso.ordered} {order.bso.ordered === 1 ? 'pallet' : 'pallets'} ordered
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">Done</span>
              <Stepper value={order.bso.done} max={order.bso.ordered} onChange={setBsoDone} />
            </div>
          </div>
        </div>

        {/* MP */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium tracking-widest text-stone-500 uppercase w-8"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                MP
              </span>
              <span className="text-xs text-stone-400">
                {order.mp.ordered} {order.mp.ordered === 1 ? 'pallet' : 'pallets'} ordered
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400">Done</span>
              <Stepper value={order.mp.done} max={order.mp.ordered} onChange={setMpDone} />
            </div>
          </div>
        </div>
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
  onClick,
}: {
  date: Date | null
  orders: StoreOrder[]
  selected: boolean
  today: boolean
  onClick: () => void
}) {
  if (!date) {
    return (
      <div
        className="border-r border-b"
        style={{ borderColor: '#E0DDD8', backgroundColor: '#F4F2EE', minHeight: 120 }}
      />
    )
  }

  const totalPallets = orders.reduce((s, o) => s + o.bso.ordered + o.mp.ordered, 0)
  const allFinished = orders.length > 0 && orders.every((o) => !!o.finishedAt)
  const allShipped = orders.length > 0 && orders.every((o) => !!o.shippedAt)

  return (
    <button
      onClick={onClick}
      className={`border-r border-b text-left p-2.5 w-full transition-colors ${
        selected
          ? 'bg-stone-900 text-white'
          : 'bg-white hover:bg-stone-50 text-stone-900'
      }`}
      style={{ borderColor: '#E0DDD8', minHeight: 120, display: 'block' }}
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
        {orders.map((ord) => (
          <div key={ord.id} className="flex items-baseline gap-0" style={{ lineHeight: '1.3' }}>
            <span
              className={`text-[10px] font-medium truncate flex-1 ${
                selected ? 'text-stone-300' : 'text-stone-600'
              }`}
              style={{ fontFamily: 'Barlow Condensed, sans-serif', maxWidth: 70 }}
            >
              {ord.store}
            </span>
            <span
              className={`text-[9px] tabular-nums flex-shrink-0 ml-1 ${
                selected ? 'text-stone-500' : 'text-stone-400'
              }`}
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              B{ord.bso.ordered} M{ord.mp.ordered}
            </span>
          </div>
        ))}
      </div>
    </button>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function DetailPanel({
  selectedKey,
  orders,
  onUpdateOrder,
}: {
  selectedKey: string | null
  orders: CalendarData
  onUpdateOrder: (key: string, updated: StoreOrder) => void
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

  const totalPallets = dayOrders.reduce((s, o) => s + o.bso.ordered + o.mp.ordered, 0)
  const donePallets = dayOrders.reduce((s, o) => s + o.bso.done + o.mp.done, 0)
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
              onUpdate={(updated) => onUpdateOrder(selectedKey, updated)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ─── Stock Panel ─────────────────────────────────────────────────────────────

function StockPanel({
  orders,
  stock,
  onStockChange,
}: {
  orders: CalendarData
  stock: { bso: number; mp: number }
  onStockChange: (updated: { bso: number; mp: number }) => void
}) {
  const reservedBso = Object.values(orders).flat().reduce((s, o) => s + o.bso.ordered, 0)
  const reservedMp = Object.values(orders).flat().reduce((s, o) => s + o.mp.ordered, 0)
  const remainBso = stock.bso - reservedBso
  const remainMp = stock.mp - reservedMp

  function bump(product: 'bso' | 'mp', delta: number) {
    onStockChange({ ...stock, [product]: Math.max(0, stock[product] + delta) })
  }

  return (
    <div
      className="flex-shrink-0 border-b px-6 py-0"
      style={{ borderColor: '#E0DDD8', backgroundColor: '#FFFFFF' }}
    >
      <div className="flex items-stretch divide-x" style={{ borderColor: '#E0DDD8' }}>
        {/* Label */}
        <div className="flex items-center pr-5 py-3">
          <span
            className="text-xs text-stone-400 uppercase tracking-widest"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Pseudo-Stock
          </span>
        </div>

        {/* BSO */}
        <div className="flex items-center gap-6 px-6 py-3">
          <span
            className="text-xs font-medium text-stone-500 uppercase tracking-widest w-6"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            BSO
          </span>
          <StockStat label="Available" value={stock.bso} />
          <div className="flex items-center gap-1">
            <button
              onClick={() => bump('bso', -1)}
              disabled={stock.bso === 0}
              className="w-5 h-5 border border-stone-200 text-stone-400 hover:bg-stone-50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-xs leading-none transition-colors"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              −
            </button>
            <button
              onClick={() => bump('bso', 1)}
              className="w-5 h-5 border border-stone-200 text-stone-400 hover:bg-stone-50 flex items-center justify-center text-xs leading-none transition-colors"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              +
            </button>
          </div>
          <StockStat label="Reserved" value={reservedBso} />
          <StockStat
            label="Remaining"
            value={remainBso}
            warn={remainBso < 0}
          />
        </div>

        {/* MP */}
        <div className="flex items-center gap-6 px-6 py-3">
          <span
            className="text-xs font-medium text-stone-500 uppercase tracking-widest w-6"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            MP
          </span>
          <StockStat label="Available" value={stock.mp} />
          <div className="flex items-center gap-1">
            <button
              onClick={() => bump('mp', -1)}
              disabled={stock.mp === 0}
              className="w-5 h-5 border border-stone-200 text-stone-400 hover:bg-stone-50 disabled:opacity-25 disabled:cursor-not-allowed flex items-center justify-center text-xs leading-none transition-colors"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              −
            </button>
            <button
              onClick={() => bump('mp', 1)}
              className="w-5 h-5 border border-stone-200 text-stone-400 hover:bg-stone-50 flex items-center justify-center text-xs leading-none transition-colors"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              +
            </button>
          </div>
          <StockStat label="Reserved" value={reservedMp} />
          <StockStat
            label="Remaining"
            value={remainMp}
            warn={remainMp < 0}
          />
        </div>

        {/* Costco note */}
        <div className="flex items-center px-6 py-3 ml-auto">
          <span
            className="text-xs text-stone-300 italic"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Costco orders ~2 wks out
          </span>
        </div>
      </div>
    </div>
  )
}

function StockStat({
  label,
  value,
  warn,
}: {
  label: string
  value: number
  warn?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-[9px] text-stone-400 uppercase tracking-widest leading-none"
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium tabular-nums leading-none ${
          warn ? 'text-stone-900 underline decoration-dotted underline-offset-2' : 'text-stone-700'
        }`}
        style={{ fontFamily: 'DM Mono, monospace' }}
      >
        {value < 0 ? `−${Math.abs(value)}` : value}
      </span>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [orders, setOrders] = useState<CalendarData>(SEED)
  const [selectedKey, setSelectedKey] = useState<string | null>('2026-07-15')
  const [month, setMonth] = useState({ year: 2026, month: 6 })
  const [stock, setStock] = useState({ bso: 48, mp: 31 })

  const today = toKey(new Date())
  const weeks = getWeeks(month.year, month.month)

  function updateOrder(dateKey: string, updated: StoreOrder) {
    setOrders((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey].map((o) => (o.id === updated.id ? updated : o)),
    }))
  }

  function prevMonth() {
    setMonth((m) => {
      const d = new Date(m.year, m.month - 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  function nextMonth() {
    setMonth((m) => {
      const d = new Date(m.year, m.month + 1, 1)
      return { year: d.getFullYear(), month: d.getMonth() }
    })
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F4F2EE' }}>
      {/* App Header */}
      <header
        className="flex items-center justify-between px-6 border-b flex-shrink-0"
        style={{
          borderColor: '#E0DDD8',
          backgroundColor: '#FFFFFF',
          height: 52,
        }}
      >
        <div className="flex items-baseline gap-3">
          <h1
            className="text-xl font-semibold tracking-wide text-stone-900 uppercase"
            style={{ fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '0.1em' }}
          >
            Production Orders
          </h1>
          <span className="text-stone-300 text-sm">·</span>
          <span
            className="text-sm text-stone-500"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            {MONTH_NAMES[month.month]} {month.year}
          </span>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="w-8 h-8 flex items-center justify-center border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors text-sm"
          >
            ‹
          </button>
          <button
            onClick={() => setMonth({ year: 2026, month: 6 })}
            className="px-3 h-8 border border-stone-200 text-xs text-stone-500 hover:bg-stone-50 transition-colors"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            today
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </header>

      {/* Stock Panel */}
      <StockPanel orders={orders} stock={stock} onStockChange={setStock} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Day header row */}
          <div
            className="grid flex-shrink-0 border-b"
            style={{ gridTemplateColumns: 'repeat(5, 1fr)', borderColor: '#E0DDD8' }}
          >
            {DAY_LABELS.map((label) => (
              <div
                key={label}
                className="py-2 text-center border-r"
                style={{ borderColor: '#E0DDD8' }}
              >
                <span
                  className="text-xs font-medium text-stone-400 uppercase tracking-widest"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Week rows */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className="grid border-b"
                style={{
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  borderColor: '#E0DDD8',
                }}
              >
                {week.map((date, di) => {
                  const key = date ? toKey(date) : null
                  return (
                    <DayCell
                      key={di}
                      date={date}
                      orders={key ? (orders[key] ?? []) : []}
                      selected={!!key && key === selectedKey}
                      today={key === today}
                      onClick={() => key && setSelectedKey(key)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="w-96 flex-shrink-0 overflow-hidden flex flex-col">
          <DetailPanel
            selectedKey={selectedKey}
            orders={orders}
            onUpdateOrder={updateOrder}
          />
        </div>
      </div>
    </div>
  )
}
