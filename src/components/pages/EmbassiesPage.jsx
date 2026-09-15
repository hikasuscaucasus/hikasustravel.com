import { useMemo } from 'react'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import Breadcrumbs from '../shared/Breadcrumbs'
import DestinationCard from '../shared/DestinationCard'
import { embassyCountries } from '../../data/embassyData'

const SITE_URL = 'https://www.hikasustravel.com'

/**
 * /embassies — the Caucasus embassies hub. Three cards, one per host country,
 * each linking to that country's directory (/embassies/<country>, rendered by
 * EmbassyDirectoryPage). The page reuses the site's standard destination card
 * and hub grid rather than inventing a third card style; the cards carry no
 * photograph, which is the hub's own text-only form.
 */
export default function EmbassiesPage() {
  const t = useT()
  const { lang } = useLang()
  const seo = getSEO('embassies', lang)

  const trail = useMemo(() => [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('footer.embassies') },
  ], [t])

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: c.to ? `${SITE_URL}/${lang}${c.to === '/' ? '' : c.to}` : `${SITE_URL}/${lang}/embassies`,
        })),
      },
      {
        '@type': 'ItemList',
        name: t('embassies.hubTitle'),
        itemListElement: embassyCountries.map((country, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t(`embassies.title.${country}`),
          url: `${SITE_URL}/${lang}/embassies/${country}`,
        })),
      },
    ],
  }), [lang, t, trail])

  useSEO({ ...seo, lang, path: 'embassies', image: '/images/files/georgia-tour-03.jpg', jsonLd })

  return (
    <>
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      <section className="dest-title-band">
        <h1>{t('embassies.hubTitle')}</h1>
      </section>

      {/* Same wrapper as DestinationHub so the cards sit in the hub grid at
          full width rather than in the narrow editorial column. */}
      <section className="home-items">
        <div className="tours-grid-container">
          <p>{t('embassies.hubIntro')}</p>
          <ul className="dest-hub-grid">
            {embassyCountries.map((country) => (
              <li className="dest-hub-card" key={country}>
                <DestinationCard
                  name={t(`embassies.title.${country}`)}
                  description={t(`embassies.summary.${country}`)}
                  to={`/embassies/${country}`}
                  ctaLabel={t('embassies.viewEmbassies')}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
