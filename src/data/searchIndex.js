/**
 * Locale-aware search index for the global site search.
 *
 * DERIVED, not generated: every field comes from data the app has already
 * downloaded — seoData.js (localized title/description/keywords for every
 * `seoKey`, statically imported by ~28 page components), places.js / tours.js /
 * blogData.js / borders.js (the route registries), plus the active locale's
 * pages.json and ui.json. Nothing is fetched and no bytes are duplicated, so
 * the index can never drift out of sync with the pages it points at.
 *
 * Built once per locale on first use and memoised. ~390 records; the build is
 * a few milliseconds.
 *
 * URLs are emitted already language-prefixed (`/de/georgia/tbilisi`), always
 * from the canonical path builders in places.js — never from a legacy or
 * redirect-only URL, and never from an unpublished page.
 */

import {
  regions, cities, sites,
  regionPath, cityPath, sitePath, thingsToDoPath, siteLocation,
  destinationsBase, regionsHubPath, citiesHubPath, placesHubPath,
  armeniaBase, armeniaRegionsHubPath,
} from './places.js'
import { tours } from './tours.js'
import { blogArticles } from './blogData.js'
import { publishedBorderPages } from './borders.js'
import { getSEO } from './seoData.js'
import { normalize } from '../utils/searchRank.js'

/**
 * Trim a marketing SEO title down to a card-sized name, e.g.
 * "Ujarma Fortress: royal stronghold on the Iori" -> "Ujarma Fortress" and
 * "Shuttle Service in Georgia – Prices & Routes" -> "Shuttle Service in Georgia".
 * Mirrors DestinationHub.jsx's seoCardName, plus the spaced dash used by the
 * static pages. Only SPACED dashes are cut, so "Gergeti-Dreifaltigkeitskirche"
 * survives intact.
 */
const seoCardName = (title) => (title || '')
  .split(/\s+[–—-]\s+/)[0]
  .split(/[|:]/)[0]
  .split(',')[0]
  .trim()

/** t() returns the key itself when a translation is missing — same helper the blog uses. */
const tf = (t, key, fallback) => {
  if (!key) return fallback
  const val = t(key)
  return val === key ? fallback : val
}

// Static, non-registry pages. Mirrors scripts/prerender.js's seoPageMap, minus
// the entries the registries below already cover. Redirect-only URLs, the 404
// page and the generated /tours/<entity>-tours listings are deliberately absent.
const STATIC_PAGES = [
  { path: '', seoKey: 'home', type: 'info', titleKey: 'footer.home' },
  { path: 'about-us', seoKey: 'aboutUs', type: 'info' },
  { path: 'about-georgia', seoKey: 'aboutGeorgia', type: 'info' },
  { path: 'georgian-lari-currency-guide', seoKey: 'lariGuide', type: 'info' },
  { path: 'georgia-visa-entry-requirements', seoKey: 'visaGuide', type: 'info' },
  { path: 'languages-of-georgia', seoKey: 'languagesGuide', type: 'info' },
  { path: 'kutaisi-international-airport', seoKey: 'airportGuide', type: 'info' },
  { path: 'tbilisi-international-airport', seoKey: 'tbilisiAirportGuide', type: 'info' },
  { path: 'tbilisi-metro', seoKey: 'tbilisiMetro', type: 'info' },
  { path: 'tbilisi-railway-station', seoKey: 'tbilisiRailwayStation', type: 'info' },
  { path: 'abkhazia', seoKey: 'abkhazia', type: 'info' },
  { path: 'shuttle-service', seoKey: 'shuttle', type: 'info' },
  { path: 'embassies', seoKey: 'embassies', type: 'info' },
  { path: 'faq', seoKey: 'faq', type: 'info' },
  { path: 'contact', seoKey: 'contact', type: 'info' },
  { path: 'privacy-policy', seoKey: 'privacy', type: 'info' },
  { path: 'terms-and-conditions', seoKey: 'terms', type: 'info' },
  // Hubs
  { path: 'private-tours', seoKey: 'privateTours', type: 'tour' },
  { path: 'group-tours', seoKey: 'groupTours', type: 'tour' },
  { path: 'blog', seoKey: 'blog', type: 'blog' },
  { path: destinationsBase, seoKey: 'destinations', type: 'info' },
  { path: regionsHubPath, seoKey: 'destinationsRegions', type: 'info' },
  { path: citiesHubPath, seoKey: 'destinationsCities', type: 'info' },
  { path: placesHubPath, seoKey: 'destinationsPlaces', type: 'info' },
  { path: armeniaBase, seoKey: 'armenia', type: 'info' },
  { path: armeniaRegionsHubPath, seoKey: 'armeniaRegions', type: 'info' },
]

