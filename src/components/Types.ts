// ─── Types ────────────────────────────────────────────────────────────────────

/*
 * Production status of an order:
 *   queue        synced from QuickBooks, not started
 *   in_progress  a worker started the pallets
 *   finished     pallets are built
 *   done         sales order closed & invoiced in QuickBooks
 */
export type OrderStatus =
  | 'queue'
  | 'in_progress'
  | 'finished'
  | 'done'

// One QuickBooks sales-order line (one API row)
export interface OrderLine {
  id: string
  ordered: number
  done: number
}

export interface Qty {
  ordered: number
  done: number
  lines: OrderLine[]
}

export interface SignOff {
  at: Date
  by: string | null
}

// Everything due for one Costco location on one day
export interface StoreOrder {
  id: string
  store: string
  salesOrderNumbers: string[]
  bso: Qty
  fourPack: Qty

  // Set only when every line of the store has been signed off
  started: SignOff | null
  finished: SignOff | null
  shipped: SignOff | null

  // Every line closed/invoiced in QuickBooks
  qbDone: boolean
  status: OrderStatus
}

export type StatusField =
  | 'in_progress'
  | 'finished'
  | 'shipped'

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

export function allLineIds(order: StoreOrder): string[] {
  return [
    ...order.bso.lines,
    ...order.fourPack.lines,
  ].map((line) => line.id)
}
