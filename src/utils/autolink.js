/**
 * Comprehensive internal-link auto-linker for destination entities.
 *
 * Wraps every visible mention of a published Region, City or Place to Visit in
 * the editorial body content with a link to that entity's canonical, same-
 * language page. Only regions with a published detail page are linked; regions
 * are matched by both their localized name and their Latin/English form.
 *
 * Matching rules (see the task spec):
 *   - Longest entity name wins (alternation is sorted longest-first).
 *   - Whole-name, Unicode-aware word boundaries (accents/hyphens/apostrophes OK).
 *   - Case-insensitive; every occurrence is linked, not just the first.
 *   - Generic tails ("museum", "fortress", …) are never linked on their own.
 *   - Ambiguous names (one string -> more than one entity) are left unlinked.
 *   - English links all entities; other languages link only entities that have a
 *     verified localized name (all cities + the curated places), never an
 *     invented translation.
 *
 * Implementation safety: the content HTML is parsed with a DOMParser and only
 * TEXT NODES are processed (never attributes/URLs/code), so no nested <a>
 * elements or broken markup can be produced.
 *
 * This runs at build time as well as in the browser — the parser comes from the
 * `@dom` alias, which resolves to happy-dom in the SSR build (see
 * vite.config.js). It used to be a no-op without `window`, which put the entity
 * links in the browser's render but not in the prerendered HTML; React does not
 * patch a dangerouslySetInnerHTML mismatch, so it kept the link-free server
 * markup and the links vanished from the page entirely.
 */
import { regions, cities, sites, regionPath, cityPath, sitePath } from '../data/places'
import { domApi } from '@dom'

// Generic words that must never become a link by themselves.
const GENERIC = new Set([
  'museum', 'fortress', 'monastery', 'cathedral', 'church', 'park', 'lake',
  'waterfall', 'canyon', 'valley', 'mountain', 'mountains', 'bridge', 'tower',
  'square', 'street', 'avenue', 'garden', 'gardens', 'cave', 'caves', 'palace',
  'beach', 'sea', 'river', 'fort', 'castle', 'temple', 'synagogue', 'mosque',
  'pillar', 'pillars', 'reserve', 'resort', 'village', 'old town', 'national park',
])

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Derive conservative name variants — NOT invented spellings, only safe
// normalisations: drop a trailing "(gloss)" and a leading English article.
function variants(name, lang) {
  const out = new Set()
  const base = name.trim()
  if (base) out.add(base)
  const noParen = base.replace(/\s*\([^)]*\)\s*$/, '').trim()
  if (noParen) out.add(noParen)
  if (lang === 'en') {
    for (const v of [...out]) {
      const noThe = v.replace(/^the\s+/i, '').trim()
      if (noThe) out.add(noThe)
    }
  }
  return [...out].filter((v) => v.length >= 4 && !GENERIC.has(v.toLowerCase()))
}

function localizedName(items, slug) {
  const it = items && items[slug]
  return it && it.name ? it.name : null
}

