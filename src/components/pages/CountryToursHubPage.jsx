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
import { featuredToursFor, countryHasAnyTours, tourHubRobots } from '../../data/tours'

const SITE_URL = 'https://www.hikasustravel.com'

const SEO_KEY = { georgia: 'toursGeorgia', armenia: 'toursArmenia', azerbaijan: 'toursAzerbaijan', caucasus: 'toursCaucasus' }
const TITLE_KEY = { georgia: 'home.hubTitleGeorgia', armenia: 'home.hubTitleArmenia', azerbaijan: 'home.hubTitleAzerbaijan', caucasus: 'home.hubTitleCaucasus' }
const INTRO_KEY = { georgia: 'home.hubIntroGeorgia', armenia: 'home.hubIntroArmenia', azerbaijan: 'home.hubIntroAzerbaijan', caucasus: 'home.hubIntroCaucasus' }
// Existing, already-published destination guides to link from each hub.
const GUIDE_LINKS = {
  georgia: [{ to: '/georgia', labelKey: 'nav.destinations.georgia' }],
  armenia: [{ to: '/armenia', labelKey: 'nav.destinations.armenia' }],
  azerbaijan: [{ to: '/azerbaijan', labelKey: 'nav.destinations.azerbaijan' }],
  caucasus: [
    { to: '/georgia', labelKey: 'nav.destinations.georgia' },
    { to: '/armenia', labelKey: 'nav.destinations.armenia' },
    { to: '/azerbaijan', labelKey: 'nav.destinations.azerbaijan' },
  ],
}

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
  const hasTours = countryHasAnyTours(country)

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t(TITLE_KEY[country]) },
  ]

  const countryTours = featuredToursFor(country)

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

          {!hasTours && (
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

          {hasTours && (
            <FadeUp>
              <div className="tours-grid">
                {countryTours.map((tour) => {
                  const tt = tourTranslations?.[tour.slug]
                  const basePath = tour.type === 'group' ? 'group-tours' : 'private-tours'
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
                        </div>
                      </LocaleLink>
                    </div>
                  )
                })}
              </div>
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
