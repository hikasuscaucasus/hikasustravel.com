/**
 * Crawlable link graph for the pre-rendered HTML.
 *
 * The site is a client-rendered SPA: scripts/prerender.js writes a correct
 * <head> for every route, but the body it ships is an empty <div id="root">.
 * That leaves the raw HTML with zero <a href> — so a crawler that does not
 * execute JavaScript can reach a page only via sitemap.xml, and no page passes
 * internal link equity to any other.
 *
 * This module derives, from the same registries the router and the sitemap use,
 * the set of links each route would naturally expose (its parent, its children,
 * its siblings, and its translations) and hands them to prerender.js, which
 * writes them INSIDE #root. React mounts with createRoot(), which clears the
 * container on first render, so the block is fallback content: present for
 * anything that does not run JS, gone the moment the app boots. Nothing is
 * hidden with CSS and no link is invented — every href is a route that the
 * router already serves and the sitemap already lists.
 *
 * Anchor text is the localized page title from the same pages.json the page
 * itself renders, so the block never introduces untranslated copy.
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = (p) => pathToFileURL(join(__dirname, '..', 'src', p)).href

const {
  regions, cities, sites, regionPath, cityPath, sitePath, thingsToDoPath,
  countryOf, countryOfSite, countryBase, regionsHubPathFor, citiesHubPathFor, placesHubPathFor,
  DEFAULT_COUNTRY,
} = await import(src('data/places.js'))
const { publishedBorderPages, borderHubPath } = await import(src('data/borders.js'))
const { entityTourPages } = await import(src('data/entityTours.js'))

// Native language names, used as the anchor text for the translation links.
const LANG_NAMES = {
  en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch',
  pl: 'Polski', cs: 'Čeština', nl: 'Nederlands',
}

// Static pages every locale ships, grouped so the home page can expose the
// whole top level and every inner page can point back at the relevant hub.
// Keys mirror scripts/prerender.js `seoPageMap`; values are seoData keys used
// only to read a localized title.
const STATIC_PAGES = [
  ['about-us', 'aboutUs'],
  ['about-georgia', 'aboutGeorgia'],
  ['georgia', 'destinations'],
  ['georgia/regions', 'destinationsRegions'],
  ['georgia/cities', 'destinationsCities'],
  ['georgia/places-to-visit', 'destinationsPlaces'],
  ['armenia', 'armenia'],
  ['armenia/regions', 'armeniaRegions'],
  ['armenia/cities', 'armeniaCities'],
  ['armenia/places-to-visit', 'armeniaPlaces'],
  ['azerbaijan', 'azerbaijan'],
  ['azerbaijan/regions', 'azerbaijanRegions'],
  ['azerbaijan/cities', 'azerbaijanCities'],
  ['azerbaijan/places-to-visit', 'azerbaijanPlaces'],
  ['private-tours', 'privateTours'],
  ['group-tours', 'groupTours'],
  ['shuttle-service', 'shuttle'],
  ['blog', 'blog'],
  ['embassies', 'embassies'],
  ['georgia-visa-entry-requirements', 'visaGuide'],
  ['armenia-visa-entry-requirements', 'armeniaVisaGuide'],
  ['azerbaijan-visa-entry-requirements', 'azerbaijanVisaGuide'],
  ['georgian-lari-currency-guide', 'lariGuide'],
  ['languages-of-georgia', 'languagesGuide'],
  ['tbilisi-international-airport', 'tbilisiAirportGuide'],
  ['kutaisi-international-airport', 'airportGuide'],
  ['tbilisi-metro', 'tbilisiMetro'],
  ['tbilisi-railway-station', 'tbilisiRailwayStation'],
  ['abkhazia', 'abkhazia'],
  ['faq', 'faq'],
  ['contact', 'contact'],
  ['privacy-policy', 'privacy'],
  ['terms-and-conditions', 'terms'],
]

const clean = (p) => String(p).replace(/^\/+|\/+$/g, '')

/**
 * Reduce an SEO <title> to the page name, for use as anchor text.
 * Titles follow "Name: subtitle | Hikasus Travel" or "Name – subtitle | brand";
 * everything from the first separator on is descriptive tail. The dash forms
 * require surrounding spaces so hyphenated names (Samtskhe-Javakheti,
 * Mtskheta-Mtianeti) survive intact.
 */
