// Owner-defined EUR -> USD migration rule for Hikasus tour sales prices.
//
// This is NOT a live FX feature. It is the one-off rule the owner set for the
// October 2026 repricing, kept as code so every converted value on the site
// can be re-derived and audited from its original EUR amount:
//
//   1. rawUsd   = eur x 1.12              (exact: integer cents, 112 cents/EUR)
//   2. wholeUsd = rawUsd rounded half-up to the nearest whole dollar
//   3. owner pricing rule on wholeUsd:
//        remainder = wholeUsd % 100
//        remainder >= 96                    -> hundredBase + 95   (x95 band, e.g. 396..399 -> 395)
//        remainder <= 11 and wholeUsd >= 100 -> hundredBase - 5    (x95 band, e.g. 400..411 -> 395)
//        otherwise                          -> round UP to the next multiple of 5
//
// Every arithmetic step is on integers, so no floating-point boundary error
// can move a price across a band edge. The function is monotonic
// non-decreasing, so converting the minimum of a price table yields the
// minimum of the converted table (used by the From-price reconciliation).

export const RATE_CENTS_PER_EUR = 112 // exactly 1.12 USD per EUR

export const RULE_X95 = 'x95 special band'
export const RULE_UP5 = 'round upward to next 5'
export const RULE_KEEP = 'already a multiple of 5'

/**
 * Owner pricing rule applied to an already whole-dollar USD amount.
 * Exported separately so the rule can be unit-tested on its own.
 */
export function ownerRound(wholeUsd) {
  if (!Number.isInteger(wholeUsd) || wholeUsd <= 0) {
    throw new Error(`ownerRound: expected a positive integer, got ${wholeUsd}`)
  }
  const remainder = wholeUsd % 100
  const hundredBase = Math.floor(wholeUsd / 100) * 100
  if (remainder >= 96) return { finalUsd: hundredBase + 95, rule: RULE_X95 }
  if (remainder <= 11 && wholeUsd >= 100) return { finalUsd: hundredBase - 5, rule: RULE_X95 }
  if (wholeUsd % 5 === 0) return { finalUsd: wholeUsd, rule: RULE_KEEP }
  return { finalUsd: Math.ceil(wholeUsd / 5) * 5, rule: RULE_UP5 }
}

/**
 * Full conversion of one EUR sales price.
 * @param {number} eur  positive integer EUR amount (all Hikasus prices are whole euros)
 * @returns {{ eur:number, rawUsdCents:number, rawUsd:string, wholeUsd:number, finalUsd:number, rule:string }}
 */
export function eurToUsd(eur) {
  if (!Number.isInteger(eur) || eur <= 0) {
    throw new Error(`eurToUsd: expected a positive integer EUR amount, got ${eur}`)
  }
  const rawUsdCents = eur * RATE_CENTS_PER_EUR
  // half-up to the nearest whole dollar, on integers
  const wholeUsd = Math.floor((rawUsdCents + 50) / 100)
  const { finalUsd, rule } = ownerRound(wholeUsd)
  const rawUsd = `${Math.floor(rawUsdCents / 100)}.${String(rawUsdCents % 100).padStart(2, '0')}`
  return { eur, rawUsdCents, rawUsd, wholeUsd, finalUsd, rule }
}

/** Parse a stored price string such as "€1,695", "1 695 €", "2.695 EUR", "480" to an integer. */
export function parseAmount(str) {
  const digits = String(str).replace(/[^0-9]/g, '')
  if (!digits) return NaN
  return parseInt(digits, 10)
}

/** True when a final price satisfies the owner's invariants (sections 51-53 of the brief). */
export function checkInvariants({ wholeUsd, finalUsd }) {
  const problems = []
  if (finalUsd % 5 !== 0) problems.push(`final ${finalUsd} does not end in 0 or 5`)
  const remainder = wholeUsd % 100
  const inBand = remainder >= 96 || (remainder <= 11 && wholeUsd >= 100)
  if (inBand) {
    const n = remainder >= 96 ? Math.floor(wholeUsd / 100) + 1 : Math.floor(wholeUsd / 100)
    if (finalUsd !== n * 100 - 5) problems.push(`whole ${wholeUsd} is in the x95 band but final is ${finalUsd}, expected ${n * 100 - 5}`)
  } else {
    if (finalUsd < wholeUsd) problems.push(`final ${finalUsd} is below whole ${wholeUsd} outside the x95 band`)
    if (finalUsd - wholeUsd >= 5) problems.push(`final ${finalUsd} is more than 4 above whole ${wholeUsd}`)
  }
  return problems
}
