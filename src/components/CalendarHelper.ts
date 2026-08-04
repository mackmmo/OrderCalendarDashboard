
// ─── Calendar Helpers ─────────────────────────────────────────────────────────

export function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getWeeks(
  year: number,
  month: number,
): Date[][] {
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)

  // Move backward to the Monday of the week
  // containing the first day of the month.
  const startDate = new Date(firstDayOfMonth)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  const daysBackToMonday =
    firstDayOfWeek === 0
      ? 6
      : firstDayOfWeek - 1

  startDate.setDate(
    firstDayOfMonth.getDate() - daysBackToMonday,
  )

  // Move forward to the Friday of the week
  // containing the last day of the month.
  const endDate = new Date(lastDayOfMonth)
  const lastDayOfWeek = lastDayOfMonth.getDay()

  const daysForwardToFriday =
    lastDayOfWeek === 0
      ? 5
      : lastDayOfWeek === 6
        ? 6
        : 5 - lastDayOfWeek

  endDate.setDate(
    lastDayOfMonth.getDate() + daysForwardToFriday,
  )

  const weeks: Date[][] = []
  let currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const week: Date[] = []

    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      week.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    weeks.push(week)

    // Skip Saturday and Sunday.
    currentDate.setDate(currentDate.getDate() + 2)
  }

  return weeks
}

export const DAY_LABELS = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Totals',
]

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function fmtTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function fmtLongDate(date: Date) {
  const dayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][date.getDay()]

  return `${dayName}, ${
    MONTH_NAMES[date.getMonth()]
  } ${date.getDate()}`
}
