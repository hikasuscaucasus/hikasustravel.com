import DestinationHub from '../shared/DestinationHub'
import useT from '../../i18n/useT'
import {
  citiesOfCountry,
  countryHubSocialImage,
  countryHubMeta,
  sites,
  regionPath,
  cityPath,
  sitePath,
  siteLocation,
  countryOfSite,
  countryBase,
  regionsHubPathFor,
  citiesHubPathFor,
  placesHubPathFor,
  regionsOfCountry,
  DEFAULT_COUNTRY,
} from '../../data/places'

const HERO_IMAGE = '/images/files/tbilisi-old-town-narikala-mtkvari-georgia-1200.webp'

/**
 * Per-country configuration for the three sub-hubs.
 *
 * All three hubs are the ONE shared <DestinationHub>; this table only says which
 * content key, which hero treatment and which listing rules each country uses.
 * Georgia's entries are verbatim what the three functions passed inline before,
 * so its hubs render byte-identically.
 *
 * `includeUnpublished` decides whether a hub also lists what is scaffolded but
 * not yet written, as DestinationHub's non-clickable "guide coming soon" card.
 * Armenia's Cities and Places hubs do, so the seven planned city guides and the
 * fifteen planned attractions are visible as forthcoming; its Regions hub does
 * not, because all ten Armenian regions are already published.
 *
 * A country still omits a hub it does not publish, enforced independently by
 * COUNTRIES in places.js (placesHubPathFor and friends return null), which is
 * what the breadcrumb builders and the country landing page read.
 */
const COUNTRY_HUBS = {
  georgia: {
    heroImage: HERO_IMAGE,
    regions: { pageKey: 'destinationsRegions', seoKey: 'destinationsRegions', includeUnpublished: true },
    cities: { pageKey: 'destinationsCities', seoKey: 'destinationsCities', includeUnpublished: true, pinFirst: 'tbilisi' },
    places: { pageKey: 'destinationsPlaces', seoKey: 'destinationsPlaces', filterable: true },
  },
  armenia: {
    // `noHero` until an approved Armenia photograph exists (the same flag the
    // region pages themselves use); it renders the solid `.dest-title-band`
    // carrying the H1, not an empty hero.
    noHero: true,
    regions: { pageKey: 'armeniaRegions', seoKey: 'armeniaRegions', includeUnpublished: false },
    // Cities and Places list their scaffolded entries: the seven planned city
    // guides and the fifteen planned attractions render as DestinationHub's
    // non-clickable 'guide coming soon' cards, which is how a visitor sees what
    // is on the way. Regions stays published-only — all ten already exist.
    cities: { pageKey: 'armeniaCities', seoKey: 'armeniaCities', includeUnpublished: true, pinFirst: 'yerevan' },
    // No `filterable`: Armenia's Places hub renders the cards directly, with no
    // search box and no region/city facets. Georgia keeps its filter bar.
    places: { pageKey: 'armeniaPlaces', seoKey: 'armeniaPlaces' },
  },
  azerbaijan: {
    // Scaffolded country: no photograph yet, so the solid `.dest-title-band`
    // carries the H1, as on Armenia. All three hubs list every scaffolded
    // entry as the non-clickable "coming soon" card — nothing is published
    // yet, so a published-only listing would be three empty pages. Flipping
    // an entry's `published` flag in places.js is what turns its card into a
    // link; no change here is needed.
    noHero: true,
    // Regions sort A–Z by canonical name (Georgia and Armenia keep their
    // curated registry order). Baku is not listed here: the capital is its own
    // unit and lives on the Cities hub — its region record carries `hideFromHub`.
    regions: { pageKey: 'azerbaijanRegions', seoKey: 'azerbaijanRegions', includeUnpublished: true, sortByName: true, sortCanonical: true },
    // Curated editorial selection, not the full scaffolded registry (42 other
    // Azerbaijan cities stay in places.js, unpublished, reachable once written —
    // this only controls what the Cities hub *lists*). Fixed order, not A-Z;
    // `only` overrides sortByName/pinFirst below rather than combining with them.
    cities: {
      pageKey: 'azerbaijanCities',
      seoKey: 'azerbaijanCities',
      includeUnpublished: true,
      only: ['baku', 'gabala', 'ganja', 'khinalig', 'lahij', 'lankaran', 'quba', 'sheki'],
    },
    places: { pageKey: 'azerbaijanPlaces', seoKey: 'azerbaijanPlaces' },
  },
}

