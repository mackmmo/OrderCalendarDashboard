import { type StoreOrder, type WeeklyTotals,} from './Types.ts'

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