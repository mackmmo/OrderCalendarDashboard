

// ─── Types ────────────────────────────────────────────────────────────────────

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