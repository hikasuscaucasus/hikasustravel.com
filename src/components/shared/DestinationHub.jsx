import { useContext, useMemo, useState } from 'react'
import HeroSection from './HeroSection'
import FadeUp from './FadeUp'
import BlurUpBackground from './BlurUpBackground'
import Breadcrumbs from './Breadcrumbs'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

const SITE_URL = 'https://www.hikasustravel.com'

// Derive a clean, translated card title from a site's per-language SEO title,
// e.g. "Festung Ujarma: königliche Hochburg …" -> "Festung Ujarma" and
// "Forteresse d'Ujarma : bastion …" -> "Forteresse d'Ujarma". Cuts at the first
// tagline / locator separator so marketing and ", City"/", Country" suffixes drop off.
const seoCardName = (title) => (title || '').split(/[|:]/)[0].split(',')[0].trim()

/**
 * Generic sub-hub page (Regions / Cities / Places to Visit).
 *
 * Registry order + published flags decide what is shown and what links; the
 * localized name + one-line description for each entry come from pages.json
 * (so translators only touch JSON). Entries without a published detail page
 * render as plain text with a "guide coming soon" note — never a broken link.
 */
export default function DestinationHub({
  pageKey,
  seoKey,
  path,
  heroImage,
  entries,
  currentLabelKey,
  ctaKey,
  sortByName = false,
  pinFirst = null,
  seoFallback = false,
  filterable = false,
}) {
  const t = useT()
  const { lang } = useLang()
  const [query, setQuery] = useState('')
  const [regionId, setRegionId] = useState('')
  const [cityId, setCityId] = useState('')
  const { pages, enPages } = useContext(I18nContext)
  const page = pages[pageKey] || enPages[pageKey]
  const seo = getSEO(seoKey, lang)

  const resolved = useMemo(
    () => {
      const items = page.items || {}
      // English card name/description fallback per entry, so a summary still
      // shows in every language until that card's text is translated (mirrors
      // how the detail pages fall back to English).
      const enItems = (enPages[pageKey] && enPages[pageKey].items) || {}
      const list = entries.map((e) => {
        const localized = items[e.slug] || {}
        const enLocalized = enItems[e.slug] || {}
        // Fall back to the per-language SEO entry (authored for every site) so
        // each card shows a translated one-line summary even without a curated
        // override, and new sites are covered automatically. The title fallback
        // is non-English only: English keeps its exact site name, while the SEO
        // *description* now backs every language so no card is left blank.
        const seoCard = (seoFallback && e.seoKey) ? getSEO(e.seoKey, lang) : null
        return {
          ...e,
          name:
            localized.name || enLocalized.name ||
            (seoCard && lang !== 'en' && seoCardName(seoCard.title)) || e.fallbackName,
          description:
            localized.description || enLocalized.description ||
            (seoCard && seoCard.description) || '',
        }
      })
      // Places to Visit lists alphabetically by the visible (translated) title —
      // locale-aware and case-insensitive — so every published site, including
      // newly added ones, appears in its correct A–Z position automatically
      // rather than in registry order. Sorting never drops an entry.
      if (sortByName) {
        list.sort((a, b) => a.name.localeCompare(b.name, lang, { sensitivity: 'base' }))
      }
      // One entry may be pinned ahead of the alphabetical run — the Cities hub
      // leads with the capital. Matched on the stable slug, never the label,
      // which is localized (Tbilisi / Tiflis / Tbilissi). A no-op if the slug
      // isn't in this list, so it can never drop or duplicate a card.
      if (pinFirst) {
        const i = list.findIndex((e) => e.slug === pinFirst)
        if (i > 0) list.unshift(list.splice(i, 1)[0])
      }
      return list
    },
    [entries, page, pageKey, enPages, sortByName, pinFirst, seoFallback, lang],
  )

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('nav.allDestinations'), to: '/georgia' },
    { name: t(currentLabelKey) },
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
        {
          '@type': 'ItemList',
          name: seo.title,
          itemListElement: resolved
            .filter((e) => e.published && e.to)
            .map((e, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: e.name,
              url: `${SITE_URL}/${lang}${e.to}`,
            })),
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, path, resolved, seo.title])

  useSEO({ ...seo, lang, path, image: heroImage, jsonLd })

  // Secondary "City, Region" / "City, Georgia" / "Region, Georgia" line for
  // Places to Visit cards. Stable city/region IDs (set on each entry from the
  // site's structured parent) map to the already-translated city and region
  // names, so the facts stay identical across languages while the labels are
  // localized. Cards without a `location` (Regions / Cities hubs) render none.
  const cityItems = (pages.destinationsCities && pages.destinationsCities.items) || {}
  const regionItems = (pages.destinationsRegions && pages.destinationsRegions.items) || {}
  const enCityItems = (enPages.destinationsCities && enPages.destinationsCities.items) || {}
  const enRegionItems = (enPages.destinationsRegions && enPages.destinationsRegions.items) || {}
  // Optional card cover. The Cities hub supplies one from the same
  // `cities[].image` field the /georgia strip reads, and the Regions hub from
  // `regions[].cardImage` (the region's own hero family), so a card and its
  // detail page can never show different photos. An entry without `image`
  // renders exactly the markup this component produced before covers existed —
  // which is how Abkhazia and the Places to Visit hub stay text-only.
  // `imagePosition` anchors the crop the way the detail-page hero anchors its
  // background; omitting it keeps BlurUpBackground's 'center' default, so every
  // Cities card is unaffected.
  const cover = (e) =>
    e.image
      ? <BlurUpBackground src={e.image} position={e.imagePosition || 'center'} className="dest-hub-card__image" />
      : null
  // The cover has to bleed to the card's edges, but the padding lives on the
  // link/pending element itself. Rather than restructure the card (which would
  // move markup on all three hubs), the image is pulled out with negative
  // margins and this modifier drops the now-redundant top padding.
  const mediaClass = (e, base) => (e.image ? `${base} ${base}--media` : base)

  const country = t('destinations.country')
  const locationLabel = (loc) => {
    if (!loc) return ''
    // A municipality label (e.g. "Ozurgeti Municipality") is a translated ui
    // string keyed by its stable id; fall back to no municipality if untranslated.
    let municipalityName = ''
    if (loc.municipalityId) {
      const key = `municipality.${loc.municipalityId}`
      const label = t(key)
      if (label && label !== key) municipalityName = label
    }
    const cityName = loc.cityId && ((cityItems[loc.cityId] && cityItems[loc.cityId].name) || (enCityItems[loc.cityId] && enCityItems[loc.cityId].name))
    const regionName = loc.regionId && ((regionItems[loc.regionId] && regionItems[loc.regionId].name) || (enRegionItems[loc.regionId] && enRegionItems[loc.regionId].name))
    const primary = municipalityName || cityName
    if (primary) return regionName ? `${primary}, ${regionName}` : `${primary}, ${country}`
    if (regionName) return `${regionName}, ${country}`
    return ''
  }

  // Facets, built from the entries themselves so a new place appears in the
  // dropdowns the moment it appears in the registry. Regions and cities are
  // labelled with the same translated names the cards show, and sorted the
  // way the visitor reads them.
  const regionName = (id) =>
    (regionItems[id] && regionItems[id].name) || (enRegionItems[id] && enRegionItems[id].name) || id
  const cityName = (id) =>
    (cityItems[id] && cityItems[id].name) || (enCityItems[id] && enCityItems[id].name) || id

  const facetOf = (list, key, label) => {
    const ids = [...new Set(list.map((e) => e.location && e.location[key]).filter(Boolean))]
    return ids
      .map((id) => ({ id, name: label(id) }))
      .sort((a, b) => a.name.localeCompare(b.name, lang, { sensitivity: 'base' }))
  }

  const regionOptions = filterable ? facetOf(resolved, 'regionId', regionName) : []
  // Cities narrow to the chosen region, so the second select can never offer
  // a combination that has no places in it.
  const cityOptions = filterable
    ? facetOf(
      regionId ? resolved.filter((e) => e.location && e.location.regionId === regionId) : resolved,
      'cityId',
      cityName
    )
    : []

  const normalized = query.trim().toLowerCase()
  const shown = filterable
    ? resolved.filter((e) => {
      if (regionId && (!e.location || e.location.regionId !== regionId)) return false
      if (cityId && (!e.location || e.location.cityId !== cityId)) return false
      if (!normalized) return true
      const haystack = `${e.name} ${locationLabel(e.location)} ${e.slug.split('-').join(' ')}`.toLowerCase()
      return haystack.includes(normalized)
    })
    : resolved

  const filtering = filterable && (normalized || regionId || cityId)

  const clearFilters = () => {
    setQuery('')
    setRegionId('')
    setCityId('')
  }

  return (
    <>
      <HeroSection className="hero--compact" image={heroImage} title={page.heroTitle} />
      <section className="home-items">
        <div className="tours-grid-container">
          <FadeUp>
            <Breadcrumbs trail={trail} />
          </FadeUp>
          <FadeUp>
            <p>{page.intro}</p>
          </FadeUp>
          {filterable && (
            <FadeUp>
              <div className="hub-filters">
                <div className="hub-filters__field hub-filters__field--search">
                  <label htmlFor="hub-search">{t('search.open')}</label>
                  <input
                    id="hub-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('hub.searchPlaceholder')}
                  />
                </div>
                <div className="hub-filters__field">
                  <label htmlFor="hub-region">{t('nav.regions')}</label>
                  <select
                    id="hub-region"
                    value={regionId}
                    onChange={(e) => { setRegionId(e.target.value); setCityId('') }}
                  >
                    <option value="">{t('hub.allRegions')}</option>
                    {regionOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="hub-filters__field">
                  <label htmlFor="hub-city">{t('nav.cities')}</label>
                  <select id="hub-city" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                    <option value="">{t('hub.allCities')}</option>
                    {cityOptions.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                {filtering && (
                  <button type="button" className="hub-filters__clear" onClick={clearFilters}>
                    {t('hub.clearFilters')}
                  </button>
                )}
                <p className="hub-filters__count" role="status" aria-live="polite">
                  {t('search.results', { count: shown.length })}
                </p>
              </div>
            </FadeUp>
          )}
          {filterable && shown.length === 0 && (
            <FadeUp>
              <p className="hub-filters__empty">{t('hub.noResults')}</p>
            </FadeUp>
          )}
          <FadeUp>
            <ul className="dest-hub-grid">
              {shown.map((e) => (
                <li className="dest-hub-card" key={e.slug}>
                  {e.published && e.to ? (
                    <LocaleLink to={e.to} className={mediaClass(e, 'dest-hub-card__link')}>
                      {cover(e)}
                      <h3>{e.name}</h3>
                      {locationLabel(e.location) && (
                        <span className="dest-hub-card__loc">{locationLabel(e.location)}</span>
                      )}
                      {e.description && <p>{e.description}</p>}
                      {ctaKey && <span className="dest-hub-card__cta">{t(ctaKey)}</span>}
                    </LocaleLink>
                  ) : (
                    <div className={mediaClass(e, 'dest-hub-card__pending')}>
                      {cover(e)}
                      <h3>{e.name}</h3>
                      {locationLabel(e.location) && (
                        <span className="dest-hub-card__loc">{locationLabel(e.location)}</span>
                      )}
                      {e.description && <p>{e.description}</p>}
                      <span className="dest-hub-card__soon">{t('destinations.comingSoon')}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </section>
    </>
  )
}
