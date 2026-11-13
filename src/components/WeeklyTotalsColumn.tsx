import { ProductTotals, WeeklyTotals } from "./Types"

// ─── Weekly Totals Column ──────────────────────────────────────────────────────────────────────

interface WeeklyTotalsColumnProps {
  totals: WeeklyTotals
  sku: 'BSO' | '4PAK'
}

export function WeeklyTotalsColumn({
  totals,
  sku,
}: WeeklyTotalsColumnProps) {
  const selectedTotals =
    sku === 'BSO'
      ? totals.bso
      : totals.fourPack

  return (
    <div className="h-full border-l-2 border-stone-300 bg-stone-100 p-3 lg:p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-stone-500 lg:text-sm">
        {sku} Week
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm text-stone-500">
            Ordered
          </p>

          <p className="text-2xl font-black lg:text-3xl tabular-nums text-stone-900">
            {selectedTotals.ordered}
          </p>
        </div>

        <div>
          <p className="text-sm text-stone-500">
            Finished
          </p>

          <p className="text-2xl font-black lg:text-3xl tabular-nums text-stone-900">
            {selectedTotals.finished}
          </p>
        </div>

        <div>
          <p className="text-sm text-stone-500">
            Remaining
          </p>

          <p className="text-2xl font-black lg:text-3xl tabular-nums text-stone-900">
            {selectedTotals.remaining}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsTotalsBar({
  sku,
  totals,
}: {
  sku: 'BSO' | '4PAK'
  totals: ProductTotals
}) {
  return (
    <div className="grid grid-cols-3 gap-2 border-b border-stone-300 bg-white px-3 py-2 md:gap-4 md:px-6 md:py-4">
      <div className="min-w-0 border-l-4 border-stone-800 bg-stone-100 px-2 py-2 md:px-5 md:py-3">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-stone-500 md:text-sm">
          {sku} Ordered
        </p>

        <p className="mt-1 text-2xl font-black md:text-4xl tabular-nums text-stone-900">
          {totals.ordered}
        </p>
      </div>

      <div className="min-w-0 border-l-4 border-stone-800 bg-stone-100 px-2 py-2 md:px-5 md:py-3">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-stone-500 md:text-sm">
          {sku} Finished
        </p>

        <p className="mt-1 text-2xl font-black md:text-4xl tabular-nums text-stone-900">
          {totals.finished}
        </p>
      </div>

      <div className="min-w-0 border-l-4 border-stone-800 bg-stone-100 px-2 py-2 md:px-5 md:py-3">
        <p className="truncate text-[10px] font-bold uppercase tracking-wider text-stone-500 md:text-sm">
          {sku} Remaining
        </p>

        <p className="mt-1 text-2xl font-black md:text-4xl tabular-nums text-stone-900">
          {totals.remaining}
        </p>
      </div>
    </div>
  )
}