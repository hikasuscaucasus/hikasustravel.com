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
 *   6. A heading level skipped (h2 -> h4). The footer's four column titles
 *      were <h4> while every page's own sections were <h2>, so one shared
 *      component put a gap in the outline of 2,716 pages.
 *   7. A same-page #anchor with no matching id — the tour section nav is
 *      nothing but such links, and a renamed section id makes one dead.
 *   8. A referenced /images/… file that is not on disk. Two blur-up
 *      placeholders 404'd on every homepage visit for want of a thumb twin;
 *      nothing showed, because the full image arrives a moment later.
 *   9. An invisible character (zero-width space, soft hyphen, BOM, a
 *      bidi control) in visible text, in a speaking attribute, or in a
 *      tel:/mailto: href. These survive review because nothing shows: a
 *      zero-width space sat inside the Contact page's tel: number, where it
 *      was part of the dial string, and nine soft hyphens sat inside single
 *      Dutch, Czech and Polish words, breaking find-in-page and copy-paste.
 *  10. An ImageObject without an absolute contentUrl, or without `license` /
 *      `acquireLicensePage` (Google Image Metadata). Search Console flagged
 *      "Missing field acquireLicensePage" on every one of 2,570 nodes, because
 *      none of the ten node builders set it; the two JSON-LD sinks now fill
 *      the fields, and each own-site URL they point at must exist in dist.
 *  11. Tour pricing currency. Tour sales prices are canonical USD (October
 *      2026 migration, scripts/pricing/): every Offer / AggregateOffer in any
 *      graph must say priceCurrency "USD", and no tour, tour-hub or home page
 *      may show a euro sign in visible text. A "€" or an EUR offer on one of
 *      those pages means a price surface bypassed pricingUtils.js.
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

// Check 10 (Image Metadata): every ImageObject, wherever it sits in a graph.
const SITE_URL = 'https://www.hikasustravel.com'
const ABS_HTTPS = /^https:\/\/[^\s"]+$/
function imageObjectsIn(node, out = []) {
  if (Array.isArray(node)) { for (const n of node) imageObjectsIn(n, out); return out }
  if (!node || typeof node !== 'object') return out
  const t = node['@type']
  if (t === 'ImageObject' || (Array.isArray(t) && t.includes('ImageObject'))) out.push(node)
  for (const v of Object.values(node)) imageObjectsIn(v, out)
  return out
}
let imageObjects = 0
// Check 11 (tour pricing): every node carrying a price, wherever it sits.
function offersIn(node, out = []) {
  if (Array.isArray(node)) { for (const n of node) offersIn(n, out); return out }
  if (!node || typeof node !== 'object') return out
  const t = node['@type']
  const isOffer = t === 'Offer' || t === 'AggregateOffer' || (Array.isArray(t) && (t.includes('Offer') || t.includes('AggregateOffer')))
  if (isOffer || node.price !== undefined || node.lowPrice !== undefined || node.highPrice !== undefined) out.push(node)
  for (const v of Object.values(node)) offersIn(v, out)
  return out
}
// Pages whose visible text must carry tour prices in USD only (the shuttle
// page quotes its own transfer tariff and the blog quotes local costs, so the
// euro check is scoped to the tour sales surfaces).
const TOUR_PRICE_PAGE = /[\\/](?:private-tours|group-tours|tours)[\\/]|[\\/]dist[\\/][a-z]{2}[\\/]index\.html$/
let offerNodes = 0

// Own-site license / acquireLicensePage URLs seen; each must be a page in dist.
const licensePages = new Set()

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name === 'index.html') out.push(full)
  }
  return out
}

const rel = (f) => path.relative(DIST, f).split(path.sep).join('/')

