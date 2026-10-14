// Independent validation of the EUR -> USD tour price migration.
//
// Reads the ORIGINAL EUR ledger (scripts/pricing/ledger-eur-to-usd.json),
// recomputes every expected USD amount with eur-to-usd.js, and compares that
// against (a) the current source data, (b) the rendered pages — the local
// dist/ build, or the live site with --live. It never trusts a migrated value
// as its own input.
//
//   node scripts/pricing/validate-usd-prices.js            source + dist/
//   node scripts/pricing/validate-usd-prices.js --live     source + https://www.hikasustravel.com
//   node scripts/pricing/validate-usd-prices.js --source   source only (no HTML)
//
// Exit code 1 on any mismatch.
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as cheerio from 'cheerio'
import { eurToUsd, checkInvariants, parseAmount } from './eur-to-usd.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
const LIVE = process.argv.includes('--live')
const SOURCE_ONLY = process.argv.includes('--source')
const SITE = 'https://www.hikasustravel.com'
const LANGS = ['en', 'de', 'fr', 'es', 'nl', 'cs', 'pl']
const fmt = (n) => `${Number(n).toLocaleString('en-US')} USD`

const ledger = JSON.parse(readFileSync(join(__dirname, 'ledger-eur-to-usd.json'), 'utf-8'))
const original = JSON.parse(readFileSync(join(__dirname, 'original-eur-prices.json'), 'utf-8'))
const { tours, featuredToursFor, primaryToursFor, combinedToursCovering } = await import(pathToFileURL(join(ROOT, 'src/data/tours.js')).href)

const problems = []
const bad = (scope, msg) => problems.push(`${scope}: ${msg}`)
const stats = { ledgerEntries: 0, sourceChecks: 0, pagesChecked: 0, offersChecked: 0, visibleChecks: 0 }

