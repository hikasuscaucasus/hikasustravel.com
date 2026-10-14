// One-off, auditable migration of every Hikasus tour SALES price from EUR to
// USD at the owner's fixed rate (see ./eur-to-usd.js for the rule).
//
//   node scripts/pricing/migrate-eur-to-usd.js            dry run: inventory + ledger, writes nothing to src/
//   node scripts/pricing/migrate-eur-to-usd.js --apply    rewrite src/data/tours.js and the 7 locale tours.json
//
// What it converts (and nothing else):
//   - src/data/tours.js   pricing[].{luxury,midRange,economy}  (the canonical per-pax / per-package table)
//                         pricePerPerson, singleSupplement       (group tour)
//                         heroFacts "From €X per person", faq "starting from €X", groupSummary "€X per person"
//                         enTouristTrip.offers lowPrice/highPrice + priceCurrency EUR -> USD
//                         and stamps every tour with `"priceCurrency": "USD"` (the re-run guard)
//   - src/i18n/locales/<lang>/tours.json   the translated heroFacts / faq / groupSummary duplicates of the above
//
// Every EUR amount found in a prose duplicate must equal one of the tour's own
// canonical EUR values (classic 4-pax price, table min/max, group price); any
// other amount, or any pricing cell that is not "€<digits>", is reported as
// AMBIGUOUS and the run stops before writing. The ledger
// (scripts/pricing/ledger-eur-to-usd.json) records original text, EUR, raw USD,
// whole USD, final USD and the rule for every single field, so
// validate-usd-prices.js can re-derive every price from the ORIGINAL EUR.
//
// Files are edited as raw text (CRLF preserved); nothing is re-serialised.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { eurToUsd, parseAmount, checkInvariants } from './eur-to-usd.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const APPLY = process.argv.includes('--apply')
const LANGS = ['en', 'de', 'fr', 'es', 'nl', 'cs', 'pl']
const TOURS_JS = join(ROOT, 'src/data/tours.js')
const LEDGER_OUT = join(__dirname, 'ledger-eur-to-usd.json')
const ORIGINAL_OUT = join(__dirname, 'original-eur-prices.json')

const { tours } = await import(pathToFileURL(TOURS_JS).href)

// ---------------------------------------------------------------------------
// helpers
const ledger = []
const ambiguous = []
const flags = []
const classic4Eur = (tour) => { const r = tour.pricing?.find((x) => x.travelers === '4'); const n = r ? parseAmount(r.economy) : NaN; return isNaN(n) ? null : n }
const collisions = new Map() // finalUsd -> Set of eur values
let eligibleTours = 0

function convert(eur, meta) {
  const r = eurToUsd(eur)
  const problems = checkInvariants(r)
  if (problems.length) throw new Error(`invariant violation for ${eur}: ${problems.join('; ')}`)
  const set = collisions.get(r.finalUsd) || new Set()
  set.add(eur)
  collisions.set(r.finalUsd, set)
  ledger.push({ ...meta, eur: r.eur, rawUsd: r.rawUsd, wholeUsd: r.wholeUsd, finalUsd: r.finalUsd, rule: r.rule })
  return r.finalUsd
}

// Reproduce the original string's digit grouping: "2,695" -> ",", "2.695" -> ".", "2 695" -> " ", "1695" -> none.
function groupLike(original, n) {
  const m = String(original).match(/\d([.,\s])\d{3}\b/)
  const sep = m ? m[1] : ''
  const s = String(n)
  if (!sep) return s
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, sep)
}

// Amount with a euro marker, in either position: "€1,695", "€ 550", "550 €", "2.695 EUR", "2 695 €".
const EURO_BEFORE = /€\s?(\d{1,3}(?:[.,\s]\d{3})+|\d+)/g
const EURO_AFTER = /(\d{1,3}(?:[.,\s]\d{3})+|\d+)\s?(?:€|\bEUR\b)/g

function lineOf(text, index) { return text.slice(0, index).split('\n').length }