const clean = (p) => String(p || '').replace(/^\//, '')

// URL segments are always the English slug, which makes them a free
// cross-language alias: a German visitor typing "Tbilisi" still reaches the page
// titled "Tiflis", and "contact" still reaches "Kontakt".
//
// Container segments are dropped, but only when something follows them, so
// /georgia/regions/svaneti aliases as the exact word "svaneti" (and outranks
// pages that merely mention it) while the /georgia/regions hub itself keeps
// "regions" as its own alias. `georgia` alone prefixes ~250 paths, so leaving it
// in would make it match nearly everything.
const PATH_CONTAINERS = new Set(['georgia', 'armenia', 'regions'])
const pathAlias = (path) => {
  const segs = clean(path).split('/').filter(Boolean)
  return segs
    .filter((seg, i) => i === segs.length - 1 || !PATH_CONTAINERS.has(seg))
    .join(' ')
}

/** Drop repeated words so "tbilisi tbilisi" (slug + registry name) reads as an exact alias. */
const dedupeWords = (str) => [...new Set(str.split(' ').filter(Boolean))].join(' ')

/**
 * Turn a raw record into an index entry: attaches the language-prefixed URL,
 * the localized type label, and the pre-normalised haystacks the ranker reads.
 */
function makeEntry({ id, path, type, title, description, keywords, location, alias }, lang, typeLabel) {
  const t = (title || '').trim()
  return {
    id,
    url: `/${lang}${path ? `/${clean(path)}` : ''}`,
    type,
    typeLabel,
    title: t,
    description: (description || '').trim(),
    location: (location || '').trim(),
    nTitle: normalize(t),
    // The page's English identity: its URL slug words plus its registry name.
    nAlias: dedupeWords(normalize([pathAlias(path), alias].filter(Boolean).join(' '))),
    // The page's own slug, on its own. A page whose slug IS the query is the
    // page the visitor asked for: "kazbegi" must land on /georgia/kazbegi, not
    // on its "Things to Do in Kazbegi" guide, whose title happens to be a
    // stronger textual match.
    nSlug: normalize(clean(path).split('/').pop()),
    nDescription: normalize(description),
    nKeywords: normalize(keywords),
    nLocation: normalize(location),
    nType: normalize(typeLabel),
  }
}

/**
 * Build the index for one locale.
 *
 * @param {object}   opts
 * @param {string}   opts.lang              active locale code
 * @param {object}   opts.pages             locales/<lang>/pages.json (from I18nContext)
 * @param {Function} opts.t                 useT() translator for ui.json labels
 * @param {object?}  opts.tourTranslations  locales/<lang>/tours.json, when loaded
 * @returns {Array} index entries
 */
export function buildSearchIndex({ lang, pages = {}, t, tourTranslations = null }) {
  const entries = []
  const seen = new Set()

  const TYPE_LABELS = {
    tour: tf(t, 'search.typeTour', 'Tour'),
    region: tf(t, 'search.typeRegion', 'Region'),
    city: tf(t, 'search.typeCity', 'City'),
    place: tf(t, 'search.typePlace', 'Place to Visit'),
    guide: tf(t, 'search.typeGuide', 'Things to Do'),
    blog: tf(t, 'search.typeBlog', 'Blog'),
    info: tf(t, 'search.typeInfo', 'Travel Info'),
  }

  const push = (record) => {
    const path = clean(record.path)
    if (seen.has(path)) return
    if (!record.title) return
    seen.add(path)
    entries.push(makeEntry({ ...record, path }, lang, TYPE_LABELS[record.type]))
  }

  // Localized short names, exactly as the Destinations hubs resolve them:
  // curated pages.json entry first, then the per-language SEO title trimmed to
  // a card name (non-English only, so English keeps its house-style name),
  // then the registry name.
  // Region card names/descriptions come from whichever regions hub owns the
  // region — Georgia's or Armenia's. Region slugs are unique across countries,
  // so merging the two maps can't collide, and Georgia's entries are unchanged.
  const regionItems = { ...(pages.destinationsRegions?.items || {}), ...(pages.armeniaRegions?.items || {}) }
  const cityItems = pages.destinationsCities?.items || {}
  const placeItems = pages.destinationsPlaces?.items || {}

  const nameFor = (items, slug, seoKey, fallbackName) => {
    const curated = items[slug]?.name
    if (curated) return curated
    if (lang !== 'en' && seoKey) {
      const derived = seoCardName(getSEO(seoKey, lang).title)
      if (derived) return derived
    }
    return fallbackName
  }
  const descFor = (items, slug, seoKey) =>
    items[slug]?.description || (seoKey ? getSEO(seoKey, lang).description : '')

  // Localized labels for the secondary location line ("Mestia · Svaneti").
  const regionBySlug = new Map(regions.map((r) => [r.slug, r]))
  const cityBySlug = new Map(cities.map((c) => [c.slug, c]))
  const regionLabel = (slug) => {
    const r = slug && regionBySlug.get(slug)
    return r ? nameFor(regionItems, slug, r.seoKey, r.name) : ''
  }
  const cityLabel = (slug) => {
    const c = slug && cityBySlug.get(slug)
    return c ? nameFor(cityItems, slug, c.seoKey, c.name) : ''
  }

  // --- Static pages + hubs ---------------------------------------------------
  for (const p of STATIC_PAGES) {
    const seo = getSEO(p.seoKey, lang)
    push({
      id: `static:${p.path}`,
      path: p.path,
      type: p.type,
      title: tf(t, p.titleKey, seoCardName(seo.title)),
      description: seo.description,
      keywords: seo.keywords,
    })
  }

  // --- Regions ---------------------------------------------------------------
  for (const r of regions) {
    if (!r.published) continue
    push({
      id: `region:${r.slug}`,
      path: regionPath(r.slug),
      type: 'region',
      title: nameFor(regionItems, r.slug, r.seoKey, r.name),
      description: descFor(regionItems, r.slug, r.seoKey),
      keywords: r.seoKey ? getSEO(r.seoKey, lang).keywords : '',
      alias: r.name,
    })
  }

  // --- Cities ----------------------------------------------------------------
  for (const c of cities) {
    if (!c.published) continue
    // A handful of registry "cities" are really places to visit (classifyAs)
    // and are listed on the Places hub — label them the way the site does.
    const isPlace = c.classifyAs === 'place'
    const items = isPlace ? placeItems : cityItems
    push({
      id: `city:${c.slug}`,
      path: cityPath(c.slug),
      type: isPlace ? 'place' : 'city',
      title: nameFor(items, c.slug, c.seoKey, c.name),
      description: descFor(items, c.slug, c.seoKey),
      keywords: c.seoKey ? getSEO(c.seoKey, lang).keywords : '',
      alias: c.name,
      location: regionLabel(isPlace ? (c.placeLocation?.regionId || c.region) : c.region),
    })
  }

  // --- Tourist sites (Places to Visit) --------------------------------------
  for (const s of sites) {
    if (!s.published) continue
    const loc = siteLocation(s)
    const location = [cityLabel(loc.cityId), regionLabel(loc.regionId)].filter(Boolean).join(' · ')
    push({
      id: `site:${s.slug}`,
      path: sitePath(s),
      type: 'place',
      title: nameFor(placeItems, s.slug, s.seoKey, s.name),
      description: descFor(placeItems, s.slug, s.seoKey),
      keywords: s.seoKey ? getSEO(s.seoKey, lang).keywords : '',
      alias: s.name,
      location,
    })
  }

  // --- "Things to do in <place>" guides -------------------------------------
  for (const p of [...cities, ...regions]) {
    if (!p.published || !p.thingsToDo) continue
    const seo = getSEO(p.thingsToDo.seoKey, lang)
    const isRegion = regions.includes(p)
    push({
      id: `ttd:${p.slug}`,
      path: thingsToDoPath(p.slug),
      type: 'guide',
      title: seoCardName(seo.title),
      description: seo.description,
      // The curated attraction list is real, useful search text (English proper
      // names, which travellers type in any language).
      keywords: [seo.keywords, (p.thingsToDo.attractions || []).join(', ')].filter(Boolean).join(', '),
      alias: p.name,
      location: isRegion ? regionLabel(p.slug) : cityLabel(p.slug),
    })
  }

  // --- Border crossings ------------------------------------------------------
  for (const b of publishedBorderPages()) {
    const seo = getSEO(b.seoKey, lang)
    push({
      id: `border:${b.path}`,
      path: b.path,
      type: 'info',
      title: seoCardName(seo.title),
      description: seo.description,
      keywords: seo.keywords,
    })
  }

  // --- Tours -----------------------------------------------------------------
  for (const tour of tours) {
    const tt = tourTranslations?.[tour.slug]
    const prefix = tour.type === 'group' ? 'group-tours' : 'private-tours'
    // Places the tour visits — structured, and strong search signal
    // ("Kazbegi" should surface the tours that go there).
    const markers = (tour.map?.markers || []).map((m) => m.title).filter(Boolean)
    push({
      id: `tour:${tour.slug}`,
      path: `${prefix}/${tour.slug}`,
      type: 'tour',
      title: tt?.title || tour.title,
      description: tt?.listingDescription || tt?.description || tour.listingDescription || tour.description,
      keywords: [markers.join(', '), tour.days ? `${tour.days}` : ''].filter(Boolean).join(', '),
      alias: tour.title,
    })
  }

  // --- Blog articles ---------------------------------------------------------
  for (const a of blogArticles) {
    push({
      id: `blog:${a.slug}`,
      path: `blog/${a.slug}`,
      type: 'blog',
      title: tf(t, a.titleKey, a.title),
      description: tf(t, a.descKey, a.excerpt),
      keywords: (a.tags || []).join(', '),
      alias: a.title,
    })
  }

  return entries
}

// Memoise per locale. `hasTours` is part of the key because the index is built
// once before tours.json has loaded (English tour titles) and once after, and
// both variants must be cacheable rather than fighting each other.
const cache = new Map()

export function getSearchIndex({ lang, pages, t, tourTranslations }) {
  const key = `${lang}|${tourTranslations ? 'tt' : 'raw'}`
  let index = cache.get(key)
  if (!index) {
    index = buildSearchIndex({ lang, pages, t, tourTranslations })
    cache.set(key, index)
  }
  return index
}
