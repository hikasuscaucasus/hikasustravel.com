// Pricing helpers shared across tour components. Kept in a plain .js module
// (no component exports) so React Fast Refresh stays happy.
//
// Tour sales prices in src/data/tours.js are whole US dollars (stored as plain
// digit strings, e.g. "1895") since the October 2026 EUR -> USD migration
// (scripts/pricing/). Every visible price and every schema Offer must go
// through these helpers so the site shows one currency, one way, everywhere.

export const PRICE_CURRENCY = 'USD'

/** "1895" / 1895 / "1,895" -> 1895; null for anything that is not a positive amount. */
export function parsePrice(raw) {
  const n = parseFloat(String(raw ?? '').replace(/[^0-9.]/g, ''))
  return isNaN(n) || n <= 0 ? null : n
}

/** 1895 -> "1,895" (digit grouping only; the ui.json strings that take {price} add the currency word). */
export function formatPriceNumber(n) {
  return Number(n).toLocaleString('en-US')
}

/** 1895 -> "1,895 USD" — the one site-wide visible price format. */
export function formatPrice(n) {
  return `${formatPriceNumber(n)} ${PRICE_CURRENCY}`
}

export function getStartingPrice(pricing) {
  if (!pricing || pricing.length === 0) return null
  const numericRows = pricing.filter((r) => r.travelers !== 'Single Supplement')
  if (numericRows.length === 0) return null
  const prices = numericRows.flatMap((r) => [r.luxury, r.midRange, r.economy]
    .map((p) => parseFloat((p || '').replace(/[^0-9.]/g, '')))
    .filter((n) => !isNaN(n) && n > 0)
  )
  if (prices.length === 0) return null
  return Math.min(...prices)
}