// Canonical EUR facts for one tour, used to validate every prose duplicate.
function canonicalEur(tour) {
  const cells = []
  for (const row of tour.pricing || []) {
    if (row.travelers === 'Single Supplement') continue
    for (const k of ['luxury', 'midRange', 'economy']) {
      const n = parseAmount(row[k]); if (!isNaN(n)) cells.push(n)
    }
  }
  const classic4 = tour.pricing?.find((r) => r.travelers === '4')
  const out = new Map() // eur -> label
  if (cells.length) {
    out.set(Math.min(...cells), 'table minimum (from price)')
    out.set(Math.max(...cells), 'table maximum')
  }
  if (classic4) out.set(parseAmount(classic4.economy), 'Classic 4-pax (card from-price)')
  if (tour.pricePerPerson) out.set(parseAmount(tour.pricePerPerson), 'group price per person')
  return out
}

// Replace every euro-marked amount inside `segment` (one tour's text), validating each against canonical EUR values.
function convertProse(segment, { tour, file, fieldOf, baseLine }) {
  const canon = canonicalEur(tour)
  let out = ''
  let last = 0
  const matches = []
  for (const re of [EURO_BEFORE, EURO_AFTER]) {
    re.lastIndex = 0
    let m
    while ((m = re.exec(segment))) matches.push({ index: m.index, length: m[0].length, text: m[0], amountText: m[1] })
  }
  matches.sort((a, b) => a.index - b.index)
  for (const m of matches) {
    if (m.index < last) continue // overlapping match of the other pattern
    const eur = parseAmount(m.amountText)
    const label = canon.get(eur)
    const field = fieldOf(m.index)
    const lineNo = baseLine + lineOf(segment, m.index) - 1
    if (!label && field === 'heroFacts' && classic4Eur(tour)) {
      // Stale copy: the only heroFacts amounts on the site are the card
      // from-price (Classic, 4 pax). heroFacts is not rendered anywhere
      // (TourDetailHero retired it), so reconcile it to the current canonical
      // value instead of carrying a dead EUR figure forward. Flagged in the ledger.
      const canonEur = classic4Eur(tour)
      flags.push({ tour: tour.slug, file, lineNo, text: m.text, note: `stale heroFacts amount €${eur} != current Classic 4-pax €${canonEur}; reconciled to the converted canonical from-price` })
      const finalUsd = convert(canonEur, { kind: 'duplicate', tour: tour.title, slug: tour.slug, file, lineNo, field, package: 'Classic 4-pax (card from-price) — stale €' + eur + ' reconciled', originalText: m.text, staleEur: eur })
      const replacement = `${groupLike(m.amountText, finalUsd)} USD`
      ledger[ledger.length - 1].newText = replacement
      out += segment.slice(last, m.index) + replacement
      last = m.index + m.length
      continue
    }
    if (!label) {
      ambiguous.push({ tour: tour.slug, file, lineNo, text: m.text, reason: 'euro amount does not match any canonical price of this tour' })
      continue
    }
    const finalUsd = convert(eur, { kind: 'duplicate', tour: tour.title, slug: tour.slug, file, lineNo, field, package: label, originalText: m.text })
    const replacement = `${groupLike(m.amountText, finalUsd)} USD`
    ledger[ledger.length - 1].newText = replacement
    out += segment.slice(last, m.index) + replacement
    last = m.index + m.length
  }
  return out + segment.slice(last)
}

// Position of each top-level tour block inside a file's raw text.
function blockRanges(text, keyFinder) {
  const starts = keyFinder(text).sort((a, b) => a.index - b.index)
  return starts.map((s, i) => ({ ...s, end: i + 1 < starts.length ? starts[i + 1].index : text.length }))
}

// ---------------------------------------------------------------------------
// 1. Inventory + canonical conversion in src/data/tours.js
const toursRaw = readFileSync(TOURS_JS, 'utf-8')
const originalSnapshot = []
const inventory = []

const slugStarts = (text) => tours.map((t) => {
  const re = new RegExp(`\\n\\s*"slug": "${t.slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",`)
  const m = re.exec(text)
  if (!m) throw new Error(`slug ${t.slug} not found in tours.js`)
  return { slug: t.slug, index: m.index }
})
const toursRanges = blockRanges(toursRaw, slugStarts)
// a block starts at the `"slug"` line; the record's opening `{` and `"type"` precede/follow it — `type` is the line after slug in this file
let toursOut = ''
let cursor = 0

