import { lazy, Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import TourDetailHero from '../shared/TourDetailHero'
import TourSectionNav from '../shared/TourSectionNav'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import { AccommodationSection, PriceSection } from '../shared/PricingGrid'
import { getStartingPrice } from '../shared/pricingUtils'
import IncludedNotIncluded from '../shared/IncludedNotIncluded'
import TourInquiryForm from '../shared/TourInquiryForm'
import Gallery, { GalleryLightbox } from '../shared/Gallery'
// Lazy so mapbox-gl stays out of the main bundle — see HomePage. Only tours
// that actually define `tour.map` reach the Suspense boundary below.
const MapboxMap = lazy(() => import('../shared/MapboxMap'))
import { tours } from '../../data/tours'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import useIsHydrated from '../../hooks/useIsHydrated'
import { autolinkHtml } from '../../utils/autolink'
import { autolinkNodes } from '../../utils/autolinkReact'

export default function TourDetailPage() {
  const { slug } = useParams()
  const t = useT()
  const hydrated = useIsHydrated()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations, pages } = useContext(I18nContext)

  // Package chosen from a pricing card's "Book Now" button. `nonce` increments on
  // every click so the inquiry form re-applies the selection even when the same
  // package is clicked again, while leaving the user's manual choice untouched
  // between clicks. Kept here (shared parent of the price section and the form).
  const [packageSelection, setPackageSelection] = useState({ value: '', nonce: 0 })
  const handleSelectPackage = useCallback((value) => {
    setPackageSelection((prev) => ({ value, nonce: prev.nonce + 1 }))
  }, [])

  // Route-map infographic lightbox (Gudauri EN page only). Reuses the shared
  // GalleryLightbox; `routeMapTrigger` restores focus to the clickable figure
  // when the expanded view closes.
  const [routeMapOpen, setRouteMapOpen] = useState(false)
  const routeMapTrigger = useRef(null)

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  const tour = tours.find((t) => t.slug === slug)
  const tt = tourTranslations?.[slug]

  const tourSeo = useMemo(() => {
    if (!tour) return {}
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

    // When the tour provides an FAQ, expose it as FAQPage alongside the trip.
    const faqList = tt?.faq || tour.faq
    const faqNode = faqList?.length > 0
      ? {
          '@type': 'FAQPage',
          mainEntity: faqList.map((f) => ({
            '@type': 'Question',
            name: f.title,
            acceptedAnswer: { '@type': 'Answer', text: f.content },
          })),
        }
      : null

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
    let finalJsonLd
    if (lang === 'en' && tour.enTouristTrip) {
      const stripCtx = (node) => { const rest = { ...node }; delete rest['@context']; return rest }
      const nodes = [
        tour.enTouristTrip,
        ...(tour.enBreadcrumb ? [tour.enBreadcrumb] : []),
        ...(tour.enRouteMapImage ? [tour.enRouteMapImage] : []),
        ...(heroImageObject ? [heroImageObject] : []),
        ...(faqNode ? [faqNode] : []),
      ]
      finalJsonLd = { '@context': 'https://schema.org', '@graph': nodes.map(stripCtx) }
    } else {
      const extra = [
        ...(heroImageObject ? [heroImageObject] : []),
        ...(faqNode ? [faqNode] : []),
      ]
      finalJsonLd = extra.length
        ? { '@context': 'https://schema.org', '@graph': [jsonLd, ...extra] }
        : jsonLd
    }

    return {
      title, description, keywords, path: `${prefix}/${slug}`,
      image: tour.heroImage, imageAlt: heroAlt,
      ogImage: tour.ogImage?.src, ogImageWidth: tour.ogImage?.width, ogImageHeight: tour.ogImage?.height,
      jsonLd: finalJsonLd,
    }
  }, [tour, tt, slug, lang])
  useSEO({ ...tourSeo, lang })

  const navSections = useMemo(() => {
    if (!tour) return []
    const ttLocal = tourTranslations?.[tour.slug]
    const itinerary = ttLocal?.itinerary || tour.itinerary
    const hasPrice = (tour.pricing?.length > 0) || (tour.type === 'group' && tour.pricePerPerson)

    // Order must mirror the on-page section order:
    // Gallery → Overview → Itinerary → Accommodation → Pricing → Map → Book
    const sections = []
    if (tour.gallery?.length > 0) sections.push({ id: 'gallery', labelKey: 'tour.gallery' })
    sections.push({ id: 'overview', labelKey: 'tour.overview' })
    if (itinerary?.length > 0) sections.push({ id: 'itinerary', labelKey: 'tour.itinerary' })
    if (tour.accommodations?.length > 0) sections.push({ id: 'accommodation', labelKey: 'pricing.accommodations' })
    if (hasPrice) sections.push({ id: 'pricing', labelKey: 'tour.pricing' })
    if (tour.map?.center) sections.push({ id: 'tour-map', labelKey: 'tour.map' })
    sections.push({ id: 'book', labelKey: 'tour.book' })
    return sections
  }, [tour, tourTranslations])

  // Localize gallery alt/caption at the render boundary: the shared Gallery reads
  // plain `caption`/`description` strings, so items that carry a per-locale `alt`
  // object (e.g. the Gudauri gallery) resolve to the active language here —
  // mirroring the hero's imageMeta.alt[lang]. Older galleries whose items have no
  // `alt` pass through unchanged.
  const localizedGallery = useMemo(
    () => (tour?.gallery || []).map((img) =>
      img.alt ? { ...img, description: img.alt[lang] || img.alt.en } : img
    ),
    [tour, lang]
  )

  if (!tour) {
    return (
      <section className="td-not-found">
        <div>
          <h2>{t('tour.notFound')}</h2>
          <p>{t('tour.notFoundText')}</p>
        </div>
      </section>
    )
  }

  const isGroup = tour.type === 'group'
  const itineraryItems = tt?.itinerary || tour.itinerary
  const includedItems = tt?.included || tour.included
  const notIncludedItems = tt?.notIncluded || tour.notIncluded
  const rightForYouItems = tt?.rightForYou || tour.rightForYou
  const faqList = tt?.faq || tour.faq
  // Auto-link destination mentions in the itinerary day + FAQ answer HTML. Plain
  // functions (not the hooks) because this runs after the `!tour` early return.
  const linkedItinerary = (itineraryItems || []).map((it) => ({ ...it, content: autolinkHtml(it.content, lang, pages) }))
  const linkedFaq = (faqList || []).map((it) => ({ ...it, content: autolinkHtml(it.content, lang, pages) }))

  // Extract starting price
  const startingPrice = isGroup
    ? (tour.pricePerPerson ? parseFloat(tour.pricePerPerson.replace(/[^0-9.]/g, '')) : null)
    : getStartingPrice(tour.pricing)

  // Tour highlights for the overview. Prefer an explicit `highlights` list
  // (translated or base) when a tour provides one; otherwise fall back to the
  // first 4 included items so tours without highlights are unchanged.
  const highlightItems = tt?.highlights || tour.highlights || (includedItems ? includedItems.slice(0, 4) : [])

  return (
    <>
      <TourDetailHero
        tour={tour}
        translatedTitle={tt?.title}
        heroH1={tt?.heroH1 || tour.heroH1}
        heroSubtitle={tt?.heroSubtitle || tour.heroSubtitle}
        heroFacts={tt?.heroFacts || tour.heroFacts}
        isGroup={isGroup}
        startingPrice={startingPrice}
      />

      <TourSectionNav sections={navSections} />

      <div className="td-layout">
        <main className="td-main">
          {/* Route-map infographic — English only (baked-in English text) and
              only on the Gudauri ski tour. Native 642x428, below the fold
              (hero is 100vh) so lazy; hero owns LCP, no fetchpriority. */}
          {lang === 'en' && slug === '7-day-gudauri-ski-tour-from-tbilisi' && (
            <figure className="body-img body-img--wide">
              {/* Click/keyboard-open the infographic in the shared lightbox. Only
                  the image is the click target (caption stays outside), mirroring
                  the gallery-card pattern; the <picture>/<img> below are unchanged. */}
              <div
                ref={routeMapTrigger}
                className="body-img__btn"
                role="button"
                tabIndex={0}
                aria-label="Open Gudauri ski tour route map"
                onClick={() => setRouteMapOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setRouteMapOpen(true)
                  }
                }}
              >
                <picture>
                  <source type="image/avif" srcSet="/images/files/gudauri-ski-tour-route-map-georgia.avif" />
                  <source type="image/webp" srcSet="/images/files/gudauri-ski-tour-route-map-georgia.webp" />
                  <img
                    src="/images/files/gudauri-ski-tour-route-map-georgia.png"
                    width="642"
                    height="428"
                    loading="lazy"
                    decoding="async"
                    alt="Route map of the 7-day Gudauri winter ski tour: Tbilisi to Gudauri via the Georgian Military Highway, with a scenic stop at Ananuri Fortress and the Russia–Georgia Friendship Monument; five nights in Gudauri and one in Tbilisi."
                  />
                </picture>
              </div>
              <figcaption>The 7-day route: Tbilisi to Gudauri and back, via the Georgian Military Highway.</figcaption>
              {routeMapOpen && (
                <GalleryLightbox
                  images={[{
                    src: '/images/files/gudauri-ski-tour-route-map-georgia.png',
                    caption: 'The 7-day route: Tbilisi to Gudauri and back, via the Georgian Military Highway.',
                  }]}
                  startIndex={0}
                  label="Gudauri ski tour route map"
                  onClose={() => { setRouteMapOpen(false); routeMapTrigger.current?.focus() }}
                />
              )}
            </figure>
          )}

          {/* Gallery — placed before Overview so photos lead the page. */}
          {tour.gallery && tour.gallery.length > 0 && (
            <section id="gallery" className="td-section">
              <FadeUp>
                <h2 className="td-section__title">{t('tour.gallery')}</h2>
                <p className="td-section__subtitle">{t('tour.gallerySubtitle')}</p>
              </FadeUp>
              <Gallery images={localizedGallery} />
            </section>
          )}

          {/* 1. Overview */}
          <section id="overview" className="td-section">
            <FadeUp>
              <h2 className="td-section__title">{t('tour.overview')}</h2>
              {/* Render the overview as one <p> per paragraph (split on blank
                  lines). Single-paragraph descriptions are unchanged (one <p>);
                  only descriptions that contain blank-line breaks render multiple
                  paragraphs. */}
              {(tt?.description || tour.description || '').split(/\n{2,}/).map((para, i) => (
                <p key={i} className="td-overview__text">{autolinkNodes(para, lang, pages)}</p>
              ))}

              {highlightItems.length > 0 && (
                <div className="td-overview__highlights">
                  {highlightItems.map((item, i) => (
                    <div key={i} className="td-overview__highlight">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{autolinkNodes(item.replace(/;$/, ''), lang, pages)}</span>
                    </div>
                  ))}
                </div>
              )}
            </FadeUp>
          </section>

          {/* Group Tour Summary */}
          {isGroup && (tt?.groupSummary || tour.groupSummary) && (
            <section className="td-section">
              <FadeUp>
                <div className="tour-group-summary tour-summary-premium">
                  {(tt?.groupSummary || tour.groupSummary).map((item, i) => (
                    <div key={i} className="summary-item">
                      <strong>{item.label}</strong>
                      {item.type === 'dates' ? (
                        <div className="dates-list">
                          {item.values.map((v, j) => {
                            const dateText = typeof v === 'string' ? v : v.text
                            const soldOut = typeof v === 'object' && v.soldOut
                            return (
                              <div
                                key={j}
                                className={`date-range ${soldOut ? 'date-range--sold-out' : 'date-range--available'}`}
                              >
                                <span className="date-range__text">{dateText}</span>
                                <span className="date-range__status">
                                  {soldOut ? t('tour.soldOut') : t('tour.available')}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div>{item.value}</div>
                      )}
                    </div>
                  ))}
                </div>
              </FadeUp>
            </section>
          )}

          {/* 3. Itinerary */}
          {itineraryItems && itineraryItems.length > 0 && (
            <section id="itinerary" className="td-section">
              <FadeUp>
                <Accordion items={linkedItinerary} itinerary />
              </FadeUp>
            </section>
          )}

          {/* 4. Accommodation */}
          <AccommodationSection accommodations={tour.accommodations} isGroup={isGroup} />

          {/* 5. Price */}
          <PriceSection
            isGroup={isGroup}
            pricing={tour.pricing}
            pricePerPerson={tour.pricePerPerson}
            singleSupplement={tour.singleSupplement}
            onSelectPackage={handleSelectPackage}
          />

          {/* 6. What's included and not included */}
          {(includedItems || notIncludedItems) && (
            <section className="td-section">
              <FadeUp>
                <IncludedNotIncluded
                  included={includedItems}
                  notIncluded={notIncludedItems}
                />
              </FadeUp>
            </section>
          )}

          {/* Is this tour right for you? (only when the tour supplies the data) */}
          {rightForYouItems?.length > 0 && (
            <section className="td-section">
              <FadeUp>
                <h2 className="td-section__title">{t('tour.rightForYou')}</h2>
                <div className="td-overview__highlights">
                  {rightForYouItems.map((item, i) => (
                    <div key={i} className="td-overview__highlight">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </section>
          )}
        </main>
      </div>

      {/* 7. Map */}
      {tour.map && tour.map.center && (
        <section id="tour-map" className="td-map-section">
          <div className="td-map-card">
            <h2 className="td-section__title">{t('tour.routeMap')}</h2>
            {/* Held back until after hydration — see the same slot on HomePage.
                The placeholder is what both the static HTML and the first
                browser render show; the map arrives with its chunk as before. */}
            {!hydrated ? <section><div className="td-map" /></section> : (
            <Suspense fallback={<section><div className="td-map" /></section>}>
              <MapboxMap
                id="tour-map-canvas"
                center={tour.map.center}
                zoom={tour.map.zoom || 8}
                markers={tour.map.markers || []}
                routeCoordinates={tour.map.routeCoordinates || []}
                className="td-map"
              />
            </Suspense>
            )}
          </div>
        </section>
      )}

      {/* FAQ (only when the tour supplies the data) */}
      {faqList?.length > 0 && (
        <div className="td-layout">
          <main className="td-main">
            <section id="faq" className="td-section">
              <FadeUp>
                <Accordion items={linkedFaq} headingKey="faq.heroTitle" />
              </FadeUp>
            </section>
          </main>
        </div>
      )}

      {/* 8. Send inquiry */}
      <div className="td-layout">
        <main className="td-main">
          <section id="book" className="td-section td-book-inline">
            <FadeUp>
              <h2 className="td-section__title">{t('tour.bookThisTour')}</h2>
              {!isGroup && <p className="td-section__subtitle">{t('form.privateIntro')}</p>}
              <TourInquiryForm tourTitle={tour.tourFormTitle || tour.title} isGroupTour={isGroup} selectedPackage={packageSelection} />
            </FadeUp>
          </section>
        </main>
      </div>
    </>
  )
}
