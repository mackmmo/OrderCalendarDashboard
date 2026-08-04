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

export default function AnalyticsTotalsBar({
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