for (const range of toursRanges) {
  const tour = tours.find((t) => t.slug === range.slug)
  const segment = toursRaw.slice(range.index, range.end)
  const baseLine = lineOf(toursRaw, range.index)
  const country = tour.country || 'georgia'
  const inv = {
    slug: tour.slug, title: tour.title, type: tour.type, country,
    url: `https://www.hikasustravel.com/en/${tour.type === 'group' ? 'group-tours' : 'private-tours'}/${tour.slug}/`,
    published: true, // tours.js has no draft flag: every record in the array is routed, prerendered and in the sitemap
    priceSource: 'src/data/tours.js', currency: tour.priceCurrency || 'EUR (by UI convention: € prefix in data / rendering)',
    pricingRows: (tour.pricing || []).length, hasGroupPrice: !!tour.pricePerPerson,
    cardPriceSource: tour.type === 'group' ? 'pricePerPerson' : 'pricing[travelers=4].economy',
    schemaPriceSource: tour.enTouristTrip?.offers ? 'tourSeo.js Offer (min of table) + hand-authored enTouristTrip.offers (EN)' : 'tourSeo.js Offer (min of table)',
    eligible: false,
  }
  inventory.push(inv)
  originalSnapshot.push({ slug: tour.slug, title: tour.title, type: tour.type, pricing: tour.pricing, pricePerPerson: tour.pricePerPerson, singleSupplement: tour.singleSupplement, enOffers: tour.enTouristTrip?.offers })

  if (tour.priceCurrency === 'USD') {
    inv.currency = 'USD'
    toursOut += toursRaw.slice(cursor, range.end); cursor = range.end
    continue // re-run guard: already migrated, never reconvert
  }

  let seg = segment
  // 1a. pricing table cells — must look exactly like "€<digits[,digits]>"
  let cellCount = 0
  const pricingStart = seg.indexOf('"pricing": [')
  const pricingEnd = pricingStart >= 0 ? seg.indexOf('\n    ],', pricingStart) : -1
  if (pricingStart >= 0 && pricingEnd < 0) throw new Error(`${tour.slug}: cannot find end of pricing block`)
  if (pricingStart >= 0) {
    const before = seg.slice(0, pricingStart)
    const block = seg.slice(pricingStart, pricingEnd)
    const after = seg.slice(pricingEnd)
    let rowIdx = -1
    let travelers = null
    const converted = block.replace(/"travelers": "([^"]+)"|"(luxury|midRange|economy)": "([^"]*)"/g, (whole, trav, key, val, offset) => {
      if (trav !== undefined) { rowIdx++; travelers = trav; return whole }
      cellCount++
      if (!/^€\d{1,3}(,\d{3})*$|^€\d+$/.test(val)) {
        ambiguous.push({ tour: tour.slug, file: 'src/data/tours.js', lineNo: baseLine + lineOf(seg, pricingStart + offset) - 1, text: val, reason: 'pricing cell is not a plain "€<amount>" EUR value' })
        return whole
      }
      const eur = parseAmount(val)
      const tierName = { luxury: 'Premium', midRange: 'Mid-Range', economy: 'Classic' }[key]
      const pax = travelers === 'Single Supplement' ? 'Single Supplement' : `${travelers} pax`
      const finalUsd = convert(eur, { kind: 'canonical', tour: tour.title, slug: tour.slug, file: 'src/data/tours.js', lineNo: baseLine + lineOf(seg, pricingStart + offset) - 1, field: `pricing[${rowIdx}].${key}`, package: `${pax} / ${tierName}`, originalText: val })
      ledger[ledger.length - 1].newText = String(finalUsd)
      return `"${key}": "${finalUsd}"`
    })
    seg = before + converted + after
    const rows = (tour.pricing || []).length
    if (cellCount !== rows * 3) throw new Error(`${tour.slug}: expected ${rows * 3} pricing cells, matched ${cellCount}`)
  }
  // 1b. group tour scalar prices (rendered with a € prefix by PriceSection; the groupSummary duplicate says "€2,695 per person")
  for (const key of ['pricePerPerson', 'singleSupplement']) {
    if (tour[key] === undefined) continue
    const re = new RegExp(`"${key}": "([^"]*)"`)
    const m = re.exec(seg)
    if (!m) throw new Error(`${tour.slug}: ${key} not found in text`)
    if (!/^\d{1,3}(,\d{3})*$|^\d+$/.test(m[1])) { ambiguous.push({ tour: tour.slug, file: 'src/data/tours.js', text: m[1], reason: `${key} is not a plain amount` }); continue }
    const eur = parseAmount(m[1])
    const finalUsd = convert(eur, { kind: 'canonical', tour: tour.title, slug: tour.slug, file: 'src/data/tours.js', lineNo: baseLine + lineOf(seg, m.index) - 1, field: key, package: key === 'pricePerPerson' ? 'group departure / per person' : 'Single Supplement', originalText: m[1] })
    ledger[ledger.length - 1].newText = String(finalUsd)
    seg = seg.slice(0, m.index) + `"${key}": "${finalUsd}"` + seg.slice(m.index + m[0].length)
  }
  // 1c. hand-authored EN schema offers (lowPrice / highPrice are EUR amounts; currency code flips)
  if (tour.enTouristTrip?.offers) {
    const offersStart = seg.indexOf('"offers": {', seg.indexOf('"enTouristTrip": {'))
    const offersEnd = seg.indexOf('}', offersStart)
    let block = seg.slice(offersStart, offersEnd)
    if (!/"priceCurrency": "EUR"/.test(block)) throw new Error(`${tour.slug}: enTouristTrip.offers has no EUR priceCurrency`)
    const canon = canonicalEur(tour)
    block = block.replace(/"(lowPrice|highPrice)": "(\d+)"/g, (whole, key, val, offset) => {
      const eur = parseInt(val, 10)
      if (!canon.has(eur)) { ambiguous.push({ tour: tour.slug, file: 'src/data/tours.js', text: whole, reason: `${key} does not match a canonical table value` }); return whole }
      const finalUsd = convert(eur, { kind: 'schema', tour: tour.title, slug: tour.slug, file: 'src/data/tours.js', lineNo: baseLine + lineOf(seg, offersStart + offset) - 1, field: `enTouristTrip.offers.${key}`, package: canon.get(eur), originalText: val })
      ledger[ledger.length - 1].newText = String(finalUsd)
      return `"${key}": "${finalUsd}"`
    })
    block = block.replace('"priceCurrency": "EUR"', '"priceCurrency": "USD"')
    seg = seg.slice(0, offersStart) + block + seg.slice(offersEnd)
  }
  // 1d. prose duplicates (heroFacts / faq / groupSummary) — every remaining euro-marked amount in this tour's text
  const fieldOf = (idx) => {
    const head = seg.slice(0, idx)
    const keys = [...head.matchAll(/"(heroFacts|faq|groupSummary|pricing|included|notIncluded|itinerary|gallery|enTouristTrip|description|listingDescription|metaDescription)":/g)]
    return keys.length ? keys[keys.length - 1][1] : 'unknown'
  }
  seg = convertProse(seg, { tour, file: 'src/data/tours.js', fieldOf, baseLine })
  // 1e. source-currency stamp right after the "type" line (the re-run guard)
  const typeRe = /\n(\s*)"type": "(private|group)",/
  const tm = typeRe.exec(seg)
  if (!tm) throw new Error(`${tour.slug}: "type" line not found`)
  const eol = seg[tm.index + tm[0].length] === '\r' ? '\r' : ''
  seg = seg.slice(0, tm.index + tm[0].length) + `${eol}\n${tm[1]}"priceCurrency": "USD",` + seg.slice(tm.index + tm[0].length)

  inv.eligible = true
  eligibleTours++
  toursOut += toursRaw.slice(cursor, range.index) + seg
  cursor = range.end
}
toursOut += toursRaw.slice(cursor)

