/**
 * Static audit of the prerendered site.
 *
 * Runs over dist/**\/index.html — the HTML a crawler and a first-paint visitor
 * actually receive — and fails the build on defects that have shipped before:
 *
 *   1. Unresolved template tokens ({name}, {city}, {{name}}, …) in visible text.
 *      68 entity-tour pages x 7 locales once shipped "These private and group
 *      tours visit {name} as part of a wider route" because a t() call replaced
 *      only the first occurrence of a placeholder.
 *   2. More than one <main> landmark. Tour pages shipped three.
 *   3. Pages with no <h1>, or more than one.
 *   4. A missing canonical, <title>, or meta description.
 *   5. JSON-LD that does not parse.
 *
 * Deliberately NOT checked here: anything requiring a network request, and
 * anything inside the JS bundles — a token in a compiled string table is not a
 * defect, only a token a visitor can read is. So the scan looks at rendered
 * text nodes and attribute values, never at <script> contents.
 *
 * Usage:
 *   node scripts/audit-prerendered-html.js            # fails on any error
 *   node scripts/audit-prerendered-html.js --report   # prints, always exits 0
 */

import fs from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const DIST = path.resolve('dist')
const REPORT_ONLY = process.argv.includes('--report')

// Placeholders a visitor must never see. Kept narrow on purpose: `{` and `}`
// appear legitimately in prose (rarely) and constantly in inline JSON, so only
// these known interpolation names count as a failure.
const TOKENS = [
  'name', 'names', 'city', 'cities', 'region', 'regions',
  'location', 'destination', 'count', 'price', 'query', 'tour', 'from', 'to', 'n', 'min',
]
const TOKEN_RE = new RegExp(`\\{\\{?\\s*(${TOKENS.join('|')})\\s*\\}?\\}`, 'i')

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

const rel = (f) => path.relative(DIST, f).split(path.sep).join('/')

const errors = []
const add = (file, kind, detail) => errors.push({ file: rel(file), kind, detail })

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found — run the build first.')
  process.exit(1)
}

const files = walk(DIST)
if (files.length < 100) {
  // A scan that finds nothing may simply have scanned nothing.
  console.error(`Only ${files.length} pages found in dist/ — that is not a full build.`)
  process.exit(1)
}

let jsonLdBlocks = 0
let stubs = 0

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8')
  const $ = cheerio.load(html)

  // Legacy-URL redirect stubs: a meta refresh and nothing else. They have
  // no <main>, no <h1> and no description by design — the page a visitor
  // ends up on is the one that has to satisfy the checks below. Roughly
  // 1,600 of these ship (the /destinations tree x 7 locales).
  if ($('meta[http-equiv="refresh"]').length) {
    stubs++
    continue
  }

  // dist/index.html is the SPA shell at "/", whose only job is to send a
  // visitor to /en/. Its <main> and <h1> are produced by React on the
  // client, so it has neither in the file — by design, not by defect. Its
  // canonical already points at /en/.
  if (rel(file) === 'index.html') {
    stubs++
    continue
  }

  // --- 1. visitor-visible template tokens ---------------------------------
  // Text a person reads, plus the attributes that speak: alt, title, aria-label,
  // and the meta/OG values. Script and style contents are excluded.
  const visible = []
  $('body').find('*').not('script, style, noscript').contents().each((_, node) => {
    if (node.type === 'text' && node.data.trim()) visible.push(node.data)
  })
  $('[alt], [title], [aria-label], [placeholder]').each((_, el) => {
    for (const a of ['alt', 'title', 'aria-label', 'placeholder']) {
      const v = $(el).attr(a)
      if (v) visible.push(v)
    }
  })
  $('meta[name="description"], meta[property^="og:"], meta[name^="twitter:"]').each((_, el) => {
    const v = $(el).attr('content')
    if (v) visible.push(v)
  })
  const titleText = $('title').text()
  if (titleText) visible.push(titleText)

  for (const text of visible) {
    const m = text.match(TOKEN_RE)
    if (m) {
      add(file, 'template-token', `${m[0]} in "${text.trim().slice(0, 90)}"`)
      break
    }
  }

  // --- 2. landmarks --------------------------------------------------------
  const mains = $('main').length
  if (mains !== 1) add(file, 'main-count', String(mains))

  // --- 3. headings ---------------------------------------------------------
  const h1s = $('h1').length
  if (h1s !== 1) add(file, 'h1-count', String(h1s))

  // --- 4. head essentials --------------------------------------------------
  if (!$('link[rel="canonical"]').attr('href')) add(file, 'no-canonical', '')
  if (!titleText.trim()) add(file, 'no-title', '')
  if (!$('meta[name="description"]').attr('content')) add(file, 'no-description', '')

  // --- 5. structured data parses ------------------------------------------
  $('script[type="application/ld+json"]').each((_, el) => {
    jsonLdBlocks++
    const raw = $(el).contents().text()
    try {
      JSON.parse(raw)
    } catch (e) {
      add(file, 'jsonld-parse', `${e.message} — ${raw.slice(0, 80)}`)
    }
  })
}

// --- summary ---------------------------------------------------------------
const byKind = {}
for (const e of errors) (byKind[e.kind] ||= []).push(e)

console.log(`Audited ${files.length - stubs} prerendered pages (${stubs} redirect stubs skipped), ${jsonLdBlocks} JSON-LD blocks.`)
if (!errors.length) {
  console.log('No defects found.')
  process.exit(0)
}

for (const [kind, list] of Object.entries(byKind)) {
  console.log(`\n${kind}: ${list.length}`)
  for (const e of list.slice(0, 12)) console.log(`  ${e.file}${e.detail ? `  — ${e.detail}` : ''}`)
  if (list.length > 12) console.log(`  … and ${list.length - 12} more`)
}

console.log(`\n${errors.length} defect(s) total.`)
process.exit(REPORT_ONLY ? 0 : 1)
