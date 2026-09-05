import { useContext, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import Breadcrumbs from '../shared/Breadcrumbs'
import EntityToursTag from '../shared/EntityToursTag'
import { I18nContext } from '../../i18n/I18nContext'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import {
  getCity, getRegion, cityPath, regionPath, thingsToDoPath, countryOf, countryBase,
  countryCode, regionsHubPathFor, destinationsBase, DEFAULT_COUNTRY,
} from '../../data/places'
import { autolinkHtml } from '../../utils/autolink'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.hikasustravel.com'
// Brand used for ImageObject credit/creator (mirrors og:site_name in useSEO).
const BRAND = 'Hikasus Travel'

/**
 * Brand credit for an image's ImageObject — applied by default, since these
 * photos are our own. An image whose provenance we cannot vouch for sets
 * `noCredit: true` and ships with the credit fields omitted entirely rather
 * than asserting an authorship we don't hold (schema.org treats absent credit
 * as unknown, which is the honest answer).
 *
 * Ported verbatim from RegionPage, which has had this since the Adjara pass.
 * Backwards-compatible: no `thingsToDo` block set `noCredit` before this, so
 * every existing page keeps the credit it had.
 */
function creditFields(img) {
  if (img.noCredit) return {}
  return {
    creator: { '@type': 'Organization', name: BRAND },
    creditText: BRAND,
    copyrightNotice: `© ${BRAND}`,
  }
}

/**
 * Generic "Things to do in <City>" page, driven by the places.js registry.
 * The URL /:lang/georgia/:citySlug/:ttd resolves a city whose `thingsToDo`
 * block exists and whose `:ttd` segment is exactly things-to-do-in-<citySlug>;
 * anything else renders the 404 page (never an empty stub).
 */
export default function ThingsToDoCityPage() {
  // Two routes reach this page:
  //   Georgia — /georgia/:citySlug/:sub via the CitySubPage dispatcher, where
  //     the guide is identified by :sub === things-to-do-in-<citySlug>.
  //   Armenia — /armenia/regions/:regionSlug/things-to-do and
  //     /armenia/:citySlug/things-to-do. `things-to-do` is a literal segment of
  //     the route in both, so neither carries a :sub.
  // `slug` normalises the two so everything below is written once.
  const { citySlug, regionSlug, sub: ttd } = useParams()
  const slug = citySlug || regionSlug
  // The first segment is a city OR a published region (disjoint namespaces); a
  // region's things-to-do guide (e.g. Adjara) reuses this same page/template.
  const city = getCity(slug)
  const place = city || getRegion(slug)
  const isCity = !!city
  const placePath = isCity ? cityPath(slug) : regionPath(slug)
  const t = useT()
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const config = place && place.published ? place.thingsToDo : null
  // Guard the exact slug so /georgia/tbilisi/anything doesn't render this page.
  // A route with no :sub at all (both Armenia shapes) has nothing to guard —
  // `things-to-do` is a literal segment of the route, so matching the route is
  // already the guard. Keyed on :sub rather than on :regionSlug, so the Armenia
  // CITY route is covered too.
  const valid = !!config && (ttd ? ttd === `things-to-do-in-${slug}` : true)

  const heroImage = config ? (config.image || place.image) : null
  // Optional image plumbing, all opt-in on the `thingsToDo` block and mirroring
  // what SitePage/CityPage already do. Every things-to-do page that sets none of
  // these (all 37 of them today) renders byte-identically to before:
  //   imageAvif / heroClass → AVIF+WebP image-set() hero ladder
  //   heroPreload           → <link rel=preload as=image fetchpriority=high>
  //   ogImage               → dedicated 1.91:1 social image
  //   imageMeta             → localized hero alt (og:image:alt / twitter:image:alt)
  //                           + a hero ImageObject in the @graph
  //   inlineImageObjects    → one ImageObject per inline body figure
  const heroImageMeta = valid ? config.imageMeta : null
  const heroAlt = heroImageMeta ? (heroImageMeta.alt[lang] || heroImageMeta.alt.en) : null
  const page = valid ? (pages[config.contentKey] || enPages[config.contentKey]) : null
  const seo = getSEO(valid ? config.seoKey : 'destinations', lang)
  const faqItems = useMemo(() => (page && page.faq) || [], [page])
  // Auto-link destination mentions in the body + FAQ. This page is a city's
  // things-to-do guide (a distinct URL from the city page), so no self-link
  // exclusion is needed — mentions of the city link to the city page itself.
  // The parent place can opt out (place.noAutolink, e.g. published region
  // things-to-do guides), or a thingsToDo block can opt out on its own
  // (config.noAutolink), so the body stays plain text until linking is handled.
  const noLink = !!(valid && ((place && place.noAutolink) || (config && config.noAutolink)))
  const linkedContent = useMemo(
    () => (page ? (noLink ? page.content : autolinkHtml(page.content, lang, pages)) : ''),
    [page, lang, pages, noLink],
  )
  const linkedFaq = useMemo(
    () => faqItems.map((it) => ({ ...it, content: noLink ? it.content : autolinkHtml(it.content, lang, pages) })),
    [faqItems, lang, pages, noLink],
  )
  const path = valid ? thingsToDoPath(slug).replace(/^\//, '') : ''
  const ttdLabel = valid ? t('city.thingsToDoCta', { city: place.name }) : ''

  // Country of the parent place — 'georgia' for every record that predates the
  // country field, so the Georgian trail below is byte-for-byte the one this
  // page has always built.
  const country = countryOf(valid ? place : null)
  const isGeorgia = country === DEFAULT_COUNTRY
  const trail = valid
    ? isGeorgia
      ? [
          { name: t('breadcrumb.home'), to: '/' },
          { name: t('nav.allDestinations'), to: destinationsBase },
          { name: place.name, to: placePath },
          { name: ttdLabel },
        ]
      : [
          // Armenia's guide nests under its parent page, so the trail spells out
          // the full hierarchy the URL does: a REGION guide reads Home > Armenia
          // > Regions > <Region> > Things to Do in <Region>; a CITY guide has no
          // Regions step, because its parent is not one — Yerevan holds separate
          // capital status and sits at /armenia/<city>, not under /armenia/regions.
          { name: t('breadcrumb.home'), to: '/' },
          { name: t('nav.destinations.armenia'), to: countryBase(country) },
          ...(isCity ? [] : [{ name: t('nav.regions'), to: regionsHubPathFor(country) }]),
          { name: place.name, to: placePath },
          { name: ttdLabel },
        ]
    : []

  // Intercept in-content internal links (data-internal) for same-tab SPA nav.
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const onClick = (e) => {
      const link = e.target.closest('a[data-internal]')
      if (!link || !el.contains(link)) return
      e.preventDefault()
      navigate(`/${lang}${link.getAttribute('data-internal')}`)
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [lang, navigate, valid])

  const jsonLd = useMemo(() => {
    if (!valid) return null
    const url = `${SITE_URL}/${lang}/${path}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: page.heroTitle,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          // Omitted entirely on a `noHero` page: there is no image to name, and
          // emitting `${SITE_URL}null` would be a broken URL in the graph. Every
          // page with a hero is unchanged.
          ...(heroImage ? { image: `${SITE_URL}${heroImage}` } : {}),
          author: { '@type': 'Organization', name: 'Hikasus Travel' },
          publisher: { '@type': 'Organization', name: 'Hikasus Travel', url: SITE_URL },
        },
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
          name: ttdLabel,
          itemListElement: config.attractions.map((name, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
              '@type': 'TouristAttraction',
              name,
              address: { '@type': 'PostalAddress', ...config.address, addressCountry: countryCode(country) },
            },
          })),
        },
        // Hero ImageObject (opt-in via config.imageMeta). The hero is a CSS
        // background, not an indexable <img>, so this is what makes it
        // describable to Google/AI. `imageId` gives it a stable page-scoped @id.
        ...(heroImageMeta ? [{
          '@type': 'ImageObject',
          ...(heroImageMeta.imageId ? { '@id': `${url}#${heroImageMeta.imageId}` } : {}),
          contentUrl: `${SITE_URL}${heroImage}`,
          url: `${SITE_URL}${heroImage}`,
          width: heroImageMeta.width,
          height: heroImageMeta.height,
          caption: heroImageMeta.caption
            ? (heroImageMeta.caption[lang] || heroImageMeta.caption.en)
            : heroAlt,
          name: heroImageMeta.name,
          description: heroImageMeta.description,
          representativeOfPage: true,
          ...creditFields(heroImageMeta),
          contentLocation: {
            '@type': 'Place',
            name: heroImageMeta.locationName,
            ...((heroImageMeta.locality || heroImageMeta.region || heroImageMeta.country)
              ? {
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: heroImageMeta.locality,
                    addressRegion: heroImageMeta.region,
                    addressCountry: heroImageMeta.country,
                  },
                }
              : {}),
            ...(heroImageMeta.geo
              ? { geo: { '@type': 'GeoCoordinates', latitude: heroImageMeta.geo.lat, longitude: heroImageMeta.geo.lng } }
              : {}),
          },
        }] : []),
        // Inline body images (real <figure> blocks in the per-locale content).
        // Same convention as SitePage's inlineImageObjects: stable per-image @id,
        // contentUrl at the image's top rung (files ship WITHOUT the `w` suffix),
        // optional `dir` for a non-/images/files folder, localized name+caption,
        // and NEVER representativeOfPage — that stays the hero's.
        ...((valid && config.inlineImageObjects) || []).map((img) => {
          const href = `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}.webp`
          return {
            '@type': 'ImageObject',
            '@id': `${url}#${img.anchor}`,
            contentUrl: href,
            url: href,
            width: img.width,
            height: img.height,
            name: (img.name && (img.name[lang] || img.name.en)) || '',
            caption: (img.caption && (img.caption[lang] || img.caption.en)) || '',
            description: img.description,
            ...creditFields(img),
            // contentLocation is conditional on `locationName`, mirroring
            // RegionPage: an image whose location is genuinely unknown (a studio
            // dish photograph, say) drops the node entirely rather than emitting
            // an empty Place — or worse, an invented one.
            ...(img.locationName
              ? {
                  contentLocation: {
                    '@type': 'Place',
                    name: img.locationName,
                    ...((img.locality || img.region)
                      ? {
                          address: {
                            '@type': 'PostalAddress',
                            addressLocality: img.locality,
                            addressRegion: img.region,
                            addressCountry: countryCode(country),
                          },
                        }
                      : {}),
                    ...(img.geo
                      ? { geo: { '@type': 'GeoCoordinates', latitude: img.geo.lat, longitude: img.geo.lng } }
                      : {}),
                  },
                }
              : {}),
          }
        }),
        {
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.title,
            acceptedAnswer: { '@type': 'Answer', text: item.content },
          })),
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valid, lang, path, seo.description, heroImage, faqItems, ttdLabel, heroImageMeta, heroAlt, country])

  useSEO(valid ? {
    ...seo, lang, path,
    image: heroImage,
    imageAlt: heroAlt,
    // Prefer a dedicated 1.91:1 social image when the block defines one;
    // otherwise useSEO falls back to the hero image (previous behaviour).
    ogImage: config.ogImage?.src,
    ogImageWidth: config.ogImage?.width,
    ogImageHeight: config.ogImage?.height,
    // Optional LCP hero preload (page-scoped): only blocks that set `heroPreload`
    // emit a <link rel=preload as=image> for that rung.
    preload: config.heroPreload
      ? { href: config.heroPreload, type: 'image/avif', fetchpriority: 'high' }
      : undefined,
    jsonLd,
  } : {})

  if (!valid) return <NotFoundPage />

  return (
    <>
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      {/* Hero, or the no-image title band when the guide opts out (`noHero` on
          the thingsToDo block) — the same flag and same replacement CityPage,
          SitePage and RegionPage use. Keeps exactly one H1 and <main>'s child
          count stable; no placeholder and no reserved 100dvh. */}
      {config.noHero ? (
        <section className="dest-title-band">
          <h1>{page.heroTitle}</h1>
        </section>
      ) : (
        <HeroSection image={heroImage} imageAvif={config.imageAvif} bgClass={config.heroClass} title={page.heroTitle} />
      )}
      <section className="page-items about-georgia">
        <EntityToursTag type={isCity ? 'city' : 'region'} slug={slug} name={place.name} />
        <FadeUp>
          <div ref={contentRef} dangerouslySetInnerHTML={{ __html: linkedContent }} />
        </FadeUp>
      </section>
      {faqItems.length > 0 && (
        <section className="page-items faq" id="faq-section">
          <Accordion items={linkedFaq} headingKey="faq.heroTitle" />
        </section>
      )}
    </>
  )
}
