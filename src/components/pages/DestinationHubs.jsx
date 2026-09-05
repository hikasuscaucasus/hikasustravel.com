import DestinationHub from '../shared/DestinationHub'
import useT from '../../i18n/useT'
import {
  cities,
  sites,
  regionPath,
  cityPath,
  sitePath,
  siteLocation,
  regionsOfCountry,
  armeniaBase,
} from '../../data/places'

const HERO_IMAGE = '/images/files/tbilisi-old-town-narikala-mtkvari-georgia-1200.webp'

export function RegionsHubPage() {
  // `hideFromHub` entries (e.g. the combined Racha-Lechkhumi, kept for its
  // dependents) stay in the registry but are excluded from the listing.
  // Scoped to Georgia's regions: `regions` is one array across all countries
  // now, and this hub is /georgia/regions. Every record without a `country`
  // counts as Georgian, so the listing is exactly what it was before.
  const entries = regionsOfCountry('georgia')
    .filter((r) => !r.hideFromHub)
    .map((r) => ({
      slug: r.slug,
      fallbackName: r.name,
      // A region may link its card to a dedicated page elsewhere (e.g. Abkhazia
      // -> /<lang>/abkhazia) via `linkPath`, without being a published region
      // *detail* page. Such a card is clickable; otherwise it links to its
      // region detail page only once published.
      published: r.published || !!r.linkPath,
      to: r.linkPath || (r.published ? regionPath(r.slug) : null),
      // Card cover, read straight from the registry exactly as the Cities hub
      // reads `cities[].image` — so a region's card and its detail-page hero can
      // never drift apart. `cardImage` is the same hero family at its smallest
      // existing rung, and `cardPosition` carries the hero's own focal point.
      // A region without a cover (Abkhazia) renders the text-only card unchanged.
      image: r.cardImage,
      imagePosition: r.cardPosition,
    }))
  return (
    <DestinationHub
      pageKey="destinationsRegions"
      seoKey="destinationsRegions"
      path="georgia/regions"
      heroImage={HERO_IMAGE}
      entries={entries}
      currentLabelKey="nav.regions"
      ctaKey="destinations.exploreRegion"
    />
  )
}

/**
 * Armenia's regions hub — the same shared DestinationHub the three Georgia hubs
 * use, pointed at Armenia's own registry slice, content key and breadcrumb
 * parent. No second hub implementation.
 *
 * Only PUBLISHED Armenia regions are listed: the other seeded marzer have no
 * page yet, and a "guide coming soon" card for ten of them would be noise. The
 * Georgia hub keeps listing unpublished regions as it always has — that is a
 * mature hub where the coming-soon cards are informative.
 *
 * `noHero` until an approved Armenia photograph exists (same flag as the region
 * pages themselves); it renders the solid `.dest-title-band` carrying the H1,
 * not an empty hero.
 */
export function ArmeniaRegionsHubPage() {
  const t = useT()
  const entries = regionsOfCountry('armenia')
    .filter((r) => r.published && !r.hideFromHub)
    .map((r) => ({
      slug: r.slug,
      fallbackName: r.name,
      published: true,
      to: regionPath(r.slug),
      image: r.cardImage,
      imagePosition: r.cardPosition,
    }))
  return (
    <DestinationHub
      pageKey="armeniaRegions"
      seoKey="armeniaRegions"
      path="armenia/regions"
      noHero
      countryCrumb={{ name: t('nav.destinations.armenia'), to: armeniaBase }}
      entries={entries}
      currentLabelKey="nav.regions"
      ctaKey="destinations.exploreRegion"
    />
  )
}

export function CitiesHubPage() {
  // Cities are shown with the capital first, then alphabetically (registry order
  // is unaffected). The A–Z pass happens in DestinationHub via `sortByName`,
  // because that is where the visible localized card name is resolved — sorting
  // here could only order by the English registry name, which left the list out
  // of order in every other language. Entries reclassified as a place to visit
  // (e.g. the highland resort Gomismta) are excluded here and listed on the
  // Places to Visit hub instead.
  const entries = cities
    .filter((c) => c.classifyAs !== 'place')
    .map((c) => ({
      slug: c.slug,
      fallbackName: c.name,
      seoKey: c.seoKey,
      published: c.published,
      to: c.published ? cityPath(c.slug) : null,
      // Card cover. Read straight from the registry — the SAME `cities[].image`
      // field the featured-city strip on /georgia renders — so the two pages can
      // never drift: a city's photo is changed in one place and both follow.
      // Matching is by slug because it is the entry itself being mapped.
      image: c.image,
    }))
  return (
    <DestinationHub
      pageKey="destinationsCities"
      seoKey="destinationsCities"
      path="georgia/cities"
      heroImage={HERO_IMAGE}
      entries={entries}
      currentLabelKey="nav.cities"
      ctaKey="destinations.exploreCity"
      sortByName
      pinFirst="tbilisi"
      // Bakhmaro has no curated card entry; this shows its authored SEO
      // summary rather than an empty card. A no-op for the other 25.
      seoFallback
    />
  )
}

export function PlacesToVisitHubPage() {
  const siteEntries = sites.map((s) => ({
    slug: s.slug,
    fallbackName: s.name,
    seoKey: s.seoKey,
    published: s.published,
    to: s.published ? sitePath(s) : null,
    // Stable city/region IDs (from structured parent data) — the hub resolves
    // them to translated labels for the secondary location line.
    location: siteLocation(s),
  }))
  // Entries classified as a place but kept in the cities registry for their
  // existing /georgia/<slug> detail page (e.g. Gomismta). They link to that same
  // detail URL and carry their own structured `placeLocation`.
  const placeCityEntries = cities
    .filter((c) => c.classifyAs === 'place')
    .map((c) => ({
      slug: c.slug,
      fallbackName: c.name,
      seoKey: c.seoKey,
      published: c.published,
      to: c.published ? cityPath(c.slug) : null,
      location: c.placeLocation,
    }))
  const entries = [...siteEntries, ...placeCityEntries]
  return (
    <DestinationHub
      pageKey="destinationsPlaces"
      seoKey="destinationsPlaces"
      path="georgia/places-to-visit"
      heroImage={HERO_IMAGE}
      entries={entries}
      currentLabelKey="nav.placesToVisit"
      ctaKey="destinations.explorePlace"
      sortByName
      seoFallback
      filterable
    />
  )
}
