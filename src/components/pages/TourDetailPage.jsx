import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import TourDetailHero from '../shared/TourDetailHero'
import TourSectionNav from '../shared/TourSectionNav'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import { AccommodationSection, PriceSection } from '../shared/PricingGrid'
import { getStartingPrice } from '../shared/pricingUtils'
import { buildTourSeo } from '../../utils/tourSeo'
import IncludedNotIncluded from '../shared/IncludedNotIncluded'
import TourInquiryForm from '../shared/TourInquiryForm'
import Gallery from '../shared/Gallery'
import { tours } from '../../data/tours'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { autolinkHtml } from '../../utils/autolink'
import { autolinkNodes } from '../../utils/autolinkReact'

export default function TourDetailPage() {
  const { slug } = useParams()
  const t = useT()
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
    const hasPrice = (tour.pricing?.length > 0) || (tour.type === 'group' && tour.pricePerPerson)

    // Order must mirror the on-page section order:
    // Gallery → Overview → Itinerary → Accommodation → Pricing → Book
    const sections = []
    if (tour.gallery?.length > 0) sections.push({ id: 'gallery', labelKey: 'tour.gallery' })
    sections.push({ id: 'overview', labelKey: 'tour.overview' })
    if (itinerary?.length > 0) sections.push({ id: 'itinerary', labelKey: 'tour.itinerary' })
    if (tour.accommodations?.length > 0) sections.push({ id: 'accommodation', labelKey: 'pricing.accommodations' })
    if (hasPrice) sections.push({ id: 'pricing', labelKey: 'tour.pricing' })
    sections.push({ id: 'book', labelKey: 'tour.book' })
    return sections
  }, [tour, tourTranslations])

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

  // Extract starting price
  const startingPrice = isGroup
    ? (tour.pricePerPerson ? parseFloat(tour.pricePerPerson.replace(/[^0-9.]/g, '')) : null)
    : getStartingPrice(tour.pricing)

  // Accommodation and Pricing are built here rather than inline because a group
  // tour renders them as one row (see below); every other tour renders exactly
  // the same two elements stacked, as before.
  const accommodationSection = (
    <AccommodationSection accommodations={tour.accommodations} isGroup={isGroup} />
  )
  const priceSection = (
    <PriceSection
      isGroup={isGroup}
      pricing={tour.pricing}
      pricePerPerson={tour.pricePerPerson}
      singleSupplement={tour.singleSupplement}
      onSelectPackage={handleSelectPackage}
    />
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
          {/* Gallery — placed before Overview so photos lead the page. The
              Gudauri ski tour's route map used to sit above this as its own
              English-only <figure> with a private one-image lightbox; it is now
              gallery tile #1 (see its entry in tours.js), so it shares the
              gallery's lightbox queue and renders in all 7 locales. */}
          {tour.gallery && tour.gallery.length > 0 && (
            <section id="gallery" className="td-section">
              <FadeUp>
                <h2 className="td-section__title">{t('tour.gallery')}</h2>
                <p className="td-section__subtitle">{t('tour.gallerySubtitle')}</p>
              </FadeUp>
              {/* The 5-day Tbilisi→Batumi route map is a normal gallery item
                  (the closing tile), not a separate block — see its entry in
                  tours.js. The gallery no longer folds after six photos, so it
                  needs no opt-out: every item is in the scroll strip from the
                  first paint. (`galleryShowAll` is left in tours.js, now inert —
                  removing it would be a data edit this task does not cover.) */}
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

          {/* 4. Accommodation and 5. Price. On a group tour both are short
              blocks, so above 1024px they share one row (.td-pair in
              ivory.css) instead of leaving two half-empty bands. They remain
              two separate sections with their own ids, headings and nav
              targets, in this same document order — the wrapper is a grid and
              nothing else. Private tours, whose pricing table is tall, keep
              them stacked. */}
          {isGroup ? (
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
          gallery. `tour.map` data stays in tours.js — MapboxMap itself is still
          used by HomePage. */}

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
              <h2 className="td-section__title">{t('tour.bookThisTour')}</h2>
              {!isGroup && <p className="td-section__subtitle">{t('form.privateIntro')}</p>}
              <TourInquiryForm tourTitle={tour.tourFormTitle || tour.title} selectedPackage={packageSelection} />
            </FadeUp>
          </section>
        </div>
      </div>

      {/* Mobile booking bar — CSS-gated to <=900px (see ivory.css), so it is
          inert on desktop. Shows the same starting price the pricing cards
          derive, in the same "starting from / per person" wording the sidebar
          and the cards already use; no new copy. */}
      {startingPrice && (
        <div className="iv-mobilebar">
          <span className="iv-mobilebar__price">
            <span className="iv-mobilebar__amount">€{startingPrice.toLocaleString('en-US')}</span>
            <span className="iv-mobilebar__note">
              {t('sidebar.startingFrom')} · {t('pricing.perPerson')}
            </span>
          </span>
          <a href="#book" className="iv-pill iv-mobilebar__cta" onClick={(e) => {
            e.preventDefault()
            document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
          }}>
            {t('tour.bookNow')}
          </a>
        </div>
      )}
    </>
  )
}