const shortTitle = (title) => {
  const head = String(title || '').split(/\s*\|\s*|\s*:\s*|\s+[–—-]\s+/)[0].trim()
  return head || String(title || '').trim()
}
const REGIONS_HUB = 'georgia/regions'
const CITIES_HUB = 'georgia/cities'
const PLACES_HUB = 'georgia/places-to-visit'
const GEORGIA_HUB = 'georgia'
const ARMENIA_HUB = 'armenia'
const ARMENIA_REGIONS_HUB = 'armenia/regions'
const ARMENIA_CITIES_HUB = 'armenia/cities'
const ARMENIA_PLACES_HUB = 'armenia/places-to-visit'
const AZERBAIJAN_HUB = 'azerbaijan'
const AZERBAIJAN_REGIONS_HUB = 'azerbaijan/regions'
const AZERBAIJAN_CITIES_HUB = 'azerbaijan/cities'
const AZERBAIJAN_PLACES_HUB = 'azerbaijan/places-to-visit'
// A published region's country decides which hub pair it hangs off and which
// URLs its links use. Georgia covers every record with no `country`; any other
// country resolves to its own hubs from places.js (for Armenia these are the
// exact strings the constants above spell out).
const isGeorgian = (r) => countryOf(r) === DEFAULT_COUNTRY
const hubsFor = (r) => (isGeorgian(r)
  ? { country: GEORGIA_HUB, regions: REGIONS_HUB, cities: CITIES_HUB }
  : {
      country: clean(countryBase(countryOf(r))),
      regions: clean(regionsHubPathFor(countryOf(r))),
      cities: clean(citiesHubPathFor(countryOf(r))),
    })
// A site's country is its PARENT's (countryOfSite), so its hubs are derived
// rather than assumed. `places` is null for a country that publishes no Places
// to Visit hub, which is why every use of it below is guarded.
const hubsForSite = (s) => {
  const c = countryOfSite(s)
  const places = placesHubPathFor(c)
  return {
    country: clean(countryBase(c)),
    regions: clean(regionsHubPathFor(c)),
    places: places ? clean(places) : null,
  }
}
const BORDER_HUB = clean(borderHubPath)
// Armenia and Azerbaijan each have a sister border guide at /<country>/border-crossings.
const COUNTRY_BORDER_HUBS = { armenia: 'armenia/border-crossings', azerbaijan: 'azerbaijan/border-crossings' }
const COUNTRY_BORDER_KEYS = { armenia: 'armeniaBorderCrossings', azerbaijan: 'azerbaijanBorderCrossings' }

// How many same-parent siblings a detail page links laterally. Enough to give
// every page more than one inbound path without turning each into a link farm;
// the parent and the hub already list the full set.
const SIBLING_LIMIT = 8

/**
 * Localized anchor text.
 *
 * pages.json stores the rendered H1 as `<contentKey>.heroTitle`, in the pattern
 * "Name: subtitle" or "Name, Georgia: subtitle". Everything before the first
 * colon is the entity name in that language; no localized name contains one.
 * Falls back to the hub card name, then to the registry's English name, so a
 * page whose translation is still pending still gets a working link.
 */
function labelFrom(pages, entity, hubKey, contentKey = entity.contentKey) {
  const hero = contentKey && pages[contentKey]?.heroTitle
  if (hero) {
    const head = String(hero).split(':')[0].trim()
    if (head) return head
  }
  const card = hubKey && pages[hubKey]?.items?.[entity.slug]?.name
  return card || entity.name
}

/**
 * Build the per-locale link graph.
 *
 * @param {object}   o
 * @param {Array}    o.tours          parsed tours (slug, type, title)
 * @param {Array}    o.blogArticles   blog article records (slug, titleKey)
 * @param {Function} o.tourTitle      (lang, tour) -> localized tour title
 * @param {Function} o.blogTitle      (lang, article) -> localized article title
 * @param {Function} o.seoTitle       (seoKey, lang) -> localized page title
 * @param {string[]} o.langs
 * @returns {{ linksFor: (lang: string, path: string) => Array<{href: string, text: string}> }}
 */
