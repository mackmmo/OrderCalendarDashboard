export interface ApiSalesOrder {
  sales_order_id: number
  sales_order_number: number
  store_name: string
  item: string
  qty_ordered: number
  qty_finished: number
  qty_shipped: number
  finished: boolean
  shipped: boolean
  sales_order_date: string
  ship_date: string
  finished_time_stamp: string | null
  shipped_time_stamp: string | null
}

export interface Qty {
  ordered: number
  done: number
  orderId: number | null
}

export interface StoreOrder {
  id: string
  store: string
  bso: Qty
  fourPack: Qty
  finishedAt: Date | null
  shippedAt: Date | null
}

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

export function transformOrders(
  apiOrders: ApiSalesOrder[],
): CalendarData {
  const grouped: CalendarData = {}

  for (const apiOrder of apiOrders) {
    const dateKey = apiOrder.ship_date
    const storeKey = apiOrder.store_name.trim()
    const item = apiOrder.item.trim().toUpperCase()

    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }

    let storeOrder = grouped[dateKey].find(
      (order) => order.store === storeKey,
    )

    if (!storeOrder) {
      storeOrder = {
        id: `${dateKey}-${storeKey}`,
        store: storeKey,

        bso: {
          ordered: 0,
          done: 0,
          orderId: null,
        },

        fourPack: {
          ordered: 0,
          done: 0,
          orderId: null,
        },

        finishedAt: null,
        shippedAt: null,
      }

      grouped[dateKey].push(storeOrder)
    }

    if (item === 'BSO') {
      storeOrder.bso = {
        ordered: apiOrder.qty_ordered,
        done: apiOrder.qty_finished,
        orderId: apiOrder.sales_order_id,
      }
    } else if (item === 'MP') {
      storeOrder.fourPack = {
        ordered: apiOrder.qty_ordered,
        done: apiOrder.qty_finished,
        orderId: apiOrder.sales_order_id,
      }
    } else {
      console.warn(
        `Unknown item type "${apiOrder.item}" for sales order ${apiOrder.sales_order_id}`,
      )
    }

    /*
     * A store card can represent both a BSO row and an fourPack row.
     * For display purposes, use whichever timestamp is present/latest.
     */
    const finishedAt = parseTimestamp(
      apiOrder.finished_time_stamp,
    )

    const shippedAt = parseTimestamp(
      apiOrder.shipped_time_stamp,
    )

    if (
      finishedAt &&
      (!storeOrder.finishedAt ||
        finishedAt > storeOrder.finishedAt)
    ) {
      storeOrder.finishedAt = finishedAt
    }

    if (
      shippedAt &&
      (!storeOrder.shippedAt ||
        shippedAt > storeOrder.shippedAt)
    ) {
      storeOrder.shippedAt = shippedAt
    }
  }

  /*
   * Keep stores displayed consistently within each calendar day.
   */
  for (const dateKey of Object.keys(grouped)) {
    grouped[dateKey].sort((a, b) =>
      a.store.localeCompare(b.store),
    )
  }

  return grouped
}