/**
 * Build-time structured data for the pre-rendered HTML.
 *
 * Page-specific JSON-LD is built inside the React components and injected by
 * useSEO() at runtime, so until now it existed only after hydration: every one
 * of the 4,306 built files carried nothing but the generic TravelAgency block
 * inherited from the base template. Breadcrumbs, the TouristAttraction /
 * TouristDestination entity nodes and every hero ImageObject were invisible to
 * anything that did not execute JavaScript.
 *
 * This module rebuilds the stable core of those graphs from the same registries
 * (places.js, borders.js, seoData.js, pages.json, ui.json) that the components
 * read, and prerender.js writes it into <head> as
 *   <script type="application/ld+json" data-seo-jsonld>
 *
 * That attribute is the handshake: useSEO() looks for exactly this element and
 * overwrites its contents on mount rather than appending a second block, so the
 * runtime graph — which additionally carries gallery ImageObjects and the FAQ
 * page, both of which depend on rendered page content — remains the final word.
 * The static version is a strict subset, never a contradiction.
 *
 * Trails, node types and the "every ListItem needs an item URL" rule mirror
 * SitePage / CityPage / RegionPage / ThingsToDoCityPage / BorderCrossingPage
 * exactly; see breadcrumb-jsonld-item-fix for why a non-final crumb without an
 * item URL is a hard structured-data error.
 */

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const src = (p) => pathToFileURL(join(__dirname, '..', 'src', p)).href

const {
  regions, cities, sites, getCity, getRegion,
  regionPath, thingsToDoPath, countryOf, countryBase, countryName,
  regionsHubPathFor, DEFAULT_COUNTRY,
} = await import(src('data/places.js'))
const { publishedBorderPages, borderCrossings, borderOverview } = await import(src('data/borders.js'))

const SITE_URL = 'https://www.hikasustravel.com'
const BRAND = 'Hikasus Travel'
const ORG = { '@type': 'Organization', name: BRAND }
const PUBLISHER = { '@type': 'Organization', name: BRAND, url: SITE_URL }

const clean = (p) => String(p).replace(/^\/+|\/+$/g, '')

/**
 * Hero ImageObject, mirroring the `imageMeta` block SitePage/CityPage emit.
 * address and geo are both optional — a hero package may ship a name-only
 * contentLocation when there is no reliable coordinate for the exact point.
 */
function imageNode(meta, imageHref, lang, pageUrl) {
  if (!meta || !imageHref) return null
  const url = `${SITE_URL}${imageHref}`
  const caption = meta.caption ? (meta.caption[lang] || meta.caption.en) : (meta.alt?.[lang] || meta.alt?.en)
  return {
    '@type': 'ImageObject',
    // Page-scoped, exactly as CityPage builds it — a bare `hero-image` would be
    // a relative identifier, not the node this page's hero swap targets.
    ...(meta.imageId ? { '@id': `${pageUrl}#${meta.imageId}` } : {}),
    contentUrl: url,
    url,
    width: meta.width,
    height: meta.height,
    caption,
    name: meta.name,
    description: meta.description,
    representativeOfPage: true,
    // Brand credit is the default (our own photos). A hero whose provenance we
    // cannot vouch for sets `noCredit: true` and ships with the credit fields
    // omitted rather than asserting an authorship we don't hold — the same
    // opt-out SitePage/RegionPage/ThingsToDoCityPage apply to the runtime graph.
    // This file builds the STATIC build-time JSON-LD, so without the flag here a
    // `noCredit` hero would still claim brand credit in the prerendered HTML.
    ...(meta.noCredit ? {} : { creator: ORG, creditText: BRAND, copyrightNotice: `© ${BRAND}` }),
    contentLocation: {
      '@type': 'Place',
      name: meta.locationName,
      ...((meta.locality || meta.region || meta.country)
        ? {
            address: {
              '@type': 'PostalAddress',
              addressLocality: meta.locality,
              addressRegion: meta.region,
              addressCountry: meta.country,
            },
          }
        : {}),
      ...(meta.geo
        ? { geo: { '@type': 'GeoCoordinates', latitude: meta.geo.lat, longitude: meta.geo.lng } }
        : {}),
    },
  }
}

/**
 * @param {object}   o
 * @param {Function} o.seoFor  (seoKey, lang) -> { title, description, keywords }
 * @returns {{ forRoute: (lang: string, path: string) => object|null }}
 */
