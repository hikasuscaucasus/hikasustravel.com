import DestinationHub from '../shared/DestinationHub'
import {
  regions,
  cities,
  sites,
  regionPath,
  cityPath,
  sitePath,
  siteLocation,
} from '../../data/places'

const HERO_IMAGE = '/images/files/tbilisi-old-town-narikala-mtkvari-georgia-1200.webp'

export function RegionsHubPage() {
  // `hideFromHub` entries (e.g. the combined Racha-Lechkhumi, kept for its
  // dependents) stay in the registry but are excluded from the listing.
  const entries = regions
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
    />
  )
}
