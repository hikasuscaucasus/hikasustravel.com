// Asserts the scheduled group tours' departures against the published 2027
// calendar (src/data/groupDepartures.js) and against each other, so the
// three tours of the Caucasus family can never drift apart. Runs in
// `npm run build` before the Vite build; any mismatch fails the build.
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = (p) => pathToFileURL(join(__dirname, '../src', p)).href
const { tours } = await import(src('data/tours.js'))
const { windowDays, BOOKING_DEADLINE_DAYS, bookingDeadline, formatDepartureDate } = await import(src('data/groupDepartures.js'))

const LANGS = ['en', 'de', 'fr', 'es', 'nl', 'cs', 'pl']

// The owner-approved table. Edit groupDepartures.js AND this table together.
const EXPECTED = {
  '15-day-caucasus-group-tour': { days: 15, windows: ['2027-06-10/2027-06-24', '2027-08-05/2027-08-19', '2027-09-02/2027-09-16', '2027-10-14/2027-10-28'] },
  '11-day-caucasus-group-tour-azerbaijan-georgia': { days: 11, windows: ['2027-06-10/2027-06-20', '2027-08-05/2027-08-15', '2027-09-02/2027-09-12', '2027-10-14/2027-10-24'] },
  '11-day-caucasus-group-tour-georgia-armenia': { days: 11, windows: ['2027-06-14/2027-06-24', '2027-08-09/2027-08-19', '2027-09-06/2027-09-16', '2027-10-18/2027-10-28'] },
}
// Owner-approved booking deadlines, exactly 30 calendar days before each
// start (never business days, never "a month"). Keyed by departure start.
const EXPECTED_DEADLINES = {
  '2027-06-10': '2027-05-11', '2027-08-05': '2027-07-06', '2027-09-02': '2027-08-03', '2027-10-14': '2027-09-14',
  '2027-06-14': '2027-05-15', '2027-08-09': '2027-07-10', '2027-09-06': '2027-08-07', '2027-10-18': '2027-09-18',
}
const plusDays = (iso, n) => new Date(Date.parse(iso) + n * 86400000).toISOString().slice(0, 10)
let deadlinesChecked = 0

const problems = []
const bad = (m) => problems.push(m)
const bySlug = Object.fromEntries(tours.map((t) => [t.slug, t]))

