// Pricing helpers shared across tour components. Kept in a plain .js module
// (no component exports) so React Fast Refresh stays happy.

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
