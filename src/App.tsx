import { useEffect, useState } from 'react'
import {getSalesOrders,updateSalesOrder,} from './api/orders'
import {transformOrders, type CalendarData,} from './utils/TransformOrders'
import { type StoreOrder,} from './components/Types.ts'
import { calculateWeeklyTotals } from './components/Analytics'
import { toKey, getWeeks } from './components/CalendarHelper.ts'
import DayCell from './components/DayCell.tsx'
import {WeeklyTotalsColumn } from './components/WeeklyTotalsColumn.tsx'
import { DetailPanel } from './components/DetailPanel.tsx'
import AnalyticsTotalsBar from './components/WeeklyTotalsColumn.tsx'
import { MONTH_NAMES, DAY_LABELS } from './components/CalendarHelper.ts'

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