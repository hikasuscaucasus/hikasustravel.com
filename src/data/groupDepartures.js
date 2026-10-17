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
// Every departure also carries its booking deadline, derived here from the
// start date (BOOKING_DEADLINE_DAYS calendar days before it) so the three
// tours can never show a deadline that disagrees with their departure.
//
// scripts/validate-group-departures.js asserts the derived windows (lengths,
// shared starts/ends, the published table) and the deadlines against the
// owner-approved table, and runs as part of `npm run build`.

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

// Booking deadline rule for every scheduled group departure: exactly this
// many CALENDAR days before the tour's start date (not business days, not
// "one month"). 2027-06-10 → 2027-05-11.
export const BOOKING_DEADLINE_DAYS = 30

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

/** ISO booking deadline for a departure that starts on `startIso`. */
export function bookingDeadline(startIso) {
  return shift(startIso, -BOOKING_DEADLINE_DAYS)
}

/**
 * One ISO date ("2027-05-11") as the page's language writes a full date
 * ("11 May 2027", "11. Mai 2027", "11 de mayo de 2027", "11. května 2027"),
 * matching the hand-written departure labels in each locale's tours.json.
 * English uses the day-first British order those labels already use.
 */
export function formatDepartureDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, {
    timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric',
  })
}

/** Inclusive calendar-day length of an ISO window "YYYY-MM-DD/YYYY-MM-DD". */
export function windowDays(iso) {
  const [a, b] = iso.split('/')
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000) + 1
}

/**
 * The `groupDates` array a tour record carries, derived from the family
 * calendar: [{ start: '10 June', end: '20 June', year: '2027',
 * iso: '2027-06-10/2027-06-20', bookingDeadline: '2027-05-11',
 * family: '2027-06' }, …]. The shape is the one TourDetailPage, the cards and
 * the inquiry form already read; `bookingDeadline` is derived, never typed.
 */
export function familyGroupDates(variant, families = CAUCASUS_2027_FAMILIES) {
  const v = FAMILY_VARIANTS[variant]
  if (!v) throw new Error(`Unknown departure-family variant: ${variant}`)
  return families.map((f) => {
    const start = shift(f.start, v.startOffset)
    const end = shift(f.end, v.endOffset)
    return { start: label(start), end: label(end), year: start.slice(0, 4), iso: `${start}/${end}`, bookingDeadline: bookingDeadline(start), family: f.id }
  })
}
