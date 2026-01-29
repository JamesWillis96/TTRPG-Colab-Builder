// Helper for date-only validation in Mountain Standard Time (MST, UTC-7)
// Exports: isFutureDateInMST(dateOnly: string) -> boolean
// Interprets `dateOnly` as YYYY-MM-DD in MST (fixed UTC-7, no DST) and
// returns true only when the provided date is strictly after the current
// date in MST.

export function isFutureDateInMST(dateOnly: string): boolean {
  if (!dateOnly || typeof dateOnly !== 'string') return false

  const parts = dateOnly.split('-').map((p) => parseInt(p, 10))
  if (parts.length !== 3 || parts.some(isNaN)) return false
  const [year, month, day] = parts

  // Compute MST 'today' by shifting now by -7 hours (UTC-7)
  const now = new Date()
  const mstNow = new Date(now.getTime() - 7 * 60 * 60 * 1000)

  // Build UTC dates at midnight for comparison to avoid local TZ issues
  const providedUTC = Date.UTC(year, month - 1, day)
  const mstUTC = Date.UTC(mstNow.getUTCFullYear(), mstNow.getUTCMonth(), mstNow.getUTCDate())

  return providedUTC > mstUTC
}

export default isFutureDateInMST
