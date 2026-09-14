import { useContext, useMemo } from 'react'
import CardImage from '../shared/CardImage'
import FadeUp from '../shared/FadeUp'
import Breadcrumbs from '../shared/Breadcrumbs'
import ContactForm from '../shared/ContactForm'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import { featuredToursFor, tourHubRobots, tours, privateTourCountFor } from '../../data/tours'

const SITE_URL = 'https://www.hikasustravel.com'

const SEO_KEY = { georgia: 'toursGeorgia', armenia: 'toursArmenia', azerbaijan: 'toursAzerbaijan', caucasus: 'toursCaucasus' }
const TITLE_KEY = { georgia: 'home.hubTitleGeorgia', armenia: 'home.hubTitleArmenia', azerbaijan: 'home.hubTitleAzerbaijan', caucasus: 'home.hubTitleCaucasus' }
const INTRO_KEY = { georgia: 'home.hubIntroGeorgia', armenia: 'home.hubIntroArmenia', azerbaijan: 'home.hubIntroAzerbaijan', caucasus: 'home.hubIntroCaucasus' }
// Existing, already-published destination guides to link from each hub.
const GUIDE_LINKS = {
  georgia: [{ to: '/georgia', labelKey: 'nav.destinations.georgia' }],
  // Armenia/Azerbaijan additionally link their Ultimate Guide blog post —
  // neither country has standalone tours yet, so the guide is the one
  // concrete, already-published thing this hub can point a visitor to.
  armenia: [
    { to: '/blog/ultimate-guide-to-traveling-to-armenia', labelKey: 'home.readTravelGuide' },
    { to: '/armenia', labelKey: 'home.exploreDestinations' },
  ],
  azerbaijan: [
    { to: '/blog/ultimate-guide-to-traveling-to-azerbaijan', labelKey: 'home.readTravelGuide' },
    { to: '/azerbaijan', labelKey: 'home.exploreDestinations' },
  ],
  caucasus: [
    { to: '/georgia', labelKey: 'nav.destinations.georgia' },
    { to: '/armenia', labelKey: 'nav.destinations.armenia' },
    { to: '/azerbaijan', labelKey: 'nav.destinations.azerbaijan' },
  ],
}
// Available now (unlike a standalone Armenia tour), so it belongs on the
// Armenia hub even though it carries `country: "caucasus"` and therefore
// isn't among `featuredToursFor('armenia')`'s own results.
const GEORGIA_ARMENIA_TOUR_SLUG = '10-day-georgia-armenia-tour'

/**
 * Shared template for the four country tours hubs (/tours/georgia,
 * /tours/armenia, /tours/azerbaijan, /tours/caucasus). Indexability and
 * content are both driven by the SAME tour-count check
 * (`countryHasAnyTours`) — no manual toggle. Adding a tour with
 * `country: "<country>"` in src/data/tours.js is the only step required to
 * flip a hub from coming-soon/noindex to a real, indexed tour listing.
 * Georgia's hub always has tours (it's the default `tourCountry`), so it is
 * never in the coming-soon state the other three can be.
 */
