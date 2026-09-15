import { useState, useMemo, useEffect, useSyncExternalStore } from 'react'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import LocaleLink from '../../i18n/LocaleLink'
import Breadcrumbs from '../shared/Breadcrumbs'
import {
  embassiesByCountry, embassyHosts, emergencyNumbers, embassyInfoChecked, filterEmbassies,
} from '../../data/embassyData'

const SITE_URL = 'https://www.hikasustravel.com'

function FlagImg({ code, size = 32 }) {
  const src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`
  return <img src={src} alt={code} width={size} height={Math.round(size * 0.75)} style={{ objectFit: 'cover', borderRadius: 3 }} />
}

// The visitor's country never changes while the page is open, so there is
// nothing to subscribe to. Module-level so the reference stays stable.
const subscribeNever = () => () => {}

function getUserCountryCode() {
  try {
    const lang = navigator.language || ''
    const parts = lang.split('-')
    if (parts.length >= 2) return parts[1].toUpperCase()
  } catch { /* ignore */ }
  return null
}

/**
 * One host country's directory of foreign missions: /embassies/georgia,
 * /embassies/armenia, /embassies/azerbaijan. The three routes render this one
 * component with a different `country`; every difference between them is
 * data (embassyData.js), a per-country ui.json string, or a per-country SEO
 * block (seoData.source.js).
 */
export default function EmbassyDirectoryPage({ country = 'georgia' }) {
  const t = useT()
  const { lang } = useLang()
  const host = embassyHosts[country]
  const list = embassiesByCountry[country]
  const path = `embassies/${country}`
  const seo = getSEO(host.seoKey, lang)
  const [query, setQuery] = useState('')

  // Resolve the visitor's own embassy from the browser locale. useSyncExternalStore
  // rather than a useState initialiser because the browser locale does not exist
  // at build time: the server snapshot (null) is what the static HTML and the
  // first hydration render both use, and React swaps in the client snapshot
  // immediately afterwards.
  const highlightedId = useSyncExternalStore(
    subscribeNever,
    () => {
      const code = getUserCountryCode()
      if (!code) return null
      const match = list.find((e) => e.countryCode === code)
      return match ? match.id : null
    },
    () => null,
  )

  const filtered = useMemo(() => filterEmbassies(query, country), [query, country])

  const pageTitle = t(`embassies.title.${country}`)

  const trail = useMemo(() => [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('footer.embassies'), to: '/embassies' },
    { name: pageTitle },
  ], [t, pageTitle])

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
        {
          '@type': 'ItemList',
          name: pageTitle,
          itemListElement: list.map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'Embassy',
              name: e.embassyName,
              address: {
                '@type': 'PostalAddress',
                streetAddress: e.address,
                addressLocality: host.capital,
                addressCountry: host.isoCode,
              },
              ...(e.phone ? { telephone: e.phone } : {}),
              ...(e.website ? { url: e.website } : {}),
            },
          })),
        },
      ],
    }
  }, [lang, path, pageTitle, list, host, trail])

  useSEO({ ...seo, lang, path, image: host.image, jsonLd })

  // Scroll the visitor's embassy into view on mount (DOM side-effect only).
  useEffect(() => {
    if (!highlightedId) return
    requestAnimationFrame(() => {
      const el = document.getElementById(`embassy-${highlightedId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [highlightedId])

  // Hero-less by design (see the original EmbassiesPage note): a reference list
  // has no photograph to show, so the title band carries the single <h1>.
  return (
    <>
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      <section className="dest-title-band">
        <h1>{pageTitle}</h1>
      </section>

      {/* Intro + disclaimer */}
      <section className="page-items">
        <div className="embassy-intro">
          <p>{t(`embassies.intro.${country}`)}</p>
          <p>{t('embassies.disclaimer')}</p>
          <p>
            <LocaleLink to={host.visaPath}>{t(`embassies.visaLink.${country}`)}</LocaleLink>
          </p>
          <p className="embassy-checked">{t('embassies.checked').replace('{date}', embassyInfoChecked)}</p>
        </div>
      </section>

      {/* Emergency Numbers */}
      <section className="page-items">
          <h2 className="embassy-section-title">{t('embassies.emergencyTitle')}</h2>
          <div className="emergency-cards">
            <a href={`tel:${emergencyNumbers[country]}`} className="emergency-card">
              <span className="emergency-card__number">{emergencyNumbers[country]}</span>
              <span className="emergency-card__label">{t('embassies.emergencyUniversal')}</span>
            </a>
          </div>
      </section>

      {/* Search */}
      <section className="page-items">
          <h2 className="embassy-section-title">{t('embassies.findYourEmbassy')}</h2>
          <div className="embassy-search-wrap">
            <input
              type="text"
              className="embassy-search"
              placeholder={t('embassies.searchPlaceholder')}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
      </section>

      {/* Embassy Cards */}
      <section className="page-items">
          <p className="embassy-count">
            {t('embassies.embassiesCount').replace('{count}', filtered.length)}
          </p>

          {filtered.length === 0 && (
            <p className="embassy-no-results">{t('embassies.noResults')}</p>
          )}

          <div className="embassy-grid">
            {filtered.map(e => (
              <div
                key={e.id}
                id={`embassy-${e.id}`}
                className={`embassy-card${highlightedId === e.id ? ' embassy-card--highlighted' : ''}`}
              >
                <div className="embassy-card__header">
                  <span className="embassy-card__flag"><FlagImg code={e.countryCode} size={32} /></span>
                  <div>
                    <h3 className="embassy-card__country">{e.countryName}</h3>
                    <p className="embassy-card__name">{e.embassyName}</p>
                  </div>
                </div>

                <div className="embassy-card__details">
                  <div className="embassy-card__row">
                    <span className="embassy-card__label">{t('embassies.address')}</span>
                    <span>{e.address}</span>
                  </div>
                  {e.phone && (
                    <div className="embassy-card__row">
                      <span className="embassy-card__label">{t('embassies.phone')}</span>
                      <a href={`tel:${e.phone.replace(/\s/g, '')}`}>{e.phone}</a>
                    </div>
                  )}
                  {e.email && (
                    <div className="embassy-card__row">
                      <span className="embassy-card__label">{t('embassies.email')}</span>
                      <a href={`mailto:${e.email}`}>{e.email}</a>
                    </div>
                  )}
                  {e.website && (
                    <div className="embassy-card__row">
                      <span className="embassy-card__label">{t('embassies.website')}</span>
                      <a href={e.website} target="_blank" rel="noopener noreferrer">
                        {e.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    </div>
                  )}
                  {e.workingHours && (
                    <div className="embassy-card__row">
                      <span className="embassy-card__label">{t('embassies.workingHours')}</span>
                      <span>{e.workingHours}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
      </section>
    </>
  )
}
