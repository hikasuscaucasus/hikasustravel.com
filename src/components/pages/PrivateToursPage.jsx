import { useMemo } from 'react'
import FadeUp from '../shared/FadeUp'
import Breadcrumbs from '../shared/Breadcrumbs'
import DestinationCard from '../shared/DestinationCard'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import usePluralT from '../../i18n/usePluralT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import { TOUR_HUBS, TOUR_HUB_CHOOSER_IMAGE } from '../../data/tourHubs'
import { hubStatusFor } from '../../data/tours'

const SITE_URL = 'https://www.hikasustravel.com'

/**
 * /:lang/private-tours — the global tour chooser.
 *
 * This page used to be the Georgia tour list (every private tour in duration
 * bands, with Tbilisi/Kutaisi and category chips). Hikasus now sells tours in
 * three countries plus combined routes, so the Georgia list moved to its own
 * hub (/tours/georgia, CountryToursHubPage) and this URL — the homepage's
 * "See our tours" destination — became the page where a visitor picks a
 * destination: Caucasus, Azerbaijan, Georgia, Armenia, in that order.
 *
 * The cards reuse the homepage's "Where do you want to go?" card
 * (DestinationCard) and the hub registry in src/data/tourHubs.js; the status
 * line under each name is derived from the tour registry (hubStatusFor), so
 * a count here always matches the hub it links to.
 */
export default function PrivateToursPage() {
  const t = useT()
  const tCount = usePluralT()
  const { lang } = useLang()
  const seo = getSEO('privateTours', lang)

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('footer.tours') },
  ]

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: t('breadcrumb.home'), item: `${SITE_URL}/${lang}` },
          { '@type': 'ListItem', position: 2, name: t('footer.tours'), item: `${SITE_URL}/${lang}/private-tours` },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: t('tourHub.title'),
        description: seo.description,
        url: `${SITE_URL}/${lang}/private-tours`,
        inLanguage: lang,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: TOUR_HUBS.map((hub, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE_URL}/${lang}${hub.path}`,
            name: t(hub.titleKey),
          })),
        },
      },
    ],
  }), [lang, t, seo.description])

  useSEO({ ...seo, lang, path: 'private-tours', image: TOUR_HUB_CHOOSER_IMAGE, jsonLd })

  const statusLine = (id) => {
    const status = hubStatusFor(id)
    if (status.kind === 'count') return tCount('home.destStatusTours', status.n)
    if (status.kind === 'combinedOnly') return t('home.destStatusCombinedOnly')
    return t('home.destStatusComingSoon')
  }

  return (
    <>
      <section className="dest-title-band">
        <h1>{t('tourHub.title')}</h1>
      </section>
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <Breadcrumbs trail={trail} />
          </FadeUp>
          <FadeUp>
            <p>{t('tourHub.intro')}</p>
          </FadeUp>
          <FadeUp>
            <ul className="dest-hub-grid dest-hub-grid--quad">
              {TOUR_HUBS.map((hub) => (
                <li className="dest-hub-card" key={hub.id}>
                  <DestinationCard
                    name={t(hub.nameKey)}
                    description={t(hub.cardKey)}
                    image={hub.image}
                    imageAlt={t(hub.altKey)}
                    to={hub.path}
                    locationLine={statusLine(hub.id)}
                    ctaLabel={t(hub.ctaKey)}
                    headingLevel="h2"
                  />
                </li>
              ))}
            </ul>
          </FadeUp>
          <FadeUp>
            <p className="tour-hub__note">{t('tourHub.customNote')}</p>
            <p className="city-ttd-cta">
              <LocaleLink to="/contact" className="button">{t('home.requestItinerary')}</LocaleLink>
            </p>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