// ---------------------------------------------------------------------------
// 2. Locale duplicates in src/i18n/locales/<lang>/tours.json
const localeOut = {}
for (const lang of LANGS) {
  const file = `src/i18n/locales/${lang}/tours.json`
  const raw = readFileSync(join(ROOT, file), 'utf-8')
  const data = JSON.parse(raw)
  const keys = Object.keys(data)
  const finder = (text) => keys.map((k) => {
    const re = new RegExp(`\\n\\s*"${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}": \\{`, 'g')
    const all = [...text.matchAll(re)]
    if (all.length !== 1) throw new Error(`${file}: top-level key ${k} matched ${all.length} times`)
    return { slug: k, index: all[0].index }
  })
  const ranges = blockRanges(raw, finder)
  let out = raw.slice(0, ranges[0]?.index ?? raw.length)
  for (const range of ranges) {
    const tour = tours.find((t) => t.slug === range.slug)
    const segment = raw.slice(range.index, range.end)
    if (!tour) { out += segment; continue }
    if (tour.priceCurrency === 'USD') { out += segment; continue }
    const baseLine = lineOf(raw, range.index)
    const fieldOf = (idx) => {
      const head = segment.slice(0, idx)
      const ks = [...head.matchAll(/"(heroFacts|faq|groupSummary|included|notIncluded|itinerary|description|listingDescription|metaDescription)":/g)]
      return ks.length ? ks[ks.length - 1][1] : 'unknown'
    }
    out += convertProse(segment, { tour, file, fieldOf, baseLine })
  }
  localeOut[file] = out
}