for (const [slug, exp] of Object.entries(EXPECTED)) {
  const tour = bySlug[slug]
  if (!tour) { bad(`${slug}: missing from tours.js`); continue }
  if (tour.type !== 'group' || tour.priceType !== 'fixed') bad(`${slug}: must be a fixed-price group tour`)
  if (tour.days !== exp.days) bad(`${slug}: days ${tour.days} != ${exp.days}`)
  const iso = (tour.groupDates || []).map((d) => d.iso)
  if (JSON.stringify(iso) !== JSON.stringify(exp.windows)) bad(`${slug}: windows ${JSON.stringify(iso)} != ${JSON.stringify(exp.windows)}`)
  for (const d of tour.groupDates || []) {
    if (windowDays(d.iso) !== exp.days) bad(`${slug}: ${d.iso} spans ${windowDays(d.iso)} days, expected ${exp.days}`)
    if (d.year !== d.iso.slice(0, 4)) bad(`${slug}: year label ${d.year} != ${d.iso}`)
    // Booking deadline: present, derived (deadline + 30 days = start) and
    // equal to the owner-approved table.
    const start = d.iso.slice(0, 10)
    if (!d.bookingDeadline) { bad(`${slug}: ${d.iso} has no bookingDeadline`); continue }
    if (plusDays(d.bookingDeadline, BOOKING_DEADLINE_DAYS) !== start) bad(`${slug}: deadline ${d.bookingDeadline} + ${BOOKING_DEADLINE_DAYS} days != ${start}`)
    if (d.bookingDeadline !== bookingDeadline(start)) bad(`${slug}: deadline ${d.bookingDeadline} != derived ${bookingDeadline(start)}`)
    if (d.bookingDeadline !== EXPECTED_DEADLINES[start]) bad(`${slug}: deadline ${d.bookingDeadline} != owner table ${EXPECTED_DEADLINES[start]}`)
    deadlinesChecked++
  }
  // Locale labels must carry the same day numbers, in the same order, and no
  // placeholder may survive ("to be announced" in any language).
  for (const lang of LANGS) {
    const entry = JSON.parse(readFileSync(join(__dirname, `../src/i18n/locales/${lang}/tours.json`), 'utf8'))[slug]
    if (!entry) { bad(`${slug}: no ${lang} entry`); continue }
    const labels = entry.departures || []
    if (labels.length !== exp.windows.length) { bad(`${slug}: ${lang} has ${labels.length} departure labels`); continue }
    labels.forEach((label, i) => {
      const nums = (label.match(/\d+/g) || []).map(Number)
      const [a, b] = exp.windows[i].split('/')
      const want = [Number(a.slice(8, 10)), Number(b.slice(8, 10)), Number(a.slice(0, 4))]
      if (JSON.stringify(nums) !== JSON.stringify(want)) bad(`${slug}: ${lang} label "${label}" != ${exp.windows[i]}`)
    })
    // Every locale must name the "Book by" label in its own language and
    // render each deadline as a full day / month-word / year date.
    const ui = JSON.parse(readFileSync(join(__dirname, `../src/i18n/locales/${lang}/ui.json`), 'utf8'))
    if (!ui['form.bookBy'] || !ui['form.bookBy'].includes('{date}')) bad(`${lang}: ui.json form.bookBy missing or has no {date}`)
    else if (lang !== 'en' && /\bBook by\b/.test(ui['form.bookBy'])) bad(`${lang}: form.bookBy is still English`)
    for (const d of tour.groupDates || []) {
      const text = formatDepartureDate(d.bookingDeadline, lang)
      const [, , dd] = d.bookingDeadline.split('-').map(Number)
      if (!new RegExp(`^${dd}\\.? (de )?\\p{L}+ (de )?2027$`, 'u').test(text)) bad(`${slug}: ${lang} deadline renders as "${text}"`)
    }
    const blob = JSON.stringify(entry).toLowerCase()
    for (const s of ['to be announced', 'wird noch bekannt', 'à annoncer', 'por anunciar', 'nog bekend', 'bude oznámen', 'zostaną ogłoszone']) if (blob.includes(s)) bad(`${slug}: ${lang} still says "${s}"`)
  }
}

// Family synchronisation: the 11-day tours start with / end with the 15-day tour.
const full = bySlug['15-day-caucasus-group-tour'], azge = bySlug['11-day-caucasus-group-tour-azerbaijan-georgia'], geam = bySlug['11-day-caucasus-group-tour-georgia-armenia']
if (full && azge && geam) {
  full.groupDates.forEach((f, i) => {
    const [fs, fe] = f.iso.split('/'), [as] = azge.groupDates[i].iso.split('/'), [, ge] = geam.groupDates[i].iso.split('/')
    if (as !== fs) bad(`family ${i + 1}: AZ+GE starts ${as}, 15-day starts ${fs}`)
    if (ge !== fe) bad(`family ${i + 1}: GE+AM ends ${ge}, 15-day ends ${fe}`)
    for (const x of [full, azge, geam]) if (x.groupDates[i].family !== f.family) bad(`family ${i + 1}: ${x.slug} family id ${x.groupDates[i].family}`)
  })
}

if (problems.length) {
  console.error(`Group departures: ${problems.length} problem(s)`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}
const wantDeadlines = Object.keys(EXPECTED).length * EXPECTED['15-day-caucasus-group-tour'].windows.length
if (deadlinesChecked !== wantDeadlines) {
  console.error(`Group departures: only ${deadlinesChecked}/${wantDeadlines} booking deadlines checked`)
  process.exit(1)
}
console.log(`Group departures OK: ${Object.keys(EXPECTED).length} tours × ${EXPECTED['15-day-caucasus-group-tour'].windows.length} families, ${LANGS.length} locales, ${deadlinesChecked}/${wantDeadlines} booking deadlines = start − ${BOOKING_DEADLINE_DAYS} calendar days`)