const clean = (p) => String(p).replace(/^\//, '')

/**
 * Country crumb between Home and a hub. Georgia keeps its long-standing "All
 * Destinations" -> /georgia crumb (DestinationHub's own default, so passing null
 * leaves it exactly as it was); another country uses its own name, from the same
 * ui key the Destinations dropdown already ships in all 7 locales.
 */
function useCountryCrumb(country) {
  const t = useT()
  if (country === DEFAULT_COUNTRY) return null
  return { name: t(`nav.destinations.${country}`), to: countryBase(country) }
}

export function RegionsHubPage({ country = DEFAULT_COUNTRY }) {
  const conf = COUNTRY_HUBS[country].regions
  const countryCrumb = useCountryCrumb(country)
  // `hideFromHub` entries (e.g. the combined Racha-Lechkhumi, kept for its
  // dependents) stay in the registry but are excluded from the listing.
  const entries = regionsOfCountry(country)
    .filter((r) => !r.hideFromHub && (conf.includeUnpublished || r.published))
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
      pageKey={conf.pageKey}
      seoKey={conf.seoKey}
      path={clean(regionsHubPathFor(country))}
      heroImage={COUNTRY_HUBS[country].heroImage}
      noHero={COUNTRY_HUBS[country].noHero}
      socialImage={countryHubSocialImage(country, 'regions')}
      countryCrumb={countryCrumb}
      robots={countryHubMeta(country)}
      entries={entries}
      currentLabelKey="nav.regions"
      ctaKey="destinations.exploreRegion"
      sortByName={!!conf.sortByName}
      sortCanonical={!!conf.sortCanonical}
      pinFirst={conf.pinFirst || null}
    />
  )
}

export function CitiesHubPage({ country = DEFAULT_COUNTRY }) {
  const conf = COUNTRY_HUBS[country].cities
  const countryCrumb = useCountryCrumb(country)
  // Cities are shown with the capital first, then alphabetically (registry order
  // is unaffected). The A–Z pass happens in DestinationHub via `sortByName`,
  // because that is where the visible localized card name is resolved — sorting
  // here could only order by the English registry name, which left the list out
  // of order in every other language. Entries reclassified as a place to visit
  // (e.g. the highland resort Gomismta) are excluded here and listed on the
  // Places to Visit hub instead.
  let entries = citiesOfCountry(country)
    .filter((c) => c.classifyAs !== 'place' && (conf.includeUnpublished || c.published))
    .map((c) => ({
      slug: c.slug,
      fallbackName: c.name,
      seoKey: c.seoKey,
      published: c.published,
      to: c.published ? cityPath(c.slug) : null,
      // Card cover. Read straight from the registry — the SAME `cities[].image`
      // field the featured-city strip on the country landing renders — so the
      // two pages can never drift: a city's photo is changed in one place and
      // both follow. A city without one renders the text-only card unchanged.
      image: c.image,
    }))
  // `only`: a curated editorial subset of the registry, in a fixed order (not
  // A-Z). The other scaffolded cities stay in places.js, just not listed here.
  if (conf.only) {
    const bySlug = new Map(entries.map((e) => [e.slug, e]))
    entries = conf.only.map((slug) => bySlug.get(slug)).filter(Boolean)
  }
  return (
    <DestinationHub
      pageKey={conf.pageKey}
      seoKey={conf.seoKey}
      path={clean(citiesHubPathFor(country))}
      heroImage={COUNTRY_HUBS[country].heroImage}
      noHero={COUNTRY_HUBS[country].noHero}
      socialImage={countryHubSocialImage(country, 'cities')}
      countryCrumb={countryCrumb}
      robots={countryHubMeta(country)}
      entries={entries}
      currentLabelKey="nav.cities"
      ctaKey="destinations.exploreCity"
      sortByName={!conf.only}
      pinFirst={conf.only ? null : conf.pinFirst}
      // Falls back to a city's own authored per-language SEO entry for the card
      // title and one-line summary. On Georgia only Bakhmaro needs it (the other
      // 25 have curated card text); on Armenia it carries every card, which is
      // what lets Yerevan render as Jerewan/Erevan/Ereván/Erywań with a real
      // localized summary and no card copy authored twice.
      seoFallback
    />
  )
}

export function PlacesToVisitHubPage({ country = DEFAULT_COUNTRY }) {
  const conf = COUNTRY_HUBS[country].places
  const countryCrumb = useCountryCrumb(country)
  // Scoped to this country's sites: `sites` is one array across countries now.
  // A site's country is its parent's (countryOfSite), and every record whose
  // parent has no `country` counts as Georgian — so this listing is exactly what
  // it was before.
  const siteEntries = sites.filter((s) => countryOfSite(s) === country).map((s) => ({
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
  // existing /<country>/<slug> detail page (e.g. Gomismta). They link to that
  // same detail URL and carry their own structured `placeLocation`.
  const placeCityEntries = citiesOfCountry(country)
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
      pageKey={conf.pageKey}
      seoKey={conf.seoKey}
      path={clean(placesHubPathFor(country))}
      heroImage={COUNTRY_HUBS[country].heroImage}
      noHero={COUNTRY_HUBS[country].noHero}
      socialImage={countryHubSocialImage(country, 'places')}
      countryCrumb={countryCrumb}
      robots={countryHubMeta(country)}
      entries={entries}
      currentLabelKey="nav.placesToVisit"
      ctaKey="destinations.explorePlace"
      sortByName
      seoFallback
      filterable={!!conf.filterable}
    />
  )
}