// Zero-width and formatting characters that render as nothing. Deliberately
// excludes U+00A0 (a non-breaking space is visible and often intentional).
const INVISIBLE_RE = /[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD]/

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
// Every /images/… URL any page references, collected once and resolved at the end.
const imageRefs = new Set()

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

  // --- 9. invisible characters ------------------------------------------
  // Reuses the same `visible` set as check 1 — text a person reads plus the
  // attributes that speak — and adds the hrefs a device acts on, because a
  // zero-width space in a tel: URI is dialled, not displayed.
  const speaking = []
  $('a[href^="tel:"], a[href^="mailto:"]').each((_, el) => {
    const v = $(el).attr('href')
    if (v) speaking.push(v)
  })
  for (const text of visible.concat(speaking)) {
    const m = text.match(INVISIBLE_RE)
    if (m) {
      const cp = 'U+' + m[0].codePointAt(0).toString(16).toUpperCase()
      add(file, 'invisible-char', `${cp} in "${text.trim().slice(0, 90)}"`)
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
    let data
    try {
      data = JSON.parse(raw)
    } catch (e) {
      add(file, 'jsonld-parse', `${e.message} — ${raw.slice(0, 80)}`)
      return
    }
    // --- 10. Image Metadata completeness ----------------------------------
    // Google's image-license feature reads each ImageObject's contentUrl and
    // recommends `license` + `acquireLicensePage` on every node; Search
    // Console flagged "Missing field acquireLicensePage" on 2,570 nodes
    // because no builder set it. Both JSON-LD sinks now fill the fields from
    // utils/imageLicense.js, so a node without them means a sink was bypassed.
    for (const node of imageObjectsIn(data)) {
      imageObjects++
      const cu = node.contentUrl ?? node.url
      if (typeof cu !== 'string' || !ABS_HTTPS.test(cu)) add(file, 'imageobject-contenturl', String(cu))
      for (const key of ['acquireLicensePage', 'license']) {
        const v = node[key]
        if (v === undefined) add(file, `imageobject-no-${key.toLowerCase()}`, String(cu).split('/').pop())
        else if (typeof v !== 'string' || !ABS_HTTPS.test(v)) add(file, `imageobject-bad-${key.toLowerCase()}`, String(v))
        else if (v.startsWith(SITE_URL)) licensePages.add(v)
      }
    }
    // --- 11. tour offers are priced in USD ---------------------------------
    for (const node of offersIn(data)) {
      offerNodes++
      if (node.priceCurrency !== 'USD') add(file, 'offer-currency-not-usd', `${node['@type']} priceCurrency=${node.priceCurrency}`)
      for (const key of ['price', 'lowPrice', 'highPrice']) {
        if (node[key] === undefined) continue
        const n = Number(node[key])
        if (!Number.isInteger(n) || n <= 0 || n % 5 !== 0) add(file, 'offer-price-invalid', `${key}=${node[key]}`)
      }
    }
  })

  // --- 11b. no euro sign on a tour sales surface ---------------------------
  // The one sanctioned euro sign: the booking box ("How booking works", a
  // shared component) quotes the Terms & Conditions' deposit minimum, which is
  // contractually "€200 or the USD equivalent". It is a legal term, not a
  // sales price, so only text inside .td-bookinfo is exempt.
  const bookInfoText = new Set()
  $('.td-bookinfo').find('*').contents().each((_, node) => {
    if (node.type === 'text') bookInfoText.add(node.data)
  })
  const euroText = visible.filter((t) => /€/.test(t) && !bookInfoText.has(t))
  if (TOUR_PRICE_PAGE.test(file) && euroText.length > 0) {
    add(file, 'tour-page-euro-sign', euroText[0].replace(/\s+/g, ' ').slice(0, 80))
  }

  // --- 6. heading order ----------------------------------------------------
  // A heading level may repeat or go back up, but stepping DOWN by more than
  // one leaves a gap that assistive technology reports as a missing section.
  // The footer's four column titles were <h4> after each page's own <h2>, so
  // 2,716 of 2,765 pages shipped a skip from one shared component.
  const levels = []
  $('h1,h2,h3,h4,h5,h6').each((_, el) => levels.push(Number(el.tagName[1])))
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      add(file, 'heading-skip', `h${levels[i - 1]} -> h${levels[i]}`)
      break
    }
  }

  // --- 7. same-page anchors resolve ---------------------------------------
  // The tour section nav is a row of #hash links; a renamed section id turns
  // one of them into a control that scrolls nowhere.
  const ids = new Set()
  $('[id]').each((_, el) => ids.add($(el).attr('id')))
  $('a[href^="#"]').each((_, el) => {
    const id = decodeURIComponent(($(el).attr('href') || '').slice(1))
    if (id && !ids.has(id)) add(file, 'dead-anchor', `#${id}`)
  })

  // --- 8. every referenced image exists ------------------------------------
  // BlurUpBackground derives its placeholder by swapping /images/files/ for
  // /images/files-thumb/, so a cover with no thumb twin 404s on every visit —
  // invisibly, because the full image loads a moment later. Two shipped.
  $('img[src], source[srcset], img[srcset]').each((_, el) => {
    const raw = $(el).attr('src') || ''
    const set = $(el).attr('srcset') || ''
    const urls = [raw, ...set.split(',').map((s) => s.trim().split(/\s+/)[0])].filter((u) => u.startsWith('/images/'))
    for (const u of urls) imageRefs.add(u)
  })
  for (const m of html.matchAll(/\/images\/files-thumb\/[^"'()\s\\]+\.(?:webp|avif|jpg|jpeg|png)/gi)) {
    imageRefs.add(m[0])
  }
}

// --- 8b. resolve the collected image references against disk ---------------
// Done once at the end so each distinct URL is stat'ed a single time.
const PUBLIC = path.resolve('public')
for (const u of imageRefs) {
  let decoded
  try { decoded = decodeURIComponent(u) } catch { decoded = u }
  const relPath = decoded.replace(/^\//, '')
  if (!fs.existsSync(path.join(PUBLIC, relPath)) && !fs.existsSync(path.join(DIST, relPath))) {
    errors.push({ file: '(site-wide)', kind: 'missing-image', detail: u })
  }
}

// --- 10b. license / acquireLicensePage pages exist in the build ------------
for (const u of licensePages) {
  const rel = u.slice(SITE_URL.length).replace(/^\/|\/$/g, '')
  if (!fs.existsSync(path.join(DIST, rel, 'index.html'))) {
    errors.push({ file: '(site-wide)', kind: 'imageobject-license-page-missing', detail: u })
  }
}

// --- summary ---------------------------------------------------------------
const byKind = {}
for (const e of errors) (byKind[e.kind] ||= []).push(e)

console.log(`Audited ${files.length - stubs} prerendered pages (${stubs} redirect stubs skipped), ${jsonLdBlocks} JSON-LD blocks, ${imageObjects} ImageObjects (${licensePages.size} distinct own-site license page URL(s)), ${offerNodes} priced Offer nodes.`)
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
