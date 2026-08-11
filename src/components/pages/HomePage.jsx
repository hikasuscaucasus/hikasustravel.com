import { lazy, Suspense, useContext } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import BlurUpBackground from '../shared/BlurUpBackground'
// mapbox-gl is ~450 kB gzipped. Loading it lazily keeps it out of the main
// bundle, so it no longer downloads on the ~370 routes that render no map at
// all, and here it arrives after the page itself rather than blocking it.
const MapboxMap = lazy(() => import('../shared/MapboxMap'))
import Testimonials from '../shared/Testimonials'
import ContactForm from '../shared/ContactForm'
import { tours } from '../../data/tours'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import LocaleLink from '../../i18n/LocaleLink'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import useIsHydrated from '../../hooks/useIsHydrated'
import { getSEO } from '../../data/seoData'

export default function HomePage() {
  const t = useT()
  const hydrated = useIsHydrated()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const seo = getSEO('home', lang)
  useSEO({ ...seo, lang, image: '/images/files/georgia-home.jpg' })

  // Eagerly load tour translations for homepage tiles
  if (!tourTranslations) loadTourTranslations()

  return (
    <>
      <HeroSection
        image="/images/files/Sighnaghi.jpg"
        title={t('home.heroTitle')}
      />

      <section className="home-items">
        <div className="home-items">
          <FadeUp>
            <h2>{t('home.exploreTitle')}</h2>
          </FadeUp>
          <p>{t('home.exploreText')}</p>
          <FadeUp>
            <div className="button">
              <p><LocaleLink to="/private-tours">{t('home.startJourney')}</LocaleLink></p>
            </div>
          </FadeUp>
        </div>
      </section>

      {(() => {
        const groupTour = tours.find((tour) => tour.type === 'group')
        if (!groupTour) return null
        const tt = tourTranslations?.[groupTour.slug]
        return (
          <section className="home-items">
            <div className="tour-listing" style={{ background: 'none', maxWidth: '1600px' }}>
              <FadeUp>
                <div className="tour-item tour-item-card">
                  <LocaleLink
                    to={`/group-tours/${groupTour.slug}`}
                    className="tour-image-link"
                    aria-label={tt?.title || groupTour.title}
                  >
                    <BlurUpBackground
                      src={groupTour.listingImage || groupTour.heroImage}
                      className="tour-image"
                    >
                      <div className="tour-image-scrim" aria-hidden="true" />
                    </BlurUpBackground>
                  </LocaleLink>
                  <div className="tour-info">
                    <h2>
                      <LocaleLink to={`/group-tours/${groupTour.slug}`}>{tt?.title || groupTour.title}</LocaleLink>
                    </h2>
                    <h3>{groupTour.days} {t('tour.days')}</h3>
                    <p>{tt?.listingDescription || tt?.description || groupTour.listingDescription || groupTour.description}</p>
                    <div className="more">
                      <LocaleLink to={`/group-tours/${groupTour.slug}`}>{t('tour.moreInfo')}</LocaleLink>
                    </div>
                  </div>
                  <div className="tour-data">
                    {groupTour.groupDates && (
                      <>
                        <div className="available">{t('tour.availableDates')}</div>
                        <div className="date-chips">
                          {groupTour.groupDates
                            .filter((d) => !(d.start === '23 May' && d.end === '5 June' && d.year === '2026'))
                            .map((d, i) => (
                            <div key={i} className="date-chip">
                              <span className="date-range">{d.start} – {d.end}</span>
                              <span className="date-year">{d.year}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    {groupTour.pricePerPerson && (
                      <div className="tour-data-price">{t('tour.perPerson', { price: groupTour.pricePerPerson })}</div>
                    )}
                  </div>
                </div>
              </FadeUp>
            </div>
          </section>
        )
      })()}

      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <h2>{t('tour.privateTours')}</h2>
          </FadeUp>
          <FadeUp>
            <div className="tours-grid tours-grid--private-home">
              {tours.filter((tour) => tour.type === 'private').map((tour) => {
                const tt = tourTranslations?.[tour.slug]
                const classicRow = tour.pricing?.find((r) => r.travelers === '4')
                const classicNum = classicRow ? parseFloat((classicRow.economy || '').replace(/[^0-9.]/g, '')) : NaN
                const priceFrom = !isNaN(classicNum) && classicNum > 0 ? `€${classicNum.toLocaleString('en-US')}` : null
                return (
                  <div className="tour-tile" key={tour.slug}>
                    <LocaleLink
                      to={`/${tour.type === 'group' ? 'group-tours' : 'private-tours'}/${tour.slug}`}
                      className="tour-tile-link"
                    >
                      <BlurUpBackground
                        src={tour.tileImage || tour.heroImage}
                        position={tour.cardPosition}
                        className="tour-tile-image"
                      />
                      <div className="tour-tile-overlay">
                        <h3>{tt?.title || tour.title}</h3>
                        <p>{tour.days} {t('tour.days')}</p>
                        {priceFrom && (
                          <p className="tour-tile-overlay__price">{t('tour.pricesFrom', { price: priceFrom })}</p>
                        )}
                      </div>
                    </LocaleLink>
                  </div>
                )
              })}
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="home-items">
        <div className="home-items">
          <FadeUp>
            <h2>{t('home.shuttleTitle')}</h2>
          </FadeUp>
          <p>{t('home.shuttleText')}</p>
          <FadeUp>
            <div className="button">
              <p><LocaleLink to="/shuttle-service">{t('home.shuttleLink')}</LocaleLink></p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className="home-items">
        <div className="home-items">
          <FadeUp>
            <h2>{t('home.contactTitle')}</h2>
          </FadeUp>
          <ContactForm />
        </div>
      </section>

      {/* Fallback mirrors MapboxMap's own wrapper so the slot keeps its height
          (.page-map is 70vh) and nothing shifts when the map arrives.
          The map is held back until after hydration (useIsHydrated) so the
          static HTML and the first browser render both show this placeholder.
          Rendering the map at build time instead would put markup in the HTML
          that the hydrating render — still waiting on the mapbox chunk — cannot
          match. A visitor sees no difference: the map already arrived with its
          chunk, after mount. */}
      {!hydrated ? <section><div className="page-map" /></section> : (
      <Suspense fallback={<section><div className="page-map" /></section>}>
        <MapboxMap
          id="map"
          center={[43.402090536365975, 42.22342174308285]}
          zoom={7}
          showGeorgiaBorders
          markers={[{
            coordinates: [43.402090536365975, 42.22342174308285],
            svgUrl: '/img/pennant.svg',
            width: 30,
            height: 36,
            offsetX: 20,
            offsetY: 5,
          }]}
          isHomePage
        />
      </Suspense>
      )}

      {/* Testimonials */}
      <section className="td-testimonials-section">
        <FadeUp>
          <h2 className="td-section__title">{t('testimonials.title')}</h2>
          <Testimonials />
        </FadeUp>
      </section>
    </>
  )
}