// ---------------------------------------------------------------------------
// 1. Re-derive every ledger entry from its ORIGINAL EUR and compare with the current source
const bySlug = new Map(tours.map((t) => [t.slug, t]))
const expectedTable = new Map() // slug -> { cells: Map(field->usd), from, classic4, group, supplement }
for (const e of ledger.entries) {
  stats.ledgerEntries++
  const r = eurToUsd(e.eur)
  const inv = checkInvariants(r)
  if (inv.length) bad(`${e.slug} ${e.field}`, inv.join('; '))
  if (r.finalUsd !== e.finalUsd) bad(`${e.slug} ${e.field}`, `ledger final ${e.finalUsd} != recomputed ${r.finalUsd} from EUR ${e.eur}`)
  if (r.finalUsd % 5 !== 0) bad(`${e.slug} ${e.field}`, `final ${r.finalUsd} does not end in 0/5`)
  const tour = bySlug.get(e.slug)
  if (!tour) { bad(e.slug, 'tour no longer in tours.js'); continue }
  const exp = expectedTable.get(e.slug) || { cells: new Map() }
  expectedTable.set(e.slug, exp)
  if (e.kind === 'canonical') {
    stats.sourceChecks++
    let actual
    const m = e.field.match(/^pricing\[(\d+)\]\.(\w+)$/)
    if (m) actual = tour.pricing?.[Number(m[1])]?.[m[2]]
    else actual = tour[e.field]
    if (actual !== String(r.finalUsd)) bad(`${e.slug} ${e.field}`, `source has ${JSON.stringify(actual)}, expected "${r.finalUsd}" (from EUR ${e.eur})`)
    exp.cells.set(e.field, r.finalUsd)
  } else if (e.kind === 'schema') {
    stats.sourceChecks++
    const key = e.field.split('.').pop()
    const actual = tour.enTouristTrip?.offers?.[key]
    if (actual !== String(r.finalUsd)) bad(`${e.slug} ${e.field}`, `source has ${JSON.stringify(actual)}, expected "${r.finalUsd}"`)
    if (tour.enTouristTrip?.offers?.priceCurrency !== 'USD') bad(`${e.slug} enTouristTrip.offers`, `priceCurrency ${tour.enTouristTrip?.offers?.priceCurrency}`)
  } else {
    stats.sourceChecks++
    const text = readFileSync(join(ROOT, e.file), 'utf-8')
    if (!text.includes(e.newText)) bad(`${e.slug} ${e.file} ${e.field}`, `"${e.newText}" not found in file`)
    if (parseAmount(e.newText) !== r.finalUsd) bad(`${e.slug} ${e.file} ${e.field}`, `newText ${e.newText} != expected ${r.finalUsd}`)
  }
}
// every tour must carry the source-currency stamp
for (const t of tours) if (t.priceCurrency !== 'USD') bad(t.slug, `priceCurrency is ${t.priceCurrency}`)
// no euro marks anywhere in tour data
for (const f of ['src/data/tours.js', ...LANGS.map((l) => `src/i18n/locales/${l}/tours.json`)]) {
  const text = readFileSync(join(ROOT, f), 'utf-8')
  const n = (text.match(/€|\bEUR\b/g) || []).length
  if (n) bad(f, `${n} euro mark(s) remain`)
}
// nothing lost, nothing invalid: every original cell has a positive integer USD counterpart
for (const o of original.tours) {
  const t = bySlug.get(o.slug)
  if (!t) { bad(o.slug, 'tour missing after migration'); continue }
  if ((o.pricing || []).length !== (t.pricing || []).length) bad(o.slug, 'pricing row count changed')
  for (let i = 0; i < (o.pricing || []).length; i++) {
    for (const k of ['travelers', 'luxury', 'midRange', 'economy']) {
      const before = o.pricing[i][k], after = t.pricing[i][k]
      if (k === 'travelers') { if (before !== after) bad(o.slug, `row ${i} travelers changed`); continue }
      if (!/^\d+$/.test(after) || Number(after) <= 0) bad(o.slug, `pricing[${i}].${k} = ${JSON.stringify(after)} is not a positive integer`)
      if (Number(after) !== eurToUsd(parseAmount(before)).finalUsd) bad(o.slug, `pricing[${i}].${k}: ${before} -> ${after}, expected ${eurToUsd(parseAmount(before)).finalUsd}`)
    }
  }
  for (const k of ['pricePerPerson', 'singleSupplement']) {
    if (o[k] === undefined) continue
    if (Number(t[k]) !== eurToUsd(parseAmount(o[k])).finalUsd) bad(o.slug, `${k}: ${o[k]} -> ${t[k]}`)
  }
}
// from-price reconciliation (same business logic as the components)
const minOf = (pricing) => Math.min(...pricing.filter((r) => r.travelers !== 'Single Supplement').flatMap((r) => [r.luxury, r.midRange, r.economy].map(parseAmount)).filter((n) => n > 0))
const expectedFor = (slug) => {
  const t = bySlug.get(slug)
  const o = original.tours.find((x) => x.slug === slug)
  if (t.type === 'group') return { from: Number(t.pricePerPerson), supplement: Number(t.singleSupplement), card: Number(t.pricePerPerson) }
  const from = minOf(t.pricing)
  if (from !== eurToUsd(minOf(o.pricing)).finalUsd) bad(slug, `from-price ${from} != converted original minimum ${eurToUsd(minOf(o.pricing)).finalUsd}`)
  const classic4 = t.pricing.find((r) => r.travelers === '4')
  return { from, card: classic4 ? parseAmount(classic4.economy) : null, cells: t.pricing.flatMap((r) => [r.luxury, r.midRange, r.economy].map(parseAmount)) }
}
// cross-locale duplicate consistency: same (slug, field) -> same USD in every file
const dupGroups = new Map()
for (const e of ledger.entries.filter((x) => x.kind === 'duplicate')) {
  const k = `${e.slug}|${e.field}|${e.package}`
  const set = dupGroups.get(k) || new Set(); set.add(e.finalUsd); dupGroups.set(k, set)
}
for (const [k, set] of dupGroups) if (set.size > 1) bad(k, `locale duplicates disagree: ${[...set].join(', ')}`)

