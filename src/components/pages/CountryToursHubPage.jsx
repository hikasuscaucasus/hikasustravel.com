import { useContext, useEffect, useMemo } from 'react'
import CardImage from '../shared/CardImage'
import FadeUp from '../shared/FadeUp'
import Breadcrumbs from '../shared/Breadcrumbs'
import ContactForm from '../shared/ContactForm'
import TourCard from '../shared/TourCard'
import PrivateTourCollectionLinks from '../shared/PrivateTourCollectionLinks'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import usePluralT from '../../i18n/usePluralT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import { primaryToursFor, combinedToursCovering, tourHubRobots } from '../../data/tours'
import { tourHubById } from '../../data/tourHubs'
import { groupToursByDuration } from '../../data/tourDurationBands'

const SITE_URL = 'https://www.hikasustravel.com'

// Published destination guides to link from each hub, below the tour list.
const GUIDE_LINKS = {
  georgia: [{ to: '/georgia', labelKey: 'nav.destinations.georgia' }],
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

// A listing longer than this is grouped into duration bands (the way the old
// /private-tours Georgia list was); a short one is a single flat list.
const BANDS_FROM = 9

const tourBasePath = (tour) => (tour.type === 'group' ? '/group-tours' : '/private-tours')

/**
 * Shared template for the four tour hubs: /tours/georgia, /tours/armenia,
 * /tours/azerbaijan and /tours/caucasus — the destinations the /private-tours
 * chooser leads to.
 *
 * Everything listed comes from the tour registry (src/data/tours.js):
 *   - main listing: `primaryToursFor(country)` — every tour whose ONE primary
 *     hub this is (single-country tours for a country, `country: "caucasus"`
 *     tours for the Caucasus hub). Private tours in the list, group tours in
 *     the "Scheduled group departures" block below it.
 *   - "Combine <country> with…": `combinedToursCovering(country)` — the
 *     multi-country tours that pass through this country. Listed separately so
 *     they never pad the country's own count; they belong to the Caucasus hub.
 * Tagging a new tour `country: "<country>"` (or `"caucasus"` + `areaServed`) is
 * the only step needed for it to appear here. Indexability and sitemap
 * presence use the same registry (tourHubRobots / countryHasAnyTours).
 */
export default function CountryToursHubPage({ country }) {
  const hub = tourHubById[country]
  const t = useT()
  const tCount = usePluralT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  const seo = getSEO(hub.seoKey, lang)
  const countryName = t(hub.nameKey)

  const primary = useMemo(() => primaryToursFor(country), [country])
  const privateTours = useMemo(() => primary.filter((tour) => tour.type === 'private'), [primary])
  const groupTours = useMemo(() => primary.filter((tour) => tour.type === 'group'), [primary])
  const combined = useMemo(() => combinedToursCovering(country), [country])

  const bands = useMemo(() => (
    privateTours.length >= BANDS_FROM
      ? groupToursByDuration(privateTours)
      : [{ key: 'all', labelKey: 'tour.privateTours', tours: privateTours }]
  ), [privateTours])

  // Home → Tours (the /private-tours chooser) → <Country>. The JSON-LD
  // BreadcrumbList below is built from this same trail.
  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('footer.tours'), to: '/private-tours' },
    { name: countryName },
  ]

  const hubUrl = `${SITE_URL}/${lang}${hub.path}`
  const jsonLd = useMemo(() => {
    const graph = [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('breadcrumb.home'), item: `${SITE_URL}/${lang}` },
          { '@type': 'ListItem', position: 2, name: t('footer.tours'), item: `${SITE_URL}/${lang}/private-tours` },
          { '@type': 'ListItem', position: 3, name: countryName, item: hubUrl },
        ],
      },
    ]
    if (primary.length) {
      graph.push({
        '@type': 'CollectionPage',
        name: t(hub.titleKey),
        description: seo.description,
        url: hubUrl,
        inLanguage: lang,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: primary.map((tour, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/${lang}${tourBasePath(tour)}/${tour.slug}`,
            name: tourTranslations?.[tour.slug]?.title || tour.title,
          })),
        },
      })
    }
    return { '@context': 'https://schema.org', '@graph': graph }
  }, [lang, t, hub.titleKey, countryName, hubUrl, primary, seo.description, tourTranslations])

  useSEO({ ...seo, lang, path: `tours/${country}`, image: hub.image, robots: tourHubRobots(country), jsonLd })

  return (
    <>
      <section className="dest-title-band">
        <h1>{t(hub.titleKey)}</h1>
      </section>
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <Breadcrumbs trail={trail} />
          </FadeUp>
          <FadeUp>
            <p>{t(hub.introKey)}</p>
          </FadeUp>

          {privateTours.length > 0 ? (
            <FadeUp>
              <p className="tour-hub__count">{tCount('tour.countLabel', privateTours.length)}</p>
            </FadeUp>
          ) : (
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
        </div>
      </section>

      {privateTours.length > 0 && (
        <>
          {/* Starting-point / category chips — only the collections whose
              tours all belong to this hub (Georgia's eight today; a country
              with no collections renders nothing). */}
          <PrivateTourCollectionLinks country={country} />

          <section className="tour-listing-bands" aria-label={t('tour.privateTours')}>
            {bands.map((band) => (
              <div key={band.key} className="tour-band">
                <h2 className="tour-band__title">{t(band.labelKey)}</h2>
                <div className="tour-listing">
                  {band.tours.map((tour, index) => (
                    <TourCard
                      key={tour.slug}
                      tour={tour}
                      translation={tourTranslations?.[tour.slug]}
                      index={index}
                      basePath="/private-tours"
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      {/* Scheduled group departures — same block/markup as the homepage.
          Only this hub's own group tours (primary classification), so a
          future Armenia or Caucasus departure appears on its own hub. */}
      {groupTours.length > 0 && (
        <section className="home-items">
          <div className="tour-listing" style={{ background: 'none', maxWidth: '1600px' }}>
            <FadeUp>
              <h2>{t('home.groupDeparturesTitle')}</h2>
            </FadeUp>
            {groupTours.map((groupTour) => {
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

      {/* Multi-country tours that pass through this country. Secondary to the
          list above and clearly labelled as combined routes; their home hub is
          /tours/caucasus, linked at the end. */}
      {combined.length > 0 && (
        <section className="tour-listing-bands tour-hub-combined" aria-labelledby="tour-hub-combined-title">
          <div className="tour-band">
            <h2 id="tour-hub-combined-title" className="tour-band__title">{t(hub.combinedKey)}</h2>
            <p className="tour-hub-combined__intro">{t('tourHub.combinedIntro', { country: countryName })}</p>
            <div className="tour-listing">
              {combined.map((tour, index) => (
                <TourCard
                  key={tour.slug}
                  tour={tour}
                  translation={tourTranslations?.[tour.slug]}
                  index={index}
                  basePath={tourBasePath(tour)}
                />
              ))}
            </div>
            <p className="city-ttd-cta">
              <LocaleLink to="/tours/caucasus" className="button">{t('nav.toursCaucasus')}</LocaleLink>
            </p>
          </div>
        </section>
      )}

      {GUIDE_LINKS[country].length > 0 && (
        <section className="home-items">
          <div className="tours-grid-container">
            <FadeUp>
              <p className="city-ttd-cta">
                {GUIDE_LINKS[country].map((l) => (
                  <LocaleLink key={l.to} to={l.to} className="button">
                    {t(l.labelKey)}
                  </LocaleLink>
                ))}
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
