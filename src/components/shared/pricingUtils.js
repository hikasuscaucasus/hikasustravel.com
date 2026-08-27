// Pricing helpers shared across tour components. Kept in a plain .js module
// (no component exports) so React Fast Refresh stays happy.

// `startingFrom` is an optional per-tier map of owner-approved advertised prices
// ({ economy, midRange, luxury }). When a tour ships one, every "from" price on
// the site reads it instead of deriving the minimum from the table — the two can
// legitimately differ. Opt-in: without the key the derivation is unchanged.
export function getStartingPrice(pricing, startingFrom) {
  const advertised = lowestOf(startingFrom)
  if (advertised !== null) return advertised
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

// Lowest value of a `startingFrom` map, or null when the tour has none.
export function lowestOf(startingFrom) {
  if (!startingFrom) return null
  const nums = ['economy', 'midRange', 'luxury']
    .map((k) => parseFloat((startingFrom[k] || '').replace(/[^0-9.]/g, '')))
    .filter((n) => !isNaN(n) && n > 0)
  return nums.length > 0 ? Math.min(...nums) : null
}

// One tier's advertised price, or null when the tour has no `startingFrom`.
export function tierStartingFrom(startingFrom, tier) {
  if (!startingFrom) return null
  const n = parseFloat((startingFrom[tier] || '').replace(/[^0-9.]/g, ''))
  return isNaN(n) || n <= 0 ? null : n
}
