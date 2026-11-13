import type { ApiSalesOrder } from '../api/orders'
import type {
  OrderStatus,
  Qty,
  SignOff,
  StoreOrder,
} from '../components/Types.ts'

export type CalendarData = Record<string, StoreOrder[]>

function parseTimestamp(value: string | null): Date | null {
  if (!value) {
    return null
  }

  const parsedDate = new Date(value)

  return Number.isNaN(parsedDate.getTime())
    ? null
    : parsedDate
}

function emptyQty(): Qty {
  return { ordered: 0, done: 0, lines: [] }
}

/*
 * A store card is signed off only when every line on it is.
 * Show the latest sign-off (the one that completed the card).
 */
function combinedSignOff(
  rows: ApiSalesOrder[],
  timestampField:
    | 'started_time_stamp'
    | 'finished_time_stamp'
    | 'shipped_time_stamp',
  userField:
    | 'started_by_username'
    | 'finished_by_username'
    | 'shipped_by_username',
): SignOff | null {
  let latest: SignOff | null = null

  for (const row of rows) {
    const at = parseTimestamp(row[timestampField])

    if (!at) {
      return null
    }

    if (!latest || at > latest.at) {
      latest = { at, by: row[userField] }
    }
  }

  return latest
}

function storeStatus(order: StoreOrder): OrderStatus {
  if (order.qbDone) return 'done'
  if (order.finished) return 'finished'
  if (order.started) return 'in_progress'
  return 'queue'
}

export function transformOrders(
  apiOrders: ApiSalesOrder[],
): CalendarData {
  const grouped: CalendarData = {}
  const rowsByStore = new Map<string, ApiSalesOrder[]>()
  const storeById = new Map<string, StoreOrder>()

  for (const apiOrder of apiOrders) {
    const dateKey = apiOrder.production_date

    if (!dateKey) {
      continue
    }

    const store = apiOrder.store_name.trim()
    const id = `${dateKey}-${store}`
    let storeOrder = storeById.get(id)

    if (!storeOrder) {
      storeOrder = {
        id,
        store,
        salesOrderNumbers: [],
        bso: emptyQty(),
        fourPack: emptyQty(),
        started: null,
        finished: null,
        shipped: null,
        qbDone: false,
        status: 'queue',
      }

      storeById.set(id, storeOrder)
      rowsByStore.set(id, [])
      ;(grouped[dateKey] ??= []).push(storeOrder)
    }

    const item = apiOrder.item.trim().toUpperCase()
    const qty =
      item === 'BSO'
        ? storeOrder.bso
        : item === 'MP'
          ? storeOrder.fourPack
          : null

    if (!qty) {
      console.warn(
        `Unknown item type "${apiOrder.item}" for sales order ${apiOrder.sales_order_number}`,
      )
      continue
    }

    qty.ordered += apiOrder.qty_ordered
    qty.done += apiOrder.qty_finished
    qty.lines.push({
      id: apiOrder.sales_order_id,
      ordered: apiOrder.qty_ordered,
      done: apiOrder.qty_finished,
    })

    if (!storeOrder.salesOrderNumbers.includes(apiOrder.sales_order_number)) {
      storeOrder.salesOrderNumbers.push(apiOrder.sales_order_number)
    }

    rowsByStore.get(id)!.push(apiOrder)
  }

  for (const [id, rows] of rowsByStore) {
    const storeOrder = storeById.get(id)!

    storeOrder.started = combinedSignOff(rows, 'started_time_stamp', 'started_by_username')
    storeOrder.finished = combinedSignOff(rows, 'finished_time_stamp', 'finished_by_username')
    storeOrder.shipped = combinedSignOff(rows, 'shipped_time_stamp', 'shipped_by_username')
    storeOrder.qbDone =
      rows.length > 0 &&
      rows.every((row) => row.status === 'done')
    storeOrder.status = storeStatus(storeOrder)
  }

  /*
   * Keep stores displayed consistently within each calendar day.
   */
  for (const dateKey of Object.keys(grouped)) {
    grouped[dateKey] = grouped[dateKey]
      .filter((order) => order.bso.lines.length + order.fourPack.lines.length > 0)
      .sort((a, b) => a.store.localeCompare(b.store))
  }

  return grouped
}

/*
 * Spread a new "done" total for one product across its QB lines,
 * filling lines in order. Returns only the lines whose value changes.
 */
export function distributeDone(
  qty: Qty,
  total: number,
): { id: string; done: number }[] {
  let remaining = Math.max(0, Math.min(total, qty.ordered))
  const changes: { id: string; done: number }[] = []

  for (const line of qty.lines) {
    const done = Math.min(line.ordered, remaining)
    remaining -= done

    if (done !== line.done) {
      changes.push({ id: line.id, done })
    }
  }

  return changes
}
