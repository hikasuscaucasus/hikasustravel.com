import { useContext, useMemo } from 'react'
import FadeUp from '../shared/FadeUp'
import Breadcrumbs from '../shared/Breadcrumbs'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

const SITE_URL = 'https://www.hikasustravel.com'

/**
 * Minimal country landing page.
 *
 * Georgia's country hub (DestinationsPage) is a large curated page: four
 * sub-hub cards plus a featured-cities strip built from 27 published city
 * guides. A country at the start of its coverage has none of that, and
 * inventing cards for pages that do not exist would be worse than a small
 * honest page — so this is deliberately a stub: breadcrumb, H1, one authored
 * paragraph, and links to whichever sub-hubs actually exist.
 *
 * It is NOT a second hub system. It exists precisely so that a new country does
 * NOT have to fake its way into the Georgia hub's shape, and it is expected to
 * be replaced by DestinationsPage's richer treatment once a country has the
 * content to justify it.
 *
 * `pageKey`/`seoKey` follow the site's ordinary content and SEO lookups, so all
 * copy is authored per locale in pages.json / seoData.source.js and nothing is
 * hardcoded here. `links` are the sub-hubs that exist today — passed in rather
 * than derived, so a hub is only ever linked once it is real.
 */
export default function CountryStubPage({ pageKey, seoKey, path, links = [] }) {
  const t = useT()
  const { lang } = useLang()
  const { pages, enPages } = useContext(I18nContext)
  const page = pages[pageKey] || enPages[pageKey]
  const seo = getSEO(seoKey, lang)

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: page.heroTitle },
  ]

  const jsonLd = useMemo(() => {
    const url = `${SITE_URL}/${lang}/${path}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: trail.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: c.name,
            item: c.to ? `${SITE_URL}/${lang}${c.to === '/' ? '' : c.to}` : url,
          })),
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, path, page.heroTitle])

  useSEO({ ...seo, lang, path, jsonLd })

  return (
    <>
      {/* No photo hero until an approved image exists — the same solid
          `.dest-title-band` CityPage/SitePage/RegionPage use for `noHero`. It
          carries the page's single H1 and keeps the transparent header's cream
          logo/nav legible. No image, no placeholder, no reserved 100dvh. */}
      <section className="dest-title-band">
        <h1>{page.heroTitle}</h1>
      </section>
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <Breadcrumbs trail={trail} />
          </FadeUp>
          <FadeUp>
            <p>{page.intro}</p>
          </FadeUp>
          {links.length > 0 && (
            <FadeUp>
              <p className="city-ttd-cta">
                {links.map((l) => (
                  <LocaleLink key={l.to} to={l.to} className="button">
                    {t(l.labelKey)}
                  </LocaleLink>
                ))}
              </p>
            </FadeUp>
          )}
        </div>
      </section>
    </>
  )
}