export function createLinkGraph({ tours, blogArticles, tourTitle, blogTitle, seoTitle, langs }) {
  const pubRegions = regions.filter((r) => r.published)
  const pubCities = cities.filter((c) => c.published)
  const pubSites = sites.filter((s) => s.published)
  const publishedRegionSlugs = new Set(pubRegions.map((r) => r.slug))
  const publishedCitySlugs = new Set(pubCities.map((c) => c.slug))

  // path -> [{ path, text }] for one locale
  const graphs = new Map()

  function buildGraph(lang) {
    const locale = (f) => JSON.parse(
      readFileSync(join(__dirname, '..', 'src', 'i18n', 'locales', lang, f), 'utf-8'),
    )
    const pages = locale('pages.json')
    const ui = locale('ui.json')
    // 18 things-to-do guides have no translated H1 outside English. Rather than
    // fall back to the bare place name (which would label the guide as if it
    // were the destination itself), reuse the CTA wording the city and region
    // pages already use for this exact link in every locale.
    const ttdLabel = (entity, name) =>
      (entity.thingsToDo.contentKey && pages[entity.thingsToDo.contentKey]?.heroTitle?.split(':')[0].trim()) ||
      (ui['city.thingsToDoCta'] || 'Things to do in {city}').replace('{city}', name)

    const g = new Map()
    const put = (from, to, text) => {
      if (!text || from === to) return
      const list = g.get(from) || g.set(from, []).get(from)
      if (!list.some((l) => l.path === to)) list.push({ path: to, text: String(text) })
    }

    // --- labels ---------------------------------------------------------
    const regionLabel = new Map(
      pubRegions.map((r) => [r.slug, labelFrom(pages, r, 'destinationsRegions')]),
    )
    const cityLabel = new Map(
      pubCities.map((c) => [c.slug, labelFrom(pages, c, 'destinationsCities')]),
    )
    const siteLabel = new Map(
      pubSites.map((s) => [s.slug, labelFrom(pages, s, 'destinationsPlaces')]),
    )
    const staticLabel = new Map(
      STATIC_PAGES.map(([path, key]) => [path, shortTitle(seoTitle(key, lang).title)]),
    )
    staticLabel.set(BORDER_HUB, shortTitle(seoTitle('borderCrossingsOverview', lang).title))
    for (const [c, p] of Object.entries(COUNTRY_BORDER_HUBS)) staticLabel.set(p, shortTitle(seoTitle(COUNTRY_BORDER_KEYS[c], lang).title))
    const labelOfStatic = (p) => staticLabel.get(p) || p

    // --- home: the full top level --------------------------------------
    for (const [path] of STATIC_PAGES) put('', path, labelOfStatic(path))
    put('', BORDER_HUB, labelOfStatic(BORDER_HUB))

    // --- Georgia hub -> the sub-hubs, every region, every city ----------
    for (const hub of [REGIONS_HUB, CITIES_HUB, PLACES_HUB, BORDER_HUB]) {
      put(GEORGIA_HUB, hub, labelOfStatic(hub))
      put(hub, GEORGIA_HUB, labelOfStatic(GEORGIA_HUB))
    }
    // Each region hangs off its OWN country's pair of hubs, at its own URL.
    // Georgian regions are wired exactly as before.
    for (const r of pubRegions) {
      const h = hubsFor(r)
      put(h.country, clean(regionPath(r.slug)), regionLabel.get(r.slug))
      put(h.regions, clean(regionPath(r.slug)), regionLabel.get(r.slug))
    }
    // Armenia's own hubs, mirroring the Georgia block above it. Armenia has no
    // places-to-visit hub yet (no published attraction records), so its country
    // hub links the two sub-hubs that exist.
    put(ARMENIA_HUB, ARMENIA_REGIONS_HUB, labelOfStatic(ARMENIA_REGIONS_HUB))
    put(ARMENIA_REGIONS_HUB, ARMENIA_HUB, labelOfStatic(ARMENIA_HUB))
    put(ARMENIA_HUB, ARMENIA_CITIES_HUB, labelOfStatic(ARMENIA_CITIES_HUB))
    put(ARMENIA_CITIES_HUB, ARMENIA_HUB, labelOfStatic(ARMENIA_HUB))
    put(ARMENIA_HUB, ARMENIA_PLACES_HUB, labelOfStatic(ARMENIA_PLACES_HUB))
    put(ARMENIA_PLACES_HUB, ARMENIA_HUB, labelOfStatic(ARMENIA_HUB))
    // Azerbaijan's hubs, the same pairing. Its regions, cities and sites are
    // all unpublished, so the published-only loops below add nothing under it;
    // each hub links only its country landing and vice versa.
    for (const hub of [AZERBAIJAN_REGIONS_HUB, AZERBAIJAN_CITIES_HUB, AZERBAIJAN_PLACES_HUB]) {
      put(AZERBAIJAN_HUB, hub, labelOfStatic(hub))
      put(hub, AZERBAIJAN_HUB, labelOfStatic(AZERBAIJAN_HUB))
    }
    for (const c of pubCities) {
      // A city hangs off its own country hub and is listed on that country's
      // cities hub. Both countries now have one, so this is symmetric.
      put(hubsFor(c).country, clean(cityPath(c.slug)), cityLabel.get(c.slug))
      put(hubsFor(c).cities, clean(cityPath(c.slug)), cityLabel.get(c.slug))
    }
    // The Places to Visit hub is Georgia's, so it lists Georgia's sites. A site
    // under another country is reached from that country's own hubs instead.
    for (const s of pubSites.filter((x) => hubsForSite(x).places === PLACES_HUB)) {
      put(PLACES_HUB, clean(sitePath(s)), siteLabel.get(s.slug))
    }

    // --- region detail pages -------------------------------------------
    for (const r of pubRegions) {
      const h = hubsFor(r)
      const self = clean(regionPath(r.slug))
      put(self, h.regions, labelOfStatic(h.regions))
      put(self, h.country, labelOfStatic(h.country))
      if (r.thingsToDo) {
        const ttd = clean(thingsToDoPath(r.slug))
        const text = ttdLabel(r, regionLabel.get(r.slug))
        put(self, ttd, text)
        put(ttd, self, regionLabel.get(r.slug))
        put(ttd, h.regions, labelOfStatic(h.regions))
      }
      // Cities and region-parented sites are Georgia-only today; a non-Georgian
      // region simply matches nothing here.
      for (const c of pubCities.filter((c) => isGeorgian(c) && c.region === r.slug)) {
        put(self, `georgia/${c.slug}`, cityLabel.get(c.slug))
        put(`georgia/${c.slug}`, self, regionLabel.get(r.slug))
      }
      for (const s of pubSites.filter((s) => s.parentType === 'region' && s.parent === r.slug)) {
        put(self, clean(sitePath(s)), siteLabel.get(s.slug))
      }
    }

    // --- city detail pages ----------------------------------------------
    for (const c of pubCities) {
      const self = clean(cityPath(c.slug))
      put(self, hubsFor(c).cities, labelOfStatic(hubsFor(c).cities))
      put(self, hubsFor(c).country, labelOfStatic(hubsFor(c).country))
      if (c.thingsToDo) {
        // The guide's OWN canonical path. This was built as
        // `georgia/<slug>/things-to-do-in-<slug>`, which is correct for a
        // Georgian city but emitted a link to a URL that does not exist on an
        // Armenian one — /armenia/yerevan shipped a link to
        // /georgia/yerevan/things-to-do-in-yerevan, a 404.
        const ttd = clean(thingsToDoPath(c.slug))
        const text = ttdLabel(c, cityLabel.get(c.slug))
        put(self, ttd, text)
        put(ttd, self, cityLabel.get(c.slug))
        // Back up to that country's cities hub, exactly as the city page above.
        put(ttd, hubsFor(c).cities, labelOfStatic(hubsFor(c).cities))
      }
      for (const s of pubSites.filter((s) => s.parentType === 'city' && s.parent === c.slug)) {
        put(self, clean(sitePath(s)), siteLabel.get(s.slug))
      }
    }

    // --- site detail pages: parent, hub, a few siblings -------------------
    const byParent = new Map()
    for (const s of pubSites) {
      const list = byParent.get(s.parent) || byParent.set(s.parent, []).get(s.parent)
      list.push(s)
    }
    for (const s of pubSites) {
      const h = hubsForSite(s)
      const self = clean(sitePath(s))
      // Up to the hub this site is actually listed on: Places to Visit where
      // the country has one, otherwise its country hub. Never a hub that does
      // not exist, and never another country's.
      if (h.places) put(self, h.places, labelOfStatic(h.places))
      else put(self, h.country, labelOfStatic(h.country))
      // Structural parent. A site parented on a plain place (a town with no
      // landing page of its own) reports its region instead, matching
      // siteLocation() in places.js.
      if (s.parentType === 'city' && publishedCitySlugs.has(s.parent)) {
        put(self, clean(cityPath(s.parent)), cityLabel.get(s.parent))
      } else if (s.parentType === 'region' && publishedRegionSlugs.has(s.parent)) {
        put(self, clean(regionPath(s.parent)), regionLabel.get(s.parent))
      } else if (s.region && publishedRegionSlugs.has(s.region)) {
        put(self, clean(regionPath(s.region)), regionLabel.get(s.region))
      }
      for (const sib of (byParent.get(s.parent) || []).filter((x) => x.slug !== s.slug).slice(0, SIBLING_LIMIT)) {
        put(self, clean(sitePath(sib)), siteLabel.get(sib.slug))
      }
    }

    // --- border crossings -------------------------------------------------
    const borderHubLabel = labelOfStatic(BORDER_HUB)
    for (const b of publishedBorderPages()) {
      const self = clean(b.path)
      if (self === BORDER_HUB) continue
      if (b.hub) {
        // A sister guide: reached from its country landing, and links back.
        put(clean(countryBase(b.country)), self, labelOfStatic(self))
        put(self, clean(countryBase(b.country)), labelOfStatic(clean(countryBase(b.country))))
        put(self, BORDER_HUB, borderHubLabel)
        continue
      }
      put(BORDER_HUB, self, shortTitle(seoTitle(b.seoKey, lang).title))
      put(self, BORDER_HUB, borderHubLabel)
      put(self, GEORGIA_HUB, labelOfStatic(GEORGIA_HUB))
    }

    // --- tours ------------------------------------------------------------
    for (const t of tours) {
      const hub = t.type === 'group' ? 'group-tours' : 'private-tours'
      const self = `${hub}/${t.slug}`
      const text = tourTitle(lang, t)
      put(hub, self, text)
      put(self, hub, labelOfStatic(hub))
      put(self, 'contact', labelOfStatic('contact'))
    }

    // --- "<Entity> Tours" listing pages ----------------------------------
    for (const ep of entityTourPages) {
      const self = clean(ep.path)
      const entityPath =
        ep.type === 'region' ? `georgia/regions/${ep.slug}`
        : ep.type === 'city' ? clean(cityPath(ep.slug))
        : (() => { const s = pubSites.find((x) => x.slug === ep.slug); return s ? `georgia/${s.parent}/${s.slug}` : null })()
      const entityText =
        ep.type === 'region' ? regionLabel.get(ep.slug)
        : ep.type === 'city' ? cityLabel.get(ep.slug)
        : siteLabel.get(ep.slug)
      if (entityPath && entityText) {
        put(self, entityPath, entityText)
        // The entity page is the natural inbound link for its own tours list.
        put(entityPath, self, `${entityText} — ${labelOfStatic('private-tours')}`)
      }
      put(self, 'private-tours', labelOfStatic('private-tours'))
      for (const slug of ep.tourSlugs) {
        const t = tours.find((x) => x.slug === slug)
        if (t) put(self, `${t.type === 'group' ? 'group-tours' : 'private-tours'}/${t.slug}`, tourTitle(lang, t))
      }
    }

    // --- blog --------------------------------------------------------------
    for (const a of blogArticles) {
      const self = `blog/${a.slug}`
      put('blog', self, blogTitle(lang, a))
      put(self, 'blog', labelOfStatic('blog'))
    }

    // --- every inner static page points home + at the Georgia hub ----------
    for (const [path] of STATIC_PAGES) {
      if (path !== GEORGIA_HUB) put(path, GEORGIA_HUB, labelOfStatic(GEORGIA_HUB))
    }

    return g
  }

  return {
    linksFor(lang, path) {
      const key = clean(path)
      if (!graphs.has(lang)) graphs.set(lang, buildGraph(lang))
      const own = graphs.get(lang).get(key) || []
      const out = own.map((l) => ({ href: `/${lang}/${l.path}${l.path ? '/' : ''}`, text: l.text }))
      // Home is reachable from every page, and every page links its own
      // translations — the same set already declared in the hreflang alternates.
      if (key !== '') out.push({ href: `/${lang}/`, text: shortTitle(seoTitle('home', lang).title) })
      for (const alt of langs) {
        if (alt === lang) continue
        out.push({ href: `/${alt}/${key}${key ? '/' : ''}`, text: LANG_NAMES[alt] || alt })
      }
      return out
    },
  }
}
