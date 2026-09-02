// Tour-page SEO: <title>, description, keywords, social image, and the full
// JSON-LD @graph (TouristTrip / Offer / BreadcrumbList / ImageObject).
//
// This lives outside the React tree on purpose. scripts/prerender.js imports
// it and writes the graph into the static HTML, and TourDetailPage imports it
// for the hydrated page, so a crawler that never runs JavaScript and a visitor
// who does are looking at the same structured data. Before this split the
// graph was built inside the component and existed only after hydration: a
// tour page shipped with nothing but the site-wide TravelAgency node.
//
// Pure: no React, no window, no imports beyond plain data helpers.
import { getStartingPrice } from '../components/shared/pricingUtils.js'

/**
 * @param tour  the record from src/data/tours.js
 * @param tt    the matching entry from src/i18n/locales/<lang>/tours.json, if any
 * @param lang  two-letter locale
 */
export function buildTourSeo({ tour, tt, lang }) {
  if (!tour) return {}
  const slug = tour.slug
  const title = `${tt?.seoTitle || tour.seoTitle || tt?.title || tour.title} | Hikasus Travel`
  const description = tt?.metaDescription || tour.metaDescription || (tt?.description || tour.description || '').slice(0, 160)
  const prefix = tour.type === 'group' ? 'group-tours' : 'private-tours'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tt?.title || tour.title,
    description: tt?.description || tour.description,
    touristType: tour.type === 'group' ? 'Group' : 'Private',
    provider: {
      '@type': 'TravelAgency',
      name: 'Hikasus Travel',
      url: 'https://www.hikasustravel.com',
    },
    ...(tour.gallery?.length > 0
      ? { image: tour.gallery.map(img => `https://www.hikasustravel.com${img.src}`) }
      : tour.heroImage && { image: `https://www.hikasustravel.com${tour.heroImage}` }),
    ...(tour.days && { itinerary: {
      '@type': 'ItemList',
      numberOfItems: tour.days,
      itemListElement: (tour.itinerary || []).map((day, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: day.title,
      })),
    }}),
  }
  const locations = (tour.itinerary || [])
    .map(day => day.title)
    .filter(Boolean)
  const typeLabel = tour.type === 'group' ? 'group tour' : 'private tour'
  const daysLabel = tour.days ? `${tour.days}-day Georgia tour` : 'Georgia tour'
  const keywords = [
    `book ${typeLabel} Georgia`,
    daysLabel,
    ...locations.map(loc => `${loc} tour`),
    `Georgia ${typeLabel} itinerary`,
    'book Georgia adventure',
  ].join(', ')

  // Offer price (lowest available) for richer product/trip schema.
  const startPrice = tour.type === 'group'
    ? (tour.pricePerPerson ? parseFloat(tour.pricePerPerson.replace(/[^0-9.]/g, '')) : null)
    : getStartingPrice(tour.pricing)
  if (startPrice) {
    jsonLd.offers = {
      '@type': 'Offer',
      price: startPrice,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: `https://www.hikasustravel.com/${lang}/${prefix}/${slug}`,
    }
  }

  // The FAQ section was retired from the tour-detail template, so no FAQPage
  // node is emitted here any more — schema must not describe content the page
  // no longer shows. Every other page type that has an FAQ (city, region,
  // site, blog, airport, border, the main FAQ page …) keeps its own FAQPage;
  // only the tour graph lost one. The `faq` data stays in tours.js and in the
  // locale files, untouched.

  // Hero ImageObject (representativeOfPage) built from the tour's imageMeta,
  // localized per locale; added to the @graph on every locale alongside the
  // TouristTrip/AggregateOffer/BreadcrumbList, which stay untouched.
  const SITE_URL = 'https://www.hikasustravel.com'
  const BRAND = 'Hikasus Travel'
  const im = tour.imageMeta
  const heroAlt = im ? (im.alt[lang] || im.alt.en) : null
  const heroImageObject = im ? {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/${lang}/${prefix}/${slug}#hero-image`,
    contentUrl: `${SITE_URL}${im.contentUrl}`,
    url: `${SITE_URL}${im.contentUrl}`,
    width: im.width,
    height: im.height,
    representativeOfPage: true,
    name: heroAlt,
    caption: im.caption[lang] || im.caption.en,
    description: im.description,
    creditText: BRAND,
    copyrightNotice: `© ${BRAND}`,
    creator: { '@type': 'Organization', name: BRAND },
    contentLocation: {
      '@type': 'Place',
      name: im.locationName,
      geo: { '@type': 'GeoCoordinates', latitude: im.geo.lat, longitude: im.geo.lng },
    },
  } : null

  // English uses the finalized, hand-authored structured data shipped with the
  // content package (exact TouristTrip + AggregateOffer + BreadcrumbList). Every
  // other locale and every other tour keeps the generic `jsonLd` node above,
  // untouched.
  // A tour may ship a finished ImageObject set with its photo package
  // (`tour.imageObjects`) — the per-photo nodes are authored alongside the
  // images, so they are emitted verbatim rather than rebuilt here. Opt-in: a
  // tour without the key keeps exactly the graph it had before, and the hero
  // node inside such a set already carries `representativeOfPage`, so those
  // tours deliberately do NOT also set `imageMeta` (that would emit a second
  // representative node). Added for the 8-day Culture, Nature & Wine tour.
  //
  // Those packaged nodes carry ENGLISH `caption`/`description`, so they are
  // emitted identically on all seven locales. A tour may opt into per-locale
  // structured data with `localizeImageObjects`: each node is matched to its
  // gallery item by contentUrl stem, and caption/description are swapped for
  // that item's localized `caption`/`altText` — the same strings the visible
  // <figcaption> and <img alt> use, so the markup and the schema never
  // disagree. Nodes with no matching gallery item (and every tour without the
  // flag) pass through untouched. Added for the 13-day Grand Tour from
  // Kutaisi, whose package asks for localized caption/description.
  const packagedImages = (() => {
    const nodes = tour.imageObjects || []
    if (!tour.localizeImageObjects || !nodes.length) return nodes
    const byStem = new Map(
      (tour.gallery || [])
        .filter((g) => g.base)
        .map((g) => [g.base.split('/').pop(), g])
    )
    return nodes.map((node) => {
      const file = String(node.contentUrl || '').split('/').pop()
      const stem = file.replace(/-\d+\.(webp|avif|jpg)$/, '')
      const item = byStem.get(stem)
      if (!item) return node
      const caption = item.caption?.[lang] || item.caption?.en
      const description = item.altText?.[lang] || item.altText?.en
      return {
        ...node,
        ...(caption ? { caption } : {}),
        ...(description ? { description } : {}),
      }
    })
  })()

  // A route map whose ImageObject is authored per locale (name/description in
  // the page's own language, plus `inLanguage`). `enRouteMapImage` below is the
  // older English-only form; a tour uses one or the other, never both. Opt-in,
  // so every tour without the key keeps exactly the graph it had.
  const routeMapNode = tour.routeMapImage
    ? (tour.routeMapImage[lang] || tour.routeMapImage.en)
    : null

  let finalJsonLd
  if (lang === 'en' && tour.enTouristTrip) {
    const stripCtx = (node) => { const rest = { ...node }; delete rest['@context']; return rest }
    const nodes = [
      tour.enTouristTrip,
      ...(tour.enBreadcrumb ? [tour.enBreadcrumb] : []),
      ...(tour.enRouteMapImage ? [tour.enRouteMapImage] : []),
      ...(routeMapNode ? [routeMapNode] : []),
      ...(heroImageObject ? [heroImageObject] : []),
      ...packagedImages,
    ]
    finalJsonLd = { '@context': 'https://schema.org', '@graph': nodes.map(stripCtx) }
  } else {
    const extra = [
      ...(routeMapNode ? [routeMapNode] : []),
      ...(heroImageObject ? [heroImageObject] : []),
      ...packagedImages,
    ]
    finalJsonLd = extra.length
      ? { '@context': 'https://schema.org', '@graph': [jsonLd, ...extra] }
      : jsonLd
  }

  return {
    title, description, keywords, path: `${prefix}/${slug}`,
    image: tour.heroImage,
    // og:image:alt / twitter:image:alt. Normally comes from imageMeta; a tour
    // that ships a packaged @graph deliberately has no imageMeta (it would emit
    // a second representativeOfPage node), so a plain per-locale `tour.alt`
    // supplies it instead — this is the same field prerender.js reads, so the
    // static and hydrated heads agree.
    imageAlt: heroAlt || (tour.alt ? (tour.alt[lang] || tour.alt.en) : undefined),
    ogImage: tour.ogImage?.src, ogImageWidth: tour.ogImage?.width, ogImageHeight: tour.ogImage?.height,
    jsonLd: finalJsonLd,
  }
}
