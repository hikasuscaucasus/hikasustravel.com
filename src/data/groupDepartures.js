// Scheduled group-tour departures, kept as ONE calendar so the tours that
// share it can never drift apart.
//
// The 2027 Caucasus group tours run as a family: the full 15-day Baku→Yerevan
// tour, an 11-day Azerbaijan + Georgia tour that starts WITH it and leaves the
// group in Tbilisi on its day 11, and an 11-day Georgia + Armenia tour that
// joins the route four days in (arrival Tbilisi → Telavi) and ends WITH it in
// Yerevan. Each family entry is the full tour's window; a variant is an offset
// from that window. tours.js calls familyGroupDates(variant) for each record's
// `groupDates`, so adding or moving a departure is one edit here.
//
// scripts/validate-group-departures.js asserts the derived windows (lengths,
// shared starts/ends, the published table) and runs as part of `npm run build`.

export const CAUCASUS_2027_FAMILIES = [
  { id: '2027-06', start: '2027-06-10', end: '2027-06-24' },
  { id: '2027-08', start: '2027-08-05', end: '2027-08-19' },
  { id: '2027-09', start: '2027-09-02', end: '2027-09-16' },
  { id: '2027-10', start: '2027-10-14', end: '2027-10-28' },
]

// startOffset / endOffset are calendar days relative to the family window.
export const FAMILY_VARIANTS = {
  full: { startOffset: 0, endOffset: 0 },     // 15 days, Baku → Yerevan
  'az-ge': { startOffset: 0, endOffset: -4 }, // 11 days, Baku → Tbilisi
  'ge-am': { startOffset: 4, endOffset: 0 },  // 11 days, Tbilisi → Yerevan
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function shift(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d + days))
  return t.toISOString().slice(0, 10)
}
function label(isoDate) {
  const [, m, d] = isoDate.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

/** Inclusive calendar-day length of an ISO window "YYYY-MM-DD/YYYY-MM-DD". */
export function windowDays(iso) {
  const [a, b] = iso.split('/')
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1
}

/**
 * The `groupDates` array a tour record carries, derived from the family
 * calendar: [{ start: '10 June', end: '20 June', year: '2027',
 * iso: '2027-06-10/2027-06-20', family: '2027-06' }, …]. The shape is the one
 * TourDetailPage, the cards and the inquiry form already read.
 */
export function familyGroupDates(variant, families = CAUCASUS_2027_FAMILIES) {
  const v = FAMILY_VARIANTS[variant]
  if (!v) throw new Error(`Unknown departure-family variant: ${variant}`)
  return families.map((f) => {
    const start = shift(f.start, v.startOffset)
    const end = shift(f.end, v.endOffset)
    return { start: label(start), end: label(end), year: start.slice(0, 4), iso: `${start}/${end}`, family: f.id }
  })
}
