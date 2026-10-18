import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import TourDetailHero from '../shared/TourDetailHero'
import TourSectionNav from '../shared/TourSectionNav'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import { AccommodationSection, PriceSection } from '../shared/PricingGrid'
import { getStartingPrice, formatPrice } from '../shared/pricingUtils'
import { buildTourSeo } from '../../utils/tourSeo'
import IncludedNotIncluded from '../shared/IncludedNotIncluded'
import TourInquiryForm from '../shared/TourInquiryForm'
import Gallery from '../shared/Gallery'
import StickyRequestBar from '../shared/StickyRequestBar'
import GroupTourFamily from '../shared/GroupTourFamily'
import ScheduledTourDepartures, { DATES_ANCHOR_ID } from '../shared/ScheduledTourDepartures'
import TourCard from '../shared/TourCard'
import { tours } from '../../data/tours'
import { formatDepartureDate, hasScheduledDepartures } from '../../data/groupDepartures'
import { PRIVATE_TOUR_CATEGORIES } from '../../data/tourCategories'
import { contactInfo } from '../../data/siteData'
import { trackEvent } from '../../utils/analytics'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { autolinkHtml } from '../../utils/autolink'
import { autolinkNodes } from '../../utils/autolinkReact'

export default function TourDetailPage() {
  const { slug } = useParams()
  const { hash } = useLocation()
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations, pages } = useContext(I18nContext)

  // Package chosen from a pricing card's "Request this tour" button. `nonce` increments on
  // every click so the inquiry form re-applies the selection even when the same
  // package is clicked again, while leaving the user's manual choice untouched
  // between clicks. Kept here (shared parent of the price section and the form).
  const [packageSelection, setPackageSelection] = useState({ value: '', nonce: 0 })
  const handleSelectPackage = useCallback((value) => {
    setPackageSelection((prev) => ({ value, nonce: prev.nonce + 1 }))
  }, [])

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  const tour = tours.find((t) => t.slug === slug)
  const tt = tourTranslations?.[slug]

  // Built by src/utils/tourSeo.js so scripts/prerender.js can produce the very
  // same graph at build time — see that module for why it is not inline here.
  const tourSeo = useMemo(() => buildTourSeo({ tour, tt, lang }), [tour, tt, lang])
  useSEO({ ...tourSeo, lang })

  const navSections = useMemo(() => {
    if (!tour) return []
    const ttLocal = tourTranslations?.[tour.slug]
    const itinerary = ttLocal?.itinerary || tour.itinerary
    // A fixed-price tour (priceType: 'fixed') shows its one price in the hero
    // and the booking bars; a separate Pricing section would only repeat it.
    const hasPrice = tour.priceType !== 'fixed'
      && ((tour.pricing?.length > 0) || (tour.type === 'group' && tour.pricePerPerson))

    // Order must mirror the on-page section order. A scheduled group tour
    // leads with the Overview (what the trip is, who it is for), then its
    // departures strip ("Dates", at the end of the Overview, only when the
    // tour has a `groupDates` calendar), and shows the Gallery after it;
    // private tours keep photos first and never get a Dates pill:
    // Gallery → Overview → [Dates] → Itinerary → Accommodation → Pricing → Book
    const sections = []
    const gallery = tour.gallery?.length > 0 ? { id: 'gallery', labelKey: 'tour.gallery' } : null
    const overviewFirst = tour.type === 'group'
    if (gallery && !overviewFirst) sections.push(gallery)
    sections.push({ id: 'overview', labelKey: 'tour.overview' })
    if (hasScheduledDepartures(tour)) sections.push({ id: DATES_ANCHOR_ID, labelKey: 'tour.dates' })
    if (gallery && overviewFirst) sections.push(gallery)
    if (itinerary?.length > 0) sections.push({ id: 'itinerary', labelKey: 'tour.itinerary' })
    if (tour.accommodations?.length > 0) sections.push({ id: 'accommodation', labelKey: 'pricing.accommodations' })
    if (hasPrice) sections.push({ id: 'pricing', labelKey: 'tour.pricing' })
    sections.push({ id: 'book', labelKey: 'tour.book' })
    return sections
  }, [tour, tourTranslations])

  // A link straight to one of the page's own sections — the homepage
  // flagship's "Choose a departure" action lands on #book, and #dates is the
  // scheduled tours' departure strip. The shared ScrollToTop resets the
  // window to 0 on every route change in this same commit, so the jump is
  // deferred a tick to run after it; a direct page load with the hash is
  // reset by that same effect after hydration, so this covers both. Only ids
  // the section nav itself offers are honoured.
  useEffect(() => {
    const id = hash.slice(1)
    if (!id || !navSections.some((s) => s.id === id)) return undefined
    const timer = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150)
    return () => clearTimeout(timer)
  }, [hash, slug, navSections])

  // Localize gallery alt/caption at the render boundary: the shared Gallery reads
  // plain `caption`/`description` strings, so items that carry a per-locale `alt`
  // object (e.g. the Gudauri gallery) resolve to the active language here —
  // mirroring the hero's imageMeta.alt[lang]. Older galleries whose items have no
  // `alt` pass through unchanged.
  // A `caption` may likewise be a per-locale object (the 5-day Tbilisi→Batumi
  // gallery). Gallery renders the caption as both the visible <figcaption> title
  // and the <img> alt, so resolving it here is what keeps English captions off
  // the six non-English pages. String captions are left exactly as they are, so
  // every other tour gallery is untouched.
  const localizedGallery = useMemo(
    () => (tour?.gallery || []).map((img) => {
      const withAlt = img.alt ? { ...img, description: img.alt[lang] || img.alt.en } : img
      // `altText` (per-locale) is the <img alt> when it must differ from the
      // visible caption; Gallery falls back to the caption when it is absent.
      const withImgAlt = img.altText ? { ...withAlt, imgAlt: img.altText[lang] || img.altText.en } : withAlt
      return img.caption && typeof img.caption === 'object'
        ? { ...withImgAlt, caption: img.caption[lang] || img.caption.en }
        : withImgAlt
    }),
    [tour, lang]
  )

  // Similar tours: same primary category first, then nearest duration —
  // deterministic, no randomness, current tour always excluded. A tour with
  // no category entry (the group tour, the 10-Day Georgia+Armenia combined
  // tour) simply never matches on category and falls back to pure duration
  // proximity, which is still a sensible ordering. Declared before the
  // `!tour` early return below so this hook always runs (rules of hooks).
  const similarTours = useMemo(() => {
    if (!tour) return []
    const primaryCategory = PRIVATE_TOUR_CATEGORIES[tour.slug]?.[0]
    return tours
      .filter((candidate) => candidate.slug !== tour.slug)
      .map((candidate) => ({
        candidate,
        sameCategory: PRIVATE_TOUR_CATEGORIES[candidate.slug]?.[0] === primaryCategory ? 0 : 1,
        durationDiff: Math.abs((candidate.days || 0) - (tour.days || 0)),
      }))
      .sort((a, b) => a.sameCategory - b.sameCategory || a.durationDiff - b.durationDiff)
      .slice(0, 3)
      .map((r) => r.candidate)
  }, [tour])

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
  // Auto-link destination mentions in the itinerary day HTML. A plain function
  // (not the hook) because this runs after the `!tour` early return. The FAQ
  // answers used to be linked here too; that went with the FAQ section.
  // Ivory-badge pilot additions, both opt-in per tour:
  //  * `media` — the photo shown beside a day's text, taken from the tour's own
  //    gallery by index (`dayGallery`), so it arrives already localized.
  //  * `siteChip` — the per-day count of named stops. `enDaySites` is English
  //    copy, so it is read on the English page only; the six translated pages
  //    show exactly the duration chips they showed before.
  const daySites = lang === 'en' ? tour.enDaySites : null
  const linkedItinerary = (itineraryItems || []).map((it, i) => {
    const mediaIndex = tour.dayGallery?.[i]
    const media = typeof mediaIndex === 'number' ? localizedGallery[mediaIndex] : null
    const count = daySites?.[i]
    return {
      ...it,
      content: autolinkHtml(it.content, lang, pages),
      ...(media ? { media } : {}),
      ...(count ? { siteChip: `${count} sites` } : {}),
    }
  })

  // Scheduled group tours book one of their published departures, never a
  // free date: one option per `groupDates` entry, labelled in the page's
  // language (`tt.departures`, same order) and submitted with the canonical
  // ISO window so the inquiry email is unambiguous in every locale. The same
  // array feeds the "2027 departures" strip at the end of the Overview, the
  // one place that shows each window's booking deadline ("Book by 11 May
  // 2027", derived in groupDepartures.js as 30 calendar days before the
  // start); the dropdown shows the dates only.
  const departures = hasScheduledDepartures(tour)
    ? tour.groupDates.map((d, i) => ({
        value: d.iso || `${d.start} ${d.year} – ${d.end} ${d.year}`,
        label: tt?.departures?.[i] || `${d.start} – ${d.end} ${d.year}`,
        soldOut: Boolean(d.soldOut),
        bookingDeadline: d.bookingDeadline || null,
        deadlineLabel: d.bookingDeadline ? t('tour.bookBy', { date: formatDepartureDate(d.bookingDeadline, lang) }) : '',
      }))
    : null
  const departureYear = departures ? [...new Set(tour.groupDates.map((d) => d.year))].join('/') : ''

  // Extract starting price
  const startingPrice = isGroup
    ? (tour.pricePerPerson ? parseFloat(tour.pricePerPerson.replace(/[^0-9.]/g, '')) : null)
    : getStartingPrice(tour.pricing)

  // Accommodation and Pricing are built here rather than inline because a group
  // tour renders them as one row (see below); every other tour renders exactly
  // the same two elements stacked, as before.
  const accommodationSection = (
    <AccommodationSection
      accommodations={tour.accommodations}
      isGroup={isGroup}
      singleOption={tour.accommodationMode === 'single'}
    />
  )
  // Fixed-price tours (priceType: 'fixed') carry their one price in the hero
  // and the booking bars, so they render no Pricing section at all.
  const fixedPrice = tour.priceType === 'fixed'
  const priceSection = fixedPrice ? null : (
    <PriceSection
      isGroup={isGroup}
      pricing={tour.pricing}
      pricePerPerson={tour.pricePerPerson}
      singleSupplement={tour.singleSupplement}
      onSelectPackage={handleSelectPackage}
      singleOption={tour.accommodationMode === 'single'}
    />
  )

  // Gallery section, built once so the two render positions (before or after
  // the Overview) are the same element.
  const galleryAfterOverview = isGroup
  const gallerySection = (
    <section id="gallery" className="td-section">
      <FadeUp>
        <h2 className="td-section__title">{t('tour.gallery')}</h2>
        <p className="td-section__subtitle">{t('tour.gallerySubtitle')}</p>
      </FadeUp>
      {/* The 5-day Tbilisi→Batumi route map is a normal gallery item (the
          closing tile), not a separate block — see its entry in tours.js. The
          gallery no longer folds after six photos, so it needs no opt-out:
          every item is in the scroll strip from the first paint.
          (`galleryShowAll` is left in tours.js, now inert.) */}
      <Gallery images={localizedGallery} />
    </section>
  )

  // The icon list of tour highlights that used to sit between the Overview
  // paragraphs and the Itinerary is no longer rendered. The `highlights` arrays
  // stay in tours.js and in the locale files — nothing else in the project
  // reads them, but they are the authored copy and removing the rendering is
  // what was asked for. Overview now runs straight into Itinerary.

  return (
    <>
      <TourDetailHero
        tour={tour}
        translatedTitle={tt?.title}
        heroH1={tt?.heroH1 || tour.heroH1}
        isGroup={isGroup}
        /* The hero's "N sites" chip and its panel are English copy (see
           `enSites` in tours.js) and an opt-in per tour, so every other tour
           and every translated page renders the chips row unchanged. */
        sites={lang === 'en' ? tour.enSites : null}
        /* Same number as the mobile booking bar and the pricing cards —
           derived once, here, so the hero can never quote a stale price. */
        startingPrice={startingPrice}
      />

      <TourSectionNav sections={navSections} />

      <div className="td-layout">
        <div className="td-main">
          {/* Gallery — on private tours placed before Overview so photos lead
              the page; on a scheduled group tour it follows the Overview (see
              `galleryAfterOverview`), so a visitor reads what the trip is, who
              it is for and the group size before a 26-photo strip. The
              Gudauri ski tour's route map used to sit above this as its own
              English-only <figure> with a private one-image lightbox; it is now
              gallery tile #1 (see its entry in tours.js), so it shares the
              gallery's lightbox queue and renders in all 7 locales. */}
          {tour.gallery && tour.gallery.length > 0 && !galleryAfterOverview && gallerySection}

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
              {/* One compact line of booking facts that belong with the
                  overview rather than in a facts table: who the tour is for
                  and how large the group is. Opt-in per tour (`adultsOnly`,
                  `groupSize`, `inquiryTravelers`), so every other tour renders
                  exactly as before. */}
              {(tour.adultsOnly || tour.groupSize) && (
                <p className="td-overview__facts">
                  {[
                    tour.adultsOnly ? t('tour.adultsOnly') : null,
                    tour.groupSize ? t('tour.groupSizeRange', { min: tour.groupSize.min, max: tour.groupSize.max }) : null,
                    /* The operating group size is not the party size: a tour whose
                       inquiry minimum is 1 says so, in one short sentence. */
                    tour.inquiryTravelers?.min === 1 ? t('tour.soloWelcome') : null,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </FadeUp>
            {/* The scheduled windows with their booking deadlines, right
                under the facts line, so what / who / when read as one block
                before the family chooser and the gallery. Same array as the
                inquiry dropdown (which shows dates only); nothing else on the
                page repeats these dates. Its own box, not inside the FadeUp
                above: it is the #dates anchor of the section nav. */}
            {departures && <ScheduledTourDepartures departures={departures} year={departureYear} />}
          </section>

          {/* The three scheduled Caucasus group tours share one departure
              calendar; this compact chooser (duration · countries · fixed
              price, the open tour marked) renders only on a tour that belongs
              to such a family, so every other page is untouched. */}
          {isGroup && <GroupTourFamily current={tour} />}

          {tour.gallery && tour.gallery.length > 0 && galleryAfterOverview && gallerySection}

          {/* The group-tour facts table (type / countries / route / duration /
              age / group size / dates / price / supplement / meals / borders)
              used to render here from `groupSummary`. Removed: every one of
              those facts is already shown once where it is used — the hero
              chips, the overview line below, the itinerary, the inclusions
              and the departure dropdown in the inquiry form. */}

          {/* 3. Itinerary */}
          {itineraryItems && itineraryItems.length > 0 && (
            <section id="itinerary" className="td-section">
              <FadeUp>
                <Accordion items={linkedItinerary} itinerary />
              </FadeUp>
            </section>
          )}

          {/* 4. Accommodation and 5. Price. On a group tour both are short
              blocks, so above 1024px they share one row (.td-pair in
              ivory.css) instead of leaving two half-empty bands. They remain
              two separate sections with their own ids, headings and nav
              targets, in this same document order — the wrapper is a grid and
              nothing else. Private tours, whose pricing table is tall, keep
              them stacked. */}
          {isGroup && priceSection ? (
            <div className="td-pair">
              {accommodationSection}
              {priceSection}
            </div>
          ) : (
            <>
              {accommodationSection}
              {priceSection}
            </>
          )}

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

          {/* The "Is this tour right for you?" suitability section was retired
              from the tour-detail template. It sat here, between What's
              Included/Not Included and the FAQ, and rendered `tour.rightForYou`
              (or its per-locale override). Removed centrally so no current or
              future tour can show it; the remaining `rightForYou` data was
              deleted with it. */}
        </div>
      </div>

      {/* The standalone interactive route map used to sit here. It was removed
          because the route is already shown by the route-map image inside the
          gallery. `tour.map` data stays in tours.js. MapboxMap and the rest of
          the Mapbox infrastructure are kept but currently have no consumer —
          the homepage map, its last one, has since been removed too. */}

      {/* The FAQ section sat here, between What's Included/Not Included and the
          inquiry form, as its own `<div class="td-layout">` wrapper with a
          `#faq` section. Removed centrally, so no current or future tour renders
          one. It was the last block on the page before the form, so nothing
          needed re-joining — What's Included now runs straight into Book This
          Tour. The `faq` arrays stay in tours.js and the locale files, and the
          shared Accordion is untouched: the itinerary uses it here, and a dozen
          other page types (city, region, site, blog, airport, the main FAQ
          page) still render their own FAQs with it. */}

      {/* 8. Send inquiry */}
      <div className="td-layout">
        <div className="td-main">
          <section id="book" className="td-section td-book-inline">
            <FadeUp>
              {/* A scheduled group tour is requested, not booked on the spot:
                  the heading says so, the intro sets the expectation (we reply
                  with availability; the request is not yet a booking) and the
                  one trust line puts the operator and its real review page
                  next to the decision. Private tours keep their own copy. */}
              <h2 className="td-section__title">{isGroup ? t('tour.requestThisTour') : t('tour.bookThisTour')}</h2>
              <p className="td-section__subtitle">{isGroup ? t('form.groupIntro') : t('form.privateIntro')}</p>
              {isGroup && (
                <p className="td-book__trust">
                  <span>{t('home.trustItem1Title')}</span>
                  <span aria-hidden="true"> · </span>
                  <a href={contactInfo.tripadvisorUrl} target="_blank" rel="noopener noreferrer">{t('home.trustTripadvisorLink')}</a>
                </p>
              )}
              <TourInquiryForm
                tourTitle={tour.tourFormTitle || tour.title}
                tourSlug={tour.slug}
                selectedPackage={packageSelection}
                hideAccommodationType={tour.accommodationMode === 'single'}
                departures={departures}
                travelerRange={isGroup ? (tour.inquiryTravelers || tour.groupSize) : null}
              />
            </FadeUp>
          </section>
        </div>
      </div>

      {/* 9. Similar tours — after the booking form, before the footer (the
          footer itself is rendered by the shared Layout, outside this page).
          Reuses TourCard exactly as /private-tours does. */}
      {similarTours.length > 0 && (
        <section className="tour-listing" aria-label={t('tour.similarTours')}>
          <FadeUp>
            <h2 className="td-section__title" style={{ textAlign: 'center' }}>{t('tour.similarTours')}</h2>
          </FadeUp>
          {similarTours.map((similar, index) => (
            <TourCard
              key={similar.slug}
              tour={similar}
              translation={tourTranslations?.[similar.slug]}
              index={index}
              basePath={similar.type === 'group' ? '/group-tours' : '/private-tours'}
            />
          ))}
        </section>
      )}

      {/* Desktop sticky request bar — shows once #td-hero-cta (the hero's own
          CTA) scrolls out of view; inert ≤900px, where the mobile bar below
          already covers the same job. */}
      <StickyRequestBar startingPrice={startingPrice} fixedPrice={fixedPrice} tourSlug={tour.slug} />

      {/* Mobile booking bar — CSS-gated to <=900px (see ivory.css), so it is
          inert on desktop. Shows the same starting price the pricing cards
          derive, in the same "starting from / per person" wording the sidebar
          and the cards already use; no new copy. */}
      {startingPrice && (
        <div className="iv-mobilebar">
          <span className="iv-mobilebar__price">
            <span className="iv-mobilebar__amount">{formatPrice(startingPrice)}</span>
            <span className="iv-mobilebar__note">
              {fixedPrice ? t('pricing.perPerson') : `${t('sidebar.startingFrom')} · ${t('pricing.perPerson')}`}
            </span>
          </span>
          {/* Same wording as the hero and the desktop bar: the form sends a
              request, nothing is booked on the spot, so the bar never says
              "Book Now". */}
          <a href="#book" className="iv-pill iv-mobilebar__cta" onClick={(e) => {
            e.preventDefault()
            trackEvent('tour_request_cta_click', { tour: tour.slug, placement: 'mobile_bar' })
            document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            {t('tour.requestThisTour')}
          </a>
        </div>
      )}
    </>
  )
}
