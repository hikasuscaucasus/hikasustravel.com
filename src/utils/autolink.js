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
 *   - Ambiguous names (one string -> more than one entity) are left unlinked,
 *     EXCEPT a name shared by entities in different countries (Tbilisi's and
 *     Baku's "Ateshgah Fire Temple"): that one is resolved by the country the
 *     surrounding text is about (see countryContext), and left unlinked when
 *     the text gives no single country.
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
import { regions, cities, sites, regionPath, cityPath, sitePath, countryOf, countryOfSite } from '../data/places'
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

// Verified alternate names/spellings for a published entity's canonical
// registry `name` — every one of these is copied from real, already-existing
// wording found elsewhere in the site's own content (tours, guides, blogs),
// never an invented translation or a generic word. Kept separate from
// `variants()` because these aren't mechanical normalisations of one string;
// each is a distinct proper-noun form that a different page happens to use
// for the same real-world place. Deliberately excludes bare generic/ambiguous
// forms ("Cascade", "Old City", "Khan's Palace" without "Sheki", "Sameba",
// "Opera") per the same ambiguity rule the rest of the linker already follows
// — see the ambiguity-collapse below, which still applies to every alias.
const ALIASES = [
  ['Peace Bridge', 'place:bridge-of-peace'],
  ['Echmiadzin', 'city:etchmiadzin'],
  ['Stepantsminda', 'city:kazbegi'],
  ['Zvartnots Cathedral', 'place:zvartnots-temple'],
  ['Walled City of Baku', 'place:icherisheher'],
  ['Heydar Aliyev Centre', 'place:heydar-aliyev-center'],
  ['Ananuri Architectural Complex', 'place:ananuri-fortress'],
  ['Khor Virap', 'place:khor-virap-monastery'],
  ['Sevanavank', 'place:sevanavank-monastery'],
  ['Haghpat', 'place:haghpat-monastery'],
  ['Tatev', 'place:tatev-monastery'],
  ['Noravank', 'place:noravank-monastery'],
  ['Geghard', 'place:geghard-monastery'],
  ['Gergeti Trinity', 'place:gergeti-trinity-church'],
  ['Yerevan Cascade', 'place:cascade-monument'],
  ["Sheki Khan's Palace", 'place:palace-of-the-sheki-khans'],
  ["Sheki's Khan's Palace", 'place:palace-of-the-sheki-khans'],
  // The district's bare name — the registry name is 'Abanotubani Sulfur Baths', so the
  // far more common bare form never matched (and non-EN bodies have no curated
  // localized place name at all). 'Abanotubani' is the same proper noun in all 7
  // locales' own content (sitewide internal-link audit, 2026-10-10).
  ['Abanotubani', 'place:abanotubani-sulfur-baths'],
]

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
  const raw = [] // { name, url, key, country }
  const keyToUrl = new Map()
  const keyToCountry = new Map()

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
    keyToUrl.set(key, url)
    const country = countryOf(r)
    keyToCountry.set(key, country)
    const names = new Set([r.name])
    if (lang !== 'en') {
      const loc = localizedName(regionItems, r.slug)
      if (loc) names.add(loc)
    }
    for (const nm of names) for (const v of variants(nm, lang)) raw.push({ name: v, url, key, country })
  }

  for (const c of cities) {
    if (!c.published) continue
    const url = cityPath(c.slug)
    const key = `city:${c.slug}`
    keyToUrl.set(key, url)
    const country = countryOf(c)
    keyToCountry.set(key, country)
    // EN uses the registry name; other languages use the verified localized name
    // (falling back to the registry proper noun for the few cities without one —
    // these are transliterated proper nouns, not invented translations).
    const display = lang === 'en' ? c.name : (localizedName(cityItems, c.slug) || c.name)
    for (const v of variants(display, lang)) raw.push({ name: v, url, key, country })
  }

  for (const s of sites) {
    if (!s.published) continue
    const url = sitePath(s)
    const key = `place:${s.slug}`
    keyToUrl.set(key, url)
    const country = countryOfSite(s)
    keyToCountry.set(key, country)
    // EN uses the registry name; other languages link ONLY places that have a
    // verified curated localized name (no invented translations for the rest).
    const display = lang === 'en' ? s.name : localizedName(placeItems, s.slug)
    if (!display) continue
    for (const v of variants(display, lang)) raw.push({ name: v, url, key, country })
  }

  // Verified alias forms (see ALIASES above). Applied for every language: each
  // one is a proper noun already confirmed present, as-is, in this locale's own
  // content, not a translation — so there is nothing to invent. A target whose
  // entity was filtered out above (unpublished, or a region with `noAutolink`)
  // has no entry in `keyToUrl` and is silently skipped.
  for (const [name, key] of ALIASES) {
    const url = keyToUrl.get(key)
    if (url) raw.push({ name, url, key, country: keyToCountry.get(key) })
  }

  // Collapse + drop ambiguous names (same string -> multiple distinct URLs).
  // The one exception is a name whose candidates sit in DIFFERENT countries,
  // one per country: it is kept as a contextual entry, resolved per body by
  // countryContext(). Grouping ignores a leading English "The", so "The
  // Ateshgah Fire Temple" (Tbilisi's registry name) cannot slip through as an
  // unambiguous Tbilisi link while "Ateshgah Fire Temple" is ambiguous.
  const norm = (n) => (lang === 'en' ? n.toLowerCase().replace(/^the\s+/, '') : n.toLowerCase())
  const byLower = new Map()
  const byNorm = new Map()
  for (const e of raw) {
    const lc = e.name.toLowerCase()
    const cur = byLower.get(lc)
    if (!cur) byLower.set(lc, { ...e, urls: new Set([e.url]) })
    else cur.urls.add(e.url)
    const nk = norm(e.name)
    if (!byNorm.has(nk)) byNorm.set(nk, new Map())
    byNorm.get(nk).set(e.url, e)
  }
  const crossCountry = (cands) => {
    if (cands.size < 2) return null
    const perCountry = {}
    for (const c of cands.values()) {
      if (!c.country || perCountry[c.country]) return null // same-country clash: stays ambiguous
      perCountry[c.country] = { url: c.url, key: c.key }
    }
    return perCountry
  }
  const accepted = []
  for (const [lc, e] of byLower) {
    const contextual = crossCountry(byNorm.get(norm(e.name)))
    if (contextual) accepted.push({ name: e.name, url: null, key: null, contextual })
    else if (e.urls.size === 1) accepted.push({ name: e.name, url: e.url, key: e.key, country: e.country })
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

/**
 * The single country a body is about, or null. Read from the unambiguous
 * entity mentions in it plus any entity links already written into the markup
 * (hand-placed anchors carry data-internal="/<country>/..."). Mixed or absent
 * evidence yields null, which leaves a contextual name unlinked rather than
 * guessing.
 */
export function countryContext(ents, anchorPaths = []) {
  const found = new Set()
  for (const e of ents) if (e.country) found.add(e.country)
  for (const p of anchorPaths) {
    const seg = (p || '').split('/')[1]
    if (seg && KNOWN_COUNTRIES.has(seg)) found.add(seg)
  }
  return found.size === 1 ? [...found][0] : null
}

/** A matched index entry as a concrete { url, key } for the given context, or null. */
export function resolveEntity(ent, ctx) {
  if (!ent.contextual) return ent
  return (ctx && ent.contextual[ctx]) || null
}

const KNOWN_COUNTRIES = new Set([...regions, ...cities].map((r) => countryOf(r)))

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
  const anchorPaths = [...doc.body.querySelectorAll('a[data-internal]')].map((a) => a.getAttribute('data-internal'))
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

  // Country context for contextual names, from the whole body.
  const plain = []
  for (const tn of targets) {
    regex.lastIndex = 0
    let pm
    while ((pm = regex.exec(tn.nodeValue))) {
      const pe = byName.get(pm[0].toLowerCase())
      if (pe && !pe.contextual) plain.push(pe)
    }
  }
  const ctx = countryContext(plain, anchorPaths)

  for (const tn of targets) {
    const text = tn.nodeValue
    regex.lastIndex = 0
    let m
    let last = 0
    let frag = null
    while ((m = regex.exec(text))) {
      const matched = m[0]
      const ent = resolveEntity(byName.get(matched.toLowerCase()) || { contextual: {} }, ctx)
      if (!ent || excluded.has(ent.key)) continue // unknown casing, unresolved context, self-link or opted-out: leave as text
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