export default function CountryToursHubPage({ country }) {
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  if (!tourTranslations) loadTourTranslations()

  const seo = getSEO(SEO_KEY[country], lang)

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t(TITLE_KEY[country]) },
  ]

  const extraTours = country === 'armenia'
    ? tours.filter((tour) => tour.slug === GEORGIA_ARMENIA_TOUR_SLUG)
    : []
  const countryTours = [...featuredToursFor(country), ...extraTours]
  const showToursGrid = countryTours.length > 0
  // Georgia's hub gets the same "See all N tours" link (same dynamic count
  // and reused translations as the homepage's Featured Tours tab) and
  // Scheduled Group Departures block the homepage already shows for Georgia.
  const georgiaTourCount = privateTourCountFor('georgia')
  const georgiaGroupTours = country === 'georgia' ? tours.filter((tour) => tour.type === 'group') : []

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: c.to ? `${SITE_URL}/${lang}${c.to === '/' ? '' : c.to}` : `${SITE_URL}/${lang}/tours/${country}`,
        })),
      },
    ],
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [lang, country, trail[1]?.name])

  useSEO({ ...seo, lang, robots: tourHubRobots(country), jsonLd })

  return (
    <>
      <section className="dest-title-band">
        <h1>{t(TITLE_KEY[country])}</h1>
      </section>
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <Breadcrumbs trail={trail} />
          </FadeUp>
          <FadeUp>
            <p>{t(INTRO_KEY[country])}</p>
          </FadeUp>

          {!showToursGrid && (
            <>
              <FadeUp>
                <p>{t('home.hubComingSoonText')}</p>
              </FadeUp>
              <FadeUp>
                <p className="city-ttd-cta">
                  <LocaleLink to="/contact" className="button">
                    {t('home.requestItinerary')}
                  </LocaleLink>
                </p>
              </FadeUp>
            </>
          )}

          {showToursGrid && (
            <FadeUp>
              <div className="tours-grid">
                {countryTours.map((tour) => {
                  const tt = tourTranslations?.[tour.slug]
                  const basePath = tour.type === 'group' ? 'group-tours' : 'private-tours'
                  // Same "Price from €X" computation FeaturedTourTile uses on
                  // the homepage's Featured Tours tiles — kept inline (rather
                  // than swapping in that component) so this page's tour
                  // titles stay <h2>, matching the page's own heading order
                  // under the <h1> title band above; FeaturedTourTile's own
                  // <h3> would skip a level here.
                  const classicRow = tour.pricing?.find((r) => r.travelers === '4')
                  const classicNum = classicRow ? parseFloat((classicRow.economy || '').replace(/[^0-9.]/g, '')) : NaN
                  const priceFrom = !isNaN(classicNum) && classicNum > 0 ? `€${classicNum.toLocaleString('en-US')}` : null
                  return (
                    <div className="tour-tile" key={tour.slug}>
                      <LocaleLink to={`/${basePath}/${tour.slug}`} className="tour-tile-link">
                        <CardImage
                          src={tour.tileImage || tour.heroImage}
                          position={tour.cardPosition}
                          className="tour-tile-image"
                        />
                        <div className="tour-tile-overlay">
                          <h2>{tt?.title || tour.title}</h2>
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
          )}

          {country === 'georgia' && (
            <FadeUp>
              <p className="city-ttd-cta">
                <LocaleLink to="/private-tours" className="button">
                  {t('home.seeAllGeorgiaTours', { n: georgiaTourCount })}
                </LocaleLink>
              </p>
            </FadeUp>
          )}

          {GUIDE_LINKS[country].length > 0 && (
            <FadeUp>
              <p className="city-ttd-cta">
                {GUIDE_LINKS[country].map((l) => (
                  <LocaleLink key={l.to} to={l.to} className="button">
                    {t(l.labelKey)}
                  </LocaleLink>
                ))}
              </p>
            </FadeUp>
          )}
        </div>
      </section>

      {/* Scheduled group departures — same block/markup as the homepage,
          reused rather than duplicated into a new component. Georgia-only:
          it is the sole country with a group tour today. */}
      {georgiaGroupTours.length > 0 && (
        <section className="home-items">
          <div className="tour-listing" style={{ background: 'none', maxWidth: '1600px' }}>
            <FadeUp>
              <h2>{t('home.groupDeparturesTitle')}</h2>
            </FadeUp>
            {georgiaGroupTours.map((groupTour) => {
              const tt = tourTranslations?.[groupTour.slug]
              return (
                <FadeUp key={groupTour.slug}>
                  <div className="tour-item tour-item-card">
                    <LocaleLink
                      to={`/group-tours/${groupTour.slug}`}
                      className="tour-image-link"
                      aria-label={tt?.title || groupTour.title}
                    >
                      <CardImage
                        src={groupTour.listingImage || groupTour.heroImage}
                        className="tour-image"
                      >
                        <div className="tour-image-scrim" aria-hidden="true" />
                      </CardImage>
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
                              .filter((d) => !d.soldOut)
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
              )
            })}
            <FadeUp>
              <p className="city-ttd-cta">
                <LocaleLink to="/group-tours" className="button">{t('home.allGroupTours')}</LocaleLink>
              </p>
            </FadeUp>
          </div>
        </section>
      )}

      <section className="home-items">
        <div className="home-items">
          <FadeUp>
            <h2>{t('home.contactTitle')}</h2>
          </FadeUp>
          <ContactForm />
        </div>
      </section>
    </>
  )
}