console.log(`SOURCE: ${stats.ledgerEntries} ledger entries re-derived, ${stats.sourceChecks} source checks, ${problems.length} problem(s)`)
if (SOURCE_ONLY) finish()

// ---------------------------------------------------------------------------
// 2. Rendered pages
async function getHtml(path) {
  if (LIVE) {
    const url = `${SITE}${path}?v=${Date.now()}`
    const res = await fetch(url, { headers: { 'cache-control': 'no-cache' }, redirect: 'manual' })
    if (res.status !== 200) return { status: res.status, html: '' }
    return { status: 200, html: await res.text() }
  }
  const file = join(ROOT, 'dist', path.replace(/\/$/, ''), 'index.html')
  if (!existsSync(file)) return { status: 404, html: '' }
  return { status: 200, html: readFileSync(file, 'utf-8') }
}
const jsonLdOf = ($) => {
  const out = []
  $('script[type="application/ld+json"]').each((_, el) => { try { out.push(JSON.parse($(el).contents().text())) } catch { out.push({ __parseError: true }) } })
  return out
}
const offersIn = (node, out = []) => {
  if (Array.isArray(node)) { node.forEach((n) => offersIn(n, out)); return out }
  if (!node || typeof node !== 'object') return out
  if (node.price !== undefined || node.lowPrice !== undefined || node.highPrice !== undefined) out.push(node)
  Object.values(node).forEach((v) => offersIn(v, out))
  return out
}
// Visible USD amounts. Elements are separated by a space (see textOf) so a date
// chip's year never fuses with the price after it; locale digit grouping in
// translated prose (3,020 / 3.020 / 3 020) all parses to the same integer.
const usdAmountsIn = (text) => new Set([...text.matchAll(/(?<![\d.,])(\d{1,3}(?:[.,\s]\d{3})+|\d+) USD/g)].map((m) => parseAmount(m[1])))
const textOf = (html) => cheerio.load(html.replace(/>/g, '> '))('body').text()

const liveMismatch = []
const signatures = new Map() // slug -> Map(lang -> signature)
let euroPages = 0

for (const t of tours) {
  const prefix = t.type === 'group' ? 'group-tours' : 'private-tours'
  const exp = expectedFor(t.slug)
  for (const lang of LANGS) {
    const path = `/${lang}/${prefix}/${t.slug}/`
    const { status, html } = await getHtml(path)
    stats.pagesChecked++
    if (status !== 200) { bad(path, `HTTP ${status}`); continue }
    const $ = cheerio.load(html)
    const visible = textOf(html)
    if (/€/.test(visible)) { euroPages++; bad(path, `euro sign in visible text: "${(visible.match(/.{0,30}€.{0,30}/) || [''])[0].replace(/\s+/g, ' ')}"`) }
    if (/"priceCurrency"\s*:\s*"EUR"/.test(html)) bad(path, 'priceCurrency EUR in JSON-LD')
    // schema
    const offers = offersIn(jsonLdOf($))
    if (!offers.length) bad(path, 'no priced Offer in JSON-LD')
    for (const o of offers) {
      stats.offersChecked++
      if (o.priceCurrency !== 'USD') bad(path, `offer priceCurrency ${o.priceCurrency}`)
      if (o.price !== undefined && Number(o.price) !== exp.from) bad(path, `offer price ${o.price} != expected from-price ${exp.from}`)
      if (o.lowPrice !== undefined && Number(o.lowPrice) !== exp.from) bad(path, `lowPrice ${o.lowPrice} != expected ${exp.from}`)
      if (o.highPrice !== undefined && exp.cells && Number(o.highPrice) !== Math.max(...exp.cells)) bad(path, `highPrice ${o.highPrice} != expected ${Math.max(...exp.cells)}`)
    }
    // visible prices: every converted table cell / group price must be on the page, formatted "N USD"
    const amounts = usdAmountsIn(visible)
    const mustShow = t.type === 'group' ? [exp.from, exp.supplement] : [exp.from, ...exp.cells]
    for (const v of new Set(mustShow)) {
      stats.visibleChecks++
      if (!amounts.has(v)) { liveMismatch.push(path); bad(path, `visible price ${fmt(v)} not found`) }
    }
    // cross-locale signature of the tour's price surface
    const sig = [...amounts].sort((a, b) => a - b).join(',')
    const m = signatures.get(t.slug) || new Map(); m.set(lang, sig); signatures.set(t.slug, m)
  }
}
let crossLocale = 0
for (const [slug, m] of signatures) {
  const sigs = new Set(m.values())
  if (sigs.size > 1) { crossLocale++; bad(slug, `cross-locale price signatures differ: ${[...m.entries()].map(([l, s]) => `${l}=[${s}]`).join(' ')}`) }
}