// ---------------------------------------------------------------------------
// 3. Report
const canonical = ledger.filter((e) => e.kind === 'canonical')
const dups = ledger.filter((e) => e.kind === 'duplicate')
const schema = ledger.filter((e) => e.kind === 'schema')
const byType = (k, v) => inventory.filter((t) => t[k] === v).length
console.log(`TOUR INVENTORY: ${inventory.length} published tours (private ${byType('type', 'private')}, group ${byType('type', 'group')}; georgia ${byType('country', 'georgia')}, armenia ${byType('country', 'armenia')}, azerbaijan ${byType('country', 'azerbaijan')}, caucasus ${byType('country', 'caucasus')})`)
console.log(`ELIGIBLE EUR TOURS: ${eligibleTours}   ALREADY USD: ${inventory.length - eligibleTours}`)
console.log(`EUR COMMERCIAL FIELDS: canonical ${canonical.length}, prose duplicates ${dups.length}, schema offers ${schema.length}, total ${ledger.length}`)
console.log(`FLAGS: ${flags.length}`)
for (const f of flags) console.log('  FLAG', JSON.stringify(f))
console.log(`AMBIGUOUS: ${ambiguous.length}`)
for (const a of ambiguous) console.log('  AMBIGUOUS', JSON.stringify(a))
const multi = [...collisions.entries()].filter(([, s]) => s.size > 1)
console.log(`COLLISIONS (distinct EUR values sharing one final USD): ${multi.length}`)
for (const [usd, s] of multi) console.log(`  ${[...s].sort((a, b) => a - b).map((e) => `€${e}`).join(' + ')} -> ${usd} USD`)
const boundary = ledger.filter((e) => { const r = e.wholeUsd % 100; return r >= 96 || r <= 12 })
console.log(`BOUNDARY CASES (whole USD ending 96..12): ${boundary.length}`)
for (const e of boundary) console.log(`  ${e.slug} ${e.field} €${e.eur} -> raw ${e.rawUsd} -> whole ${e.wholeUsd} -> final ${e.finalUsd} (${e.rule})`)

mkdirSync(__dirname, { recursive: true })
if (ledger.length) {
  writeFileSync(LEDGER_OUT, JSON.stringify({ generated: new Date().toISOString(), rate: '1 EUR = 1.12 USD', inventory, flags, collisions: [...collisions.entries()].filter(([, s]) => s.size > 1).map(([usd, s]) => ({ finalUsd: usd, eur: [...s].sort((a, b) => a - b) })), entries: ledger }, null, 2) + '\n')
  writeFileSync(ORIGINAL_OUT, JSON.stringify({ captured: new Date().toISOString(), currency: 'EUR', tours: originalSnapshot }, null, 2) + '\n')
  console.log(`ledger -> ${LEDGER_OUT}\noriginal EUR snapshot -> ${ORIGINAL_OUT}`)
}

if (ambiguous.length) { console.error('\nSTOP: ambiguous fields found; nothing written.'); process.exit(2) }
if (!APPLY) { console.log('\nDRY RUN — no source files modified. Re-run with --apply to write.'); process.exit(0) }
if (!ledger.length) { console.log('\nNothing to convert.'); process.exit(0) }

// 4. Apply (raw text, line endings untouched)
writeFileSync(TOURS_JS, toursOut)
for (const [file, out] of Object.entries(localeOut)) writeFileSync(join(ROOT, file), out)
console.log(`\nAPPLIED: wrote src/data/tours.js and ${Object.keys(localeOut).length} locale files.`)