// Build the per-language match index: every accepted name string mapped to its
// single canonical entity. Names that resolve to more than one entity are
// dropped (ambiguous -> left unlinked, by design).
function buildIndex(lang, pages) {
  const regionItems = (pages && pages.destinationsRegions && pages.destinationsRegions.items) || {}
  const cityItems = (pages && pages.destinationsCities && pages.destinationsCities.items) || {}
  const placeItems = (pages && pages.destinationsPlaces && pages.destinationsPlaces.items) || {}
  const raw = [] // { name, url, key }

  // Published regions are auto-linked to their canonical detail page
  // (/georgia/regions/<slug>). For non-English, we match BOTH the localized
  // region name (e.g. de "Imeretien", fr "Iméréthie") AND the Latin/English
  // transliteration (e.g. "Imereti"): the published region content mixes both
  // forms across locales, and both resolve to the SAME same-language region URL,
  // so matching both catches every mention without inventing a translation.
  // (A region whose Latin form collides with a city/place name is dropped by the
  // ambiguity check below — never mislinked.)
  for (const r of regions) {
    if (!r.published || r.noAutolink) continue
    const url = regionPath(r.slug)
    const key = `region:${r.slug}`
    const names = new Set([r.name])
    if (lang !== 'en') {
      const loc = localizedName(regionItems, r.slug)
      if (loc) names.add(loc)
    }
    for (const nm of names) for (const v of variants(nm, lang)) raw.push({ name: v, url, key })
  }

  for (const c of cities) {
    if (!c.published) continue
    const url = cityPath(c.slug)
    const key = `city:${c.slug}`
    // EN uses the registry name; other languages use the verified localized name
    // (falling back to the registry proper noun for the few cities without one —
    // these are transliterated proper nouns, not invented translations).
    const display = lang === 'en' ? c.name : (localizedName(cityItems, c.slug) || c.name)
    for (const v of variants(display, lang)) raw.push({ name: v, url, key })
  }

  for (const s of sites) {
    if (!s.published) continue
    const url = sitePath(s)
    const key = `place:${s.slug}`
    // EN uses the registry name; other languages link ONLY places that have a
    // verified curated localized name (no invented translations for the rest).
    const display = lang === 'en' ? s.name : localizedName(placeItems, s.slug)
    if (!display) continue
    for (const v of variants(display, lang)) raw.push({ name: v, url, key })
  }

  // Collapse + drop ambiguous names (same string -> multiple distinct URLs).
  const byLower = new Map()
  for (const e of raw) {
    const lc = e.name.toLowerCase()
    const cur = byLower.get(lc)
    if (!cur) byLower.set(lc, { ...e, urls: new Set([e.url]) })
    else cur.urls.add(e.url)
  }
  const accepted = []
  for (const [, e] of byLower) {
    if (e.urls.size === 1) accepted.push({ name: e.name, url: e.url, key: e.key })
  }
  // Longest first so longer entity names win over shorter ones they contain.
  accepted.sort((a, b) => b.name.length - a.name.length)

  const byName = new Map(accepted.map((e) => [e.name.toLowerCase(), e]))
  const pattern = accepted.map((e) => escapeRe(e.name)).join('|')
  let regex = null
  if (pattern) {
    // Prefer Unicode-aware boundaries (handles accents/digits next to a name).
    // Fall back to ASCII \b boundaries on engines without lookbehind (older
    // Safari), so the linker degrades gracefully instead of throwing.
    try {
      regex = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${pattern})(?![\\p{L}\\p{N}_])`, 'giu')
    } catch {
      try { regex = new RegExp(`\\b(?:${pattern})\\b`, 'gi') } catch { regex = null }
    }
  }
  return { accepted, byName, regex }
}

// Per-language index cache (registry + localized names are stable per language).
const indexCache = new Map()
export function getIndex(lang, pages) {
  if (indexCache.has(lang)) return indexCache.get(lang)
  const idx = buildIndex(lang, pages)
  // Only cache once we actually have names (pages may be momentarily empty).
  if (idx.regex) indexCache.set(lang, idx)
  return idx
}

const SKIP_TAGS = new Set(['A', 'CODE', 'PRE', 'SCRIPT', 'STYLE', 'BUTTON', 'TEXTAREA'])

/**
 * Return `html` with every eligible entity mention wrapped in an internal link.
 * @param {string} html        content HTML string
 * @param {string} lang        current language code
 * @param {object} pages       loaded pages.json for the current language
 * @param {string|string[]} [excludeKey] entity key(s) that must NOT be linked in
 *   this body. Normally just the current page's own key (e.g.
 *   "place:bodbe-monastery") to avoid self-links. A page may also pass extra keys
 *   to suppress a mention that is a NAME COLLISION rather than a real reference —
 *   e.g. the Batumi Dolphinarium sits on Batumi's own Rustaveli Avenue, which is a
 *   different street from the Tbilisi avenue that owns the entity, so linking it
 *   would send the reader to the wrong city (see `noAutolinkKeys` in places.js).
 */
export function autolinkHtml(html, lang, pages, excludeKey) {
  const dom = domApi()
  if (!dom) return html
  if (!html || html.indexOf('<') === -1) return html
  try {
    return linkHtml(html, lang, pages, excludeKey, dom)
  } catch {
    // Never let linking break content rendering — fall back to the original HTML.
    return html
  }
}

function linkHtml(html, lang, pages, excludeKey, dom) {
  const { byName, regex } = getIndex(lang, pages)
  if (!regex) return html
  // `excludeKey` accepts a single key (the historical shape) or an array; empty
  // and undefined both mean "exclude nothing", so every existing caller is
  // unchanged.
  const excluded = new Set(
    Array.isArray(excludeKey) ? excludeKey.filter(Boolean) : (excludeKey ? [excludeKey] : []),
  )

  const doc = new dom.DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')
  const walker = doc.createTreeWalker(doc.body, dom.SHOW_TEXT)
  const targets = []
  let node
  while ((node = walker.nextNode())) {
    if (!node.nodeValue || !/\S/.test(node.nodeValue)) continue
    let p = node.parentNode
    let skip = false
    while (p && p !== doc.body) {
      if (SKIP_TAGS.has(p.nodeName)) { skip = true; break }
      p = p.parentNode
    }
    if (!skip) targets.push(node)
  }

  for (const tn of targets) {
    const text = tn.nodeValue
    regex.lastIndex = 0
    let m
    let last = 0
    let frag = null
    while ((m = regex.exec(text))) {
      const matched = m[0]
      const ent = byName.get(matched.toLowerCase())
      if (!ent || excluded.has(ent.key)) continue // unknown casing, self-link or opted-out: leave as text
      if (!frag) frag = doc.createDocumentFragment()
      if (m.index > last) frag.appendChild(doc.createTextNode(text.slice(last, m.index)))
      const a = doc.createElement('a')
      a.setAttribute('href', `/${lang}${ent.url}`)
      a.setAttribute('data-internal', ent.url)
      a.className = 'entity-link'
      a.textContent = matched
      frag.appendChild(a)
      last = m.index + matched.length
    }
    if (frag) {
      if (last < text.length) frag.appendChild(doc.createTextNode(text.slice(last)))
      tn.parentNode.replaceChild(frag, tn)
    }
  }
  return doc.body.innerHTML
}