// hubs, home, group listing, collection pages: no euro sign, expected card prices present
const hubPaths = (lang) => [
  { path: `/${lang}/`, expect: [...featuredToursFor('georgia'), ...featuredToursFor('armenia')].map((t) => expectedFor(t.slug).card).concat(tours.filter((t) => t.type === 'group').map((t) => expectedFor(t.slug).card)), label: 'homepage' },
  { path: `/${lang}/private-tours/`, expect: [], label: 'global tour hub (chooser)' },
  { path: `/${lang}/group-tours/`, expect: tours.filter((t) => t.type === 'group').map((t) => expectedFor(t.slug).card), label: 'group tour listings' },
  ...['caucasus', 'georgia', 'armenia', 'azerbaijan'].map((c) => ({
    path: `/${lang}/tours/${c}/`,
    expect: [...primaryToursFor(c), ...combinedToursCovering(c)].filter((t) => t.type !== 'group').map((t) => expectedFor(t.slug).card).concat(primaryToursFor(c).filter((t) => t.type === 'group').map((t) => expectedFor(t.slug).card)),
    label: `${c} hub`,
  })),
]
const hubResults = {}
for (const lang of LANGS) {
  for (const h of hubPaths(lang)) {
    const { status, html } = await getHtml(h.path)
    stats.pagesChecked++
    hubResults[h.label] = hubResults[h.label] || { pages: 0, ok: true }
    hubResults[h.label].pages++
    if (status !== 200) { bad(h.path, `HTTP ${status}`); hubResults[h.label].ok = false; continue }
    const visible = textOf(html)
    if (/€/.test(visible)) { euroPages++; hubResults[h.label].ok = false; bad(h.path, `euro sign in visible text: "${(visible.match(/.{0,30}€.{0,30}/) || [''])[0].replace(/\s+/g, ' ')}"`) }
    if (/"priceCurrency"\s*:\s*"EUR"/.test(html)) { hubResults[h.label].ok = false; bad(h.path, 'priceCurrency EUR in JSON-LD') }
    const amounts = usdAmountsIn(visible)
    for (const v of new Set(h.expect.filter(Boolean))) {
      stats.visibleChecks++
      if (!amounts.has(v)) { hubResults[h.label].ok = false; bad(h.path, `card price ${fmt(v)} not found`) }
    }
  }
}

console.log(`PAGES (${LIVE ? 'LIVE' : 'dist'}): ${stats.pagesChecked} pages, ${stats.offersChecked} priced offers, ${stats.visibleChecks} visible-price checks`)
console.log(`  pages with a euro sign: ${euroPages}   cross-locale signature mismatches: ${crossLocale}   tour pages with a missing visible price: ${new Set(liveMismatch).size}`)
for (const [label, r] of Object.entries(hubResults)) console.log(`  ${label}: ${r.ok ? 'PASS' : 'FAIL'} (${r.pages} locale pages)`)
finish()

function finish() {
  if (problems.length) {
    console.error(`\n${problems.length} PROBLEM(S):`)
    for (const p of problems.slice(0, 80)) console.error('  ' + p)
    if (problems.length > 80) console.error(`  … and ${problems.length - 80} more`)
    process.exit(1)
  }
  console.log('\nALL PRICE CHECKS PASSED — 0 mismatches.')
  process.exit(0)
}
