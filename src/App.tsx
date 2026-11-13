import { useEffect, useState } from 'react'
import { getSalesOrders, updateSalesOrder } from './api/orders'
import { distributeDone, transformOrders, type CalendarData } from './utils/TransformOrders'
import { allLineIds, type Qty, type StatusField, type StoreOrder } from './components/Types.ts'
import { calculateWeeklyTotals } from './components/Analytics'
import { toKey, getWeeks, MONTH_NAMES, DAY_LABELS } from './components/CalendarHelper.ts'
import DayCell from './components/DayCell.tsx'
import AnalyticsTotalsBar, { WeeklyTotalsColumn } from './components/WeeklyTotalsColumn.tsx'
import { DetailPanel } from './components/DetailPanel.tsx'
import Login from './pages/Login.tsx'

// 5 weekday columns, plus a weekly totals column on large screens
const CALENDAR_GRID =
  'grid grid-cols-5 lg:grid-cols-[repeat(5,minmax(0,1fr))_140px] xl:grid-cols-[repeat(5,minmax(0,1fr))_180px]'

// Day to open by default: today if it has orders, else the first order day this month
function defaultDayKey(calendarData: CalendarData): string | null {
  const today = new Date()
  const todayKey = toKey(today)

  if (calendarData[todayKey]) {
    return todayKey
  }

  const monthPrefix = todayKey.slice(0, 7)
  const firstThisMonth = Object.keys(calendarData)
    .filter((dateKey) => dateKey.startsWith(monthPrefix))
    .sort()[0]

  return firstThisMonth ?? null
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // Check if access token is present in local storage. If not, render the Login component.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!localStorage.getItem('accessToken'),
  )

  const [orders, setOrders] = useState<CalendarData>({})

  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  // Phones: the day detail covers the calendar while open
  const [detailOpen, setDetailOpen] = useState(false)

  const [actionError, setActionError] = useState<string | null>(null)

  const [month, setMonth] = useState(() => {
    const today = new Date()

    return {
      year: today.getFullYear(),
      month: today.getMonth(),
    }
  })

  const [analyticsSku, setAnalyticsSku] = useState<'BSO' | '4PAK'>('BSO')

  async function reloadOrders() {
    try {
      const apiOrders = await getSalesOrders()
      const calendarData = transformOrders(apiOrders)

      setOrders(calendarData)

      // Keep the user's selection; only pick a default the first time
      setSelectedKey((current) => current ?? defaultDayKey(calendarData))
    } catch (error) {
      console.error('Failed to load orders:', error)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    void reloadOrders()

    // Keep every screen on the floor in sync with each other's updates
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void reloadOrders()
      }
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [isLoggedIn])

  useEffect(() => {
    function handleAuthExpired() {
      setIsLoggedIn(false)
      setOrders({})
      setSelectedKey(null)
      setDetailOpen(false)
    }

    window.addEventListener('auth-expired', handleAuthExpired)

    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired)
    }
  }, [])

  // Run an update, then reload so the screen matches the server
  // (also after a partial failure).
  async function saveAndReload(
    description: string,
    update: () => Promise<unknown>,
  ) {
    try {
      setActionError(null)
      await update()
    } catch (error) {
      console.error(`Failed to ${description}:`, error)
      setActionError(`Couldn't ${description}. Please try again.`)
    } finally {
      await reloadOrders()
    }
  }

  // Set the pallets-done total for one product at one store.
  async function setDone(qty: Qty, total: number) {
    const changes = distributeDone(qty, total)

    await saveAndReload('update pallets done', () =>
      Promise.all(
        changes.map((change) =>
          updateSalesOrder(change.id, { qty_finished: change.done }),
        ),
      ),
    )
  }

  // Sign a store's order in/out of In Progress, Finished or Shipped.
  async function setStatus(
    order: StoreOrder,
    field: StatusField,
    value: boolean,
  ) {
    const labels: Record<StatusField, string> = {
      in_progress: 'in progress',
      finished: 'finished',
      shipped: 'shipped',
    }

    await saveAndReload(
      `${value ? 'mark' : 'unmark'} ${order.store} as ${labels[field]}`,
      () =>
        Promise.all(
          allLineIds(order).map((id) =>
            updateSalesOrder(id, { [field]: value }),
          ),
        ),
    )
  }

  function shiftMonth(delta: number) {
    setMonth((currentMonth) => {
      const date = new Date(currentMonth.year, currentMonth.month + delta, 1)

      return {
        year: date.getFullYear(),
        month: date.getMonth(),
      }
    })
  }

  const today = toKey(new Date())

  const weeks = getWeeks(month.year, month.month)

  const visibleMonthOrders = weeks.flatMap((week) =>
    week.flatMap((date) => orders[toKey(date)] ?? []),
  )

  const visibleMonthTotals = calculateWeeklyTotals(visibleMonthOrders)

  const selectedMonthTotals =
    analyticsSku === 'BSO'
      ? visibleMonthTotals.bso
      : visibleMonthTotals.fourPack

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />
  }

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: '#F4F2EE' }}
    >
      {/* App header */}
      <header
        className="flex h-[52px] flex-shrink-0 items-center justify-between gap-2 border-b px-3 md:px-6"
        style={{ borderColor: '#E0DDD8', backgroundColor: '#FFFFFF' }}
      >
        <div className="flex min-w-0 items-baseline gap-2 md:gap-3">
          <h1
            className="truncate text-lg font-semibold uppercase tracking-wide text-stone-900 md:text-xl"
            style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              letterSpacing: '0.1em',
            }}
          >
            <span className="hidden sm:inline">Production </span>Orders
          </h1>

          <span className="text-sm text-stone-300">·</span>

          <span
            className="whitespace-nowrap text-sm text-stone-500"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            <span className="sm:hidden">{MONTH_NAMES[month.month].slice(0, 3)}</span>
            <span className="hidden sm:inline">{MONTH_NAMES[month.month]}</span>{' '}
            {month.year}
          </span>
        </div>

        {/* Month navigation */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="flex h-10 w-10 items-center justify-center border border-stone-200 text-sm text-stone-500 transition-colors hover:bg-stone-50 md:h-8 md:w-8"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => {
              const now = new Date()

              setMonth({ year: now.getFullYear(), month: now.getMonth() })
            }}
            className="h-10 border border-stone-200 px-3 text-xs text-stone-500 transition-colors hover:bg-stone-50 md:h-8"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            today
          </button>

          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="flex h-10 w-10 items-center justify-center border border-stone-200 text-sm text-stone-500 transition-colors hover:bg-stone-50 md:h-8 md:w-8"
          >
            ›
          </button>
        </div>
      </header>

      {/* Analytics SKU toggle */}
      <div className="flex items-center gap-2 border-b border-stone-300 bg-white px-3 py-2 md:px-6 md:py-3">
        <span className="mr-1 text-xs font-bold uppercase tracking-wide text-stone-500 md:mr-2 md:text-sm">
          Products
        </span>

        {(['BSO', '4PAK'] as const).map((sku) => (
          <button
            key={sku}
            type="button"
            onClick={() => setAnalyticsSku(sku)}
            className={`min-h-10 border px-4 text-sm font-bold transition-colors ${
              analyticsSku === sku
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {sku}
          </button>
        ))}
      </div>

      <AnalyticsTotalsBar sku={analyticsSku} totals={selectedMonthTotals} />

      {actionError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 border-b border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 md:px-6"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="min-h-10 px-2 text-red-700"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Dashboard body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Day headers */}
          <div
            className={`${CALENDAR_GRID} flex-shrink-0 border-b`}
            style={{ borderColor: '#E0DDD8' }}
          >
            {DAY_LABELS.map((label, index) => (
              <div
                key={label}
                className={`border-r py-2 text-center ${index === 5 ? 'hidden lg:block' : ''}`}
                style={{ borderColor: '#E0DDD8' }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-widest text-stone-400"
                  style={{ fontFamily: 'DM Mono, monospace' }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar weeks */}
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            {weeks.map((week, weekIndex) => {
              const weeklyOrders = week.flatMap((date) => orders[toKey(date)] ?? [])
              const weeklyTotals = calculateWeeklyTotals(weeklyOrders)

              return (
                <div
                  key={weekIndex}
                  className={`${CALENDAR_GRID} items-stretch border-b`}
                  style={{ borderColor: '#E0DDD8' }}
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
                          setDetailOpen(true)
                        }}
                      />
                    )
                  })}

                  <div className="hidden lg:block">
                    <WeeklyTotalsColumn totals={weeklyTotals} sku={analyticsSku} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel: side column on tablet/desktop, full screen on phones */}
        <div
          className={`${
            detailOpen ? 'fixed inset-0 z-30 flex' : 'hidden'
          } flex-col overflow-hidden md:static md:z-auto md:flex md:w-80 md:flex-shrink-0 lg:w-96`}
        >
          <DetailPanel
            selectedKey={selectedKey}
            orders={orders}
            onClose={() => setDetailOpen(false)}
            onDoneChange={setDone}
            onStatusChange={setStatus}
          />
        </div>
      </div>
    </div>
  )
}