export function createJsonLdBuilder({ seoFor }) {
  const perLang = new Map()

  function build(lang) {
    const locale = (f) => JSON.parse(
      readFileSync(join(__dirname, '..', 'src', 'i18n', 'locales', lang, f), 'utf-8'),
    )
    const ui = locale('ui.json')
    const pages = locale('pages.json')
    // Mirrors the custom t(): missing key renders as the key, {var} is replaced.
    const t = (key, params) => {
      let v = ui[key] ?? key
      if (params) for (const [k, val] of Object.entries(params)) v = v.split(`{${k}}`).join(val)
      return v
    }
    const heroTitle = (contentKey) => (contentKey && pages[contentKey]?.heroTitle) || undefined
    const abs = (p) => `${SITE_URL}/${lang}${p === '/' ? '' : p}`

    const graphs = new Map()
    const put = (path, nodes) => {
      const list = nodes.filter(Boolean)
      if (list.length) graphs.set(clean(path), { '@context': 'https://schema.org', '@graph': list })
    }
    // Every ListItem carries an `item`; a non-linked crumb falls back to the
    // page's own URL (Google rejects a non-final entry without one).
    const breadcrumbs = (trail, pageUrl) => ({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.name,
        item: c.to ? abs(c.to) : pageUrl,
      })),
    })
    const HOME = { name: t('breadcrumb.home'), to: '/' }
    const ALL_DEST = { name: t('nav.allDestinations'), to: '/georgia' }
    // Country crumb. Georgia keeps the long-standing "All Destinations" -> /georgia
    // crumb; a country added later uses its own name (the same ui key the
    // Destinations dropdown uses) pointing at its own landing page. Mirrors
    // RegionPage/ThingsToDoCityPage exactly so the prerendered graph and the
    // hydrated one stay identical.
    const countryCrumb = (country) =>
      country === DEFAULT_COUNTRY
        ? ALL_DEST
        : { name: t(`nav.destinations.${country}`), to: countryBase(country) }

    // --- regions ---------------------------------------------------------
    for (const r of regions.filter((x) => x.published)) {
      const country = countryOf(r)
      const path = clean(regionPath(r.slug))
      const url = `${SITE_URL}/${lang}/${path}`
      const seo = seoFor(r.seoKey, lang)
      put(path, [
        {
          '@type': 'TouristDestination',
          name: r.name,
          description: seo.description,
          url,
          // Opt-in `jsonLdImage`, same as the sites branch below: a region may
          // name a dedicated social crop here. Regions without it are unchanged.
          // Omitted entirely on a `noHero` region — there is no image to name.
          ...((r.jsonLdImage || r.image) ? { image: `${SITE_URL}${r.jsonLdImage || r.image}` } : {}),
          containedInPlace: { '@type': 'Country', name: countryName(country) },
        },
        breadcrumbs([
          HOME,
          countryCrumb(country),
          { name: t('nav.regions'), to: regionsHubPathFor(country) },
          { name: r.name },
        ], url),
      ])
    }

    // --- cities ----------------------------------------------------------
    for (const c of cities.filter((x) => x.published)) {
      const path = `georgia/${c.slug}`
      const url = `${SITE_URL}/${lang}/${path}`
      const seo = seoFor(c.seoKey, lang)
      const parentCrumb = c.classifyAs === 'place'
        ? { name: t('nav.placesToVisit'), to: '/georgia/places-to-visit' }
        : { name: t('nav.cities'), to: '/georgia/cities' }
      put(path, [
        {
          '@type': 'TouristDestination',
          name: c.name,
          description: seo.description,
          url,
          image: `${SITE_URL}${c.image}`,
          containedInPlace: { '@type': 'Country', name: 'Georgia' },
        },
        {
          '@type': 'Article',
          headline: heroTitle(c.contentKey),
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          image: `${SITE_URL}${c.image}`,
          author: ORG,
          publisher: PUBLISHER,
        },
        imageNode(c.imageMeta, c.image, lang, url),
        breadcrumbs([HOME, ALL_DEST, parentCrumb, { name: c.name }], url),
      ])
    }

    // --- tourist sites ----------------------------------------------------
    for (const s of sites.filter((x) => x.published)) {
      const path = `georgia/${s.parent}/${s.slug}`
      const url = `${SITE_URL}/${lang}/${path}`
      const seo = seoFor(s.seoKey, lang)
      const isArticleType = s.schemaType === 'TravelGuide' || s.schemaType === 'Article'
      // The primary node's `image`. Defaults to the hero rung; an entry may opt into
      // a dedicated social crop instead via `jsonLdImage` (first consumer: Batumi
      // Boulevard, whose og:image/twitter:image use the same 1.91:1 file). Entries
      // that omit the field are unchanged — `undefined || hero` is the hero.
      const primaryImage = `${SITE_URL}${s.jsonLdImage || s.image}`
      const primary = isArticleType
        ? {
            '@type': s.schemaType,
            name: s.name,
            headline: heroTitle(s.contentKey) || s.name,
            description: seo.description,
            url,
            image: primaryImage,
            inLanguage: lang,
          }
        : {
            '@type': 'TouristAttraction',
            name: s.name,
            description: seo.description,
            url,
            image: primaryImage,
            containedInPlace: { '@type': 'Country', name: 'Georgia' },
          }
      const trail = [HOME, ALL_DEST]
      if (s.parentType === 'place') {
        trail.push({ name: t('nav.placesToVisit'), to: '/georgia/places-to-visit' })
      } else {
        const parent = s.parentType === 'city' ? getCity(s.parent) : getRegion(s.parent)
        trail.push(s.parentType === 'city'
          ? { name: t('nav.cities'), to: '/georgia/cities' }
          : { name: t('nav.regions'), to: '/georgia/regions' })
        trail.push({
          name: parent ? parent.name : s.parent,
          to: parent && parent.published
            ? (s.parentType === 'city' ? `/georgia/${s.parent}` : `/georgia/regions/${s.parent}`)
            : undefined,
        })
      }
      trail.push({ name: s.name })
      put(path, [primary, imageNode(s.imageMeta, s.image, lang, url), breadcrumbs(trail, url)])
    }

    // --- things-to-do guides (city- and region-owned) -----------------------
    for (const e of [...regions, ...cities].filter((x) => x.published && x.thingsToDo)) {
      const path = clean(thingsToDoPath(e.slug))
      const url = `${SITE_URL}/${lang}/${path}`
      const seo = seoFor(e.thingsToDo.seoKey, lang)
      const isRegion = regions.includes(e)
      const country = countryOf(e)
      const heroSrc = e.thingsToDo.image || e.image
      put(path, [
        {
          '@type': 'Article',
          headline: heroTitle(e.thingsToDo.contentKey) || seo.title,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          // Omitted entirely on a `noHero` guide — there is no image to name.
          ...(heroSrc ? { image: `${SITE_URL}${heroSrc}` } : {}),
          author: ORG,
          publisher: PUBLISHER,
        },
        // Hero ImageObject, exactly as the city and site branches above build it.
        // This branch used to omit it entirely, so a things-to-do guide's
        // prerendered graph was only [Article, BreadcrumbList] while the hydrated
        // page (ThingsToDoCityPage, which has always built this node) also carried
        // the hero — and, on guides with body figures, the inline ImageObjects.
        // The runtime node is field-for-field identical to imageNode()'s output,
        // including the caption-map-else-alt fallback, the optional `@id`, the
        // `noCredit` opt-out and the conditional address/geo, so adding it here
        // makes the two graphs agree rather than introducing a second variant.
        // `put()` drops falsy nodes, so the 11 guides with no `imageMeta` are
        // unchanged. The href matches ThingsToDoCityPage's `heroImage`
        // (`config.image || place.image`) and the Article node's `image` above.
        // NOTE: the inline body-figure ImageObjects are still runtime-only here —
        // this closes the hero gap, not that one.
        imageNode(e.thingsToDo.imageMeta, heroSrc, lang, url),
        breadcrumbs(
          country === DEFAULT_COUNTRY
            ? [
                HOME,
                ALL_DEST,
                { name: e.name, to: isRegion ? regionPath(e.slug) : `/georgia/${e.slug}` },
                { name: t('city.thingsToDoCta', { city: e.name }) },
              ]
            : [
                // A non-Georgian guide nests under its region page, so the trail
                // spells out the hierarchy the URL does (mirrors ThingsToDoCityPage).
                HOME,
                countryCrumb(country),
                { name: t('nav.regions'), to: regionsHubPathFor(country) },
                { name: e.name, to: regionPath(e.slug) },
                { name: t('city.thingsToDoCta', { city: e.name }) },
              ],
          url,
        ),
      ])
    }

    // --- border crossings ---------------------------------------------------
    const hubPath = clean(borderOverview?.path || 'georgia/border-crossings')
    for (const bp of publishedBorderPages()) {
      const path = clean(bp.path)
      const url = `${SITE_URL}/${lang}/${path}`
      const seo = seoFor(bp.seoKey, lang)
      const isHub = path === hubPath
      const crossing = borderCrossings?.find((c) => clean(c.path || '') === path)
      put(path, [
        {
          '@type': 'Article',
          headline: seo.title,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          image: `${SITE_URL}${bp.image}`,
          about: { '@type': 'Country', name: 'Georgia' },
          author: ORG,
          publisher: PUBLISHER,
        },
        breadcrumbs(isHub
          ? [HOME, ALL_DEST, { name: t('nav.borderCrossings') }]
          : [HOME, ALL_DEST,
             { name: t('nav.borderCrossings'), to: `/${hubPath}` },
             { name: crossing?.name || seo.title }],
          url),
      ])
    }

    return graphs
  }

  return {
    forRoute(lang, path) {
      if (!perLang.has(lang)) perLang.set(lang, build(lang))
      return perLang.get(lang).get(clean(path)) || null
    },
  }
}
