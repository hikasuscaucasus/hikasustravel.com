import { useState, useMemo, useEffect, useSyncExternalStore } from 'react'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import { embassies, emergencyNumbers, filterEmbassies } from '../../data/embassyData'

function FlagImg({ code, size = 32 }) {
  const src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`
  return <img src={src} alt={code} width={size} height={Math.round(size * 0.75)} style={{ objectFit: 'cover', borderRadius: 3 }} />
}

// The visitor's country never changes while the page is open, so there is
// nothing to subscribe to. Module-level so the reference stays stable.
const subscribeNever = () => () => {}

// Must return a stable value — React re-reads it and compares. It resolves to a
// string id or null, so repeated calls compare equal.
function getHighlightedEmbassyId() {
  const code = getUserCountryCode()
  if (!code) return null
  const match = embassies.find((e) => e.countryCode === code)
  return match ? match.id : null
}

function getUserCountryCode() {
  try {
    const lang = navigator.language || ''
    const parts = lang.split('-')
    if (parts.length >= 2) return parts[1].toUpperCase()
  } catch { /* ignore */ }
  return null
}

export default function EmbassiesPage() {
  const t = useT()
  const { lang } = useLang()
  const seo = getSEO('embassies', lang)
  const [query, setQuery] = useState('')
  // Resolve the visitor's own embassy from the browser locale. useSyncExternalStore
  // rather than a useState initialiser because the browser locale does not exist
  // at build time: the server snapshot (null) is what the static HTML and the
  // first hydration render both use, and React swaps in the client snapshot
  // immediately afterwards. Reading navigator during render instead would make
  // the two disagree.
  const highlightedId = useSyncExternalStore(
    subscribeNever,
    getHighlightedEmbassyId,
    () => null,
  )

  const filtered = useMemo(() => filterEmbassies(query), [query])

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Embassies in Georgia',
    itemListElement: embassies.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Embassy',
        name: e.embassyName,
        address: {
          '@type': 'PostalAddress',
          streetAddress: e.address,
          addressLocality: 'Tbilisi',
          addressCountry: 'GE',
        },
        telephone: e.phone,
        url: e.website || undefined,
      },
    })),
  }), [])

  useSEO({ ...seo, lang, path: 'embassies', image: '/images/files/georgia-tour-03.jpg', jsonLd })

  // Scroll the visitor's embassy into view on mount (DOM side-effect only).
  useEffect(() => {
    if (!highlightedId) return
    requestAnimationFrame(() => {
      const el = document.getElementById(`embassy-${highlightedId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [highlightedId])

  // This page renders no hero, permanently. It is a reference list of embassy
  // contact details, not a destination, so there is no photograph to show and
  // nothing is reserved for one: the <HeroSection> call is gone rather than
  // hidden, so no fallback image, wrapper or reserved height can bring one
  // back. It uses the same title band as the site's other hero-less pages
  // (see FaqPage) — the band carries the single <h1>, and its solid background
  // is what keeps the absolutely-positioned header's cream logo and nav
  // legible, which a bare light page cannot. The og:image set above is
  // unaffected: a social preview does not require a visible hero.
  return (
    <>
      <section className="dest-title-band">
        <h1>{t('embassies.heroTitle')}</h1>
      </section>

      {/* Emergency Numbers */}
      <section className="page-items">
          <h2 className="embassy-section-title">{t('embassies.emergencyTitle')}</h2>
          <div className="emergency-cards">
            <a href="tel:112" className="emergency-card">
              <span className="emergency-card__number">{emergencyNumbers.universal}</span>
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
                  <div className="embassy-card__row">
                    <span className="embassy-card__label">{t('embassies.phone')}</span>
                    <a href={`tel:${e.phone.replace(/\s/g, '')}`}>{e.phone}</a>
                  </div>
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
                  <div className="embassy-card__row">
                    <span className="embassy-card__label">{t('embassies.workingHours')}</span>
                    <span>{e.workingHours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
      </section>
    </>
  )
}
