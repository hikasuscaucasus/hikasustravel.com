import { Fragment, useContext, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Navigate } from 'react-router-dom'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import Breadcrumbs from '../shared/Breadcrumbs'
import LocaleLink from '../../i18n/LocaleLink'
import EntityToursTag from '../shared/EntityToursTag'
import { I18nContext } from '../../i18n/I18nContext'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import {
  getCity, cityPath, thingsToDoPath, legacyRedirects,
  countryOf, countryBase, countryName, destinationsBase, citiesHubPath, placesHubPath, DEFAULT_COUNTRY,
} from '../../data/places'
import { autolinkHtml } from '../../utils/autolink'
import asset from '../../utils/basePath'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.hikasustravel.com'
// Brand used for ImageObject credit/creator (mirrors og:site_name / the Article
// author & publisher below).
const BRAND = 'Hikasus Travel'
// Responsive-variant widths shipped for each gallery base name.
const GALLERY_WIDTHS = [1200, 1600, 2400]

/**
 * Brand credit for an image's ImageObject — applied by default, since these
 * photos are our own. An image whose provenance we cannot vouch for sets
 * `noCredit: true` and ships with the credit fields omitted entirely rather
 * than asserting an authorship we don't hold (schema.org treats absent credit
 * as unknown, which is the honest answer).
 *
 * Ported verbatim from RegionPage / SitePage / ThingsToDoCityPage, which have
 * had this since the Adjara pass. CityPage was the ONE renderer still missing
 * it, and the gap had a real consequence: with no way to omit credit, the
 * Ushguli hero's unresolved provenance was expressed by overriding the credit
 * strings to the literal placeholder `REPLACE-BRAND`, which then shipped into
 * production structured data. Omission is the correct expression of "unknown";
 * a placeholder string is not.
 *
 * Backwards-compatible: no city image set `noCredit` before this, so every
 * existing ImageObject keeps exactly the credit it had.
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
 * Generic city detail page. Driven by the places.js registry — the URL
 * /:lang/georgia/:citySlug resolves a registry entry; an unknown or
 * not-yet-published slug renders the 404 page (never an empty stub).
 */
export default function CityPage() {
  const { citySlug } = useParams()
  const city = getCity(citySlug)
  const t = useT()
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const contentRef = useRef(null)

  const published = city && city.published
  const contentKey = published ? city.contentKey : null
  const page = published ? (pages[contentKey] || enPages[contentKey]) : null
  const seo = getSEO(published ? city.seoKey : 'destinations', lang)
  const faqItems = useMemo(() => (page && page.faq) || [], [page])
  // Auto-link destination mentions in the editorial body + FAQ answers, skipping
  // self-links to this very page.
  const excludeKey = published ? `city:${city.slug}` : null
  // A city whose body is authored under a zero-editorial-links rule opts out
  // with `noAutolink: true` — the same flag RegionPage and ThingsToDoCityPage
  // already honour. Inert for every city that does not set it, which is all of
  // the Georgian ones: they keep exactly the autolinking they have always had.
  const noAutolink = published && city.noAutolink
  const linkedContent = useMemo(
    () => (page ? (noAutolink ? page.content : autolinkHtml(page.content, lang, pages, excludeKey)) : ''),
    [page, lang, pages, excludeKey, noAutolink],
  )
  const linkedFaq = useMemo(
    () => faqItems.map((it) => ({
      ...it,
      content: noAutolink ? it.content : autolinkHtml(it.content, lang, pages, excludeKey),
    })),
    [faqItems, lang, pages, excludeKey, noAutolink],
  )
  const path = published ? cityPath(city.slug).replace(/^\//, '') : ''
  const heroImage = published ? city.image : null
  // Localized alt for the hero when the city ships an `imageMeta` block (hero is a
  // CSS background with no <img alt>): carried into the hero ImageObject caption
  // and og:image:alt / twitter:image:alt per locale. Mirrors SitePage's imageMeta.
  const heroImageMeta = published ? city.imageMeta : null
  const heroAlt = heroImageMeta ? (heroImageMeta.alt[lang] || heroImageMeta.alt.en) : null
  // Only link the things-to-do guide when the city actually has one published.
  const hasThingsToDo = published && !!city.thingsToDo

  // Body/gallery images: resolve each image's alt + figcaption to the current
  // locale from its 7-language maps in places.js (city.gallery). English is a
  // crash-guard only — every locale ships its own strings, so non-English pages
  // never show English alt/captions.
  const gallery = useMemo(() => {
    if (!published || !city.gallery) return []
    return city.gallery.map((img) => ({
      ...img,
      alt: (img.alt && (img.alt[lang] || img.alt.en)) || '',
      caption: (img.caption && (img.caption[lang] || img.caption.en)) || '',
    }))
  }, [published, city, lang])
  // The gallery item flagged `hero` is the cover image (not rendered inline); the
  // rest are body images placed between content sections via their `afterChunk`.
  const bodyImages = useMemo(() => gallery.filter((img) => !img.hero), [gallery])
  // Split the body HTML into chunks at each <h2> (chunk 0 = intro), so body
  // images can be interleaved between sections rather than grouped in a block.
  const bodyChunks = useMemo(
    () => (linkedContent ? linkedContent.split(/(?=<h2)/) : []),
    [linkedContent],
  )
  // Portrait inline body photos (city.portraitInlines) — real <figure> figures
  // placed between sections via `afterChunk`, with a 768/1024 ladder capped at
  // 560px by `.body-img--portrait`. Distinct from the landscape `gallery` above:
  // these ship variants WITHOUT the `w` filename suffix and never flag the cover.
  // alt/caption resolve to the current locale from their 7-language maps (English
  // is a crash-guard only), so figures stay localized even when the body content
  // itself falls back to English.
  const portraitInlines = useMemo(() => {
    if (!published || !city.portraitInlines) return []
    return city.portraitInlines.map((img) => ({
      ...img,
      altText: (img.alt && (img.alt[lang] || img.alt.en)) || '',
      captionText: (img.caption && (img.caption[lang] || img.caption.en)) || '',
    }))
  }, [published, city, lang])

  // Most entries here are cities, but a few are reclassified as a place to visit
  // (e.g. Gomismta) while keeping this /georgia/<slug> detail page — their
  // breadcrumb points back to the Places to Visit hub, where their card lives.
  const isPlace = published && city.classifyAs === 'place'
  const parentCrumb = isPlace
    ? { name: t('nav.placesToVisit'), to: placesHubPath }
    : { name: t('nav.cities'), to: citiesHubPath }
  // Country-aware, mirroring RegionPage. Georgia keeps the trail it has always
  // had — "All Destinations" pointing at /georgia, then the Cities (or Places
  // to Visit) hub. Another country uses its own name for the country crumb and
  // skips the hub crumb entirely while it has no such hub: a breadcrumb must
  // point at a page that exists.
  const country = countryOf(published ? city : null)
  const isGeorgia = country === DEFAULT_COUNTRY
  // H1. Every Georgian city has always shown the bare city name here, and each
  // keeps it: the authored `heroTitle` in pages.json is a longer, SEO-shaped
  // headline that those pages deliberately do not display. A city whose brief
  // specifies the headline AS the H1 opts in with `heroTitleAsH1: true` — the
  // shape RegionPage/ThingsToDoCityPage use unconditionally. Falls back to the
  // name if the content entry has no heroTitle, so the flag can never blank it.
  const h1 = (published && city.heroTitleAsH1 && page?.heroTitle) || (published ? city.name : '')
  const trail = published
    ? [
        { name: t('breadcrumb.home'), to: '/' },
        isGeorgia
          ? { name: t('nav.allDestinations'), to: destinationsBase }
          : { name: t('nav.destinations.armenia'), to: countryBase(country) },
        ...(isGeorgia ? [parentCrumb] : []),
        { name: city.name },
      ]
    : []

  // Intercept in-content internal links (data-internal) for same-tab SPA navigation.
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
  }, [lang, navigate, published])

  const jsonLd = useMemo(() => {
    if (!published) return null
    const url = `${SITE_URL}/${lang}/${path}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TouristDestination',
          name: city.name,
          description: seo.description,
          url,
          ...(heroImage ? { image: `${SITE_URL}${heroImage}` } : {}),
          // The country was hardcoded while every city was Georgian; it now
          // reads the record, so a Georgian city still asserts Georgia and an
          // Armenian one asserts Armenia rather than the wrong country.
          containedInPlace: { '@type': 'Country', name: countryName(country) },
        },
        {
          '@type': 'Article',
          headline: page.heroTitle,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          // Omitted on a `noHero` city, exactly as RegionPage does: there is no
          // image to name and `${SITE_URL}null` would be a broken URL in the
          // graph. Every city with a hero is unchanged.
          ...(heroImage ? { image: `${SITE_URL}${heroImage}` } : {}),
          author: { '@type': 'Organization', name: 'Hikasus Travel' },
          publisher: { '@type': 'Organization', name: 'Hikasus Travel', url: SITE_URL },
        },
        // Body/gallery images (our own photos) — one ImageObject each, contentUrl
        // pointing at the real file; caption localized per locale, brand credit.
        ...gallery.map((img) => ({
          '@type': 'ImageObject',
          contentUrl: `${SITE_URL}/images/files/${img.base}-1600w.webp`,
          url: `${SITE_URL}/images/files/${img.base}-1600w.webp`,
          width: img.width,
          height: img.height,
          representativeOfPage: !!img.hero,
          name: img.name,
          caption: img.caption || img.description,
          description: img.description,
          ...creditFields(img),
          contentLocation: {
            '@type': 'Place',
            name: img.locationName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Telavi',
              addressRegion: 'Kakheti',
              addressCountry: 'GE',
            },
            geo: { '@type': 'GeoCoordinates', latitude: img.geo.lat, longitude: img.geo.lng },
          },
        })),
        // Contextual body photos rendered as inline <figure> blocks in the
        // per-locale body HTML (not via the data-driven gallery above). Each
        // gets one ImageObject here — contentUrl at the largest shipped variant,
        // brand credit, and its own contentLocation (locality/region/geo) so the
        // location is correct per image (e.g. Katskhi Pillar vs. Chiatura town),
        // never the hardcoded Telavi/Kakheti of the gallery block above.
        ...(city.imageObjects || []).map((img) => ({
          '@type': 'ImageObject',
          // Optional page-scoped @id, opt-in per image (mirrors the hero's
          // imageMeta.imageId). Only entries that set `imageId` emit one, so
          // every existing imageObject stays byte-identical.
          ...(img.imageId ? { '@id': `${url}#${img.imageId}` } : {}),
          contentUrl: `${SITE_URL}/images/files/${img.base}-${img.width}w.webp`,
          url: `${SITE_URL}/images/files/${img.base}-${img.width}w.webp`,
          width: img.width,
          height: img.height,
          representativeOfPage: !!img.hero,
          name: img.name,
          caption: img.caption,
          description: img.description,
          // Credit defaults to the brand (our own photos); an image whose origin
          // we cannot vouch for sets `noCredit: true` and omits the fields.
          // ⚠️ This REPLACED a per-image string override (`img.creator ||
          // BRAND`, etc.). That override existed only to hold the literal
          // placeholder `REPLACE-BRAND`, which shipped straight into production
          // structured data on the Ushguli city page. Omission — not a
          // placeholder, and not a false brand claim — is how "unknown" is said.
          ...creditFields(img),
          contentLocation: {
            '@type': 'Place',
            name: img.locationName,
            address: {
              '@type': 'PostalAddress',
              addressLocality: img.locality,
              addressRegion: img.region,
              addressCountry: 'GE',
            },
            geo: { '@type': 'GeoCoordinates', latitude: img.geo.lat, longitude: img.geo.lng },
          },
        })),
        // Portrait inline body images (real <figure> blocks rendered below) that
        // ship their variants WITHOUT the `w` filename suffix and need a stable
        // per-image `@id`. Mirrors SitePage's `inlineImageObjects` convention:
        // contentUrl at the largest shipped variant (-<width>.webp), brand credit,
        // own contentLocation, and never representativeOfPage — the hero stays the
        // representative image. name/caption are localized per locale.
        // `dir` overrides the default /images/files/ folder for sets that ship in
        // a city/region folder instead (e.g. the Batumi city images →
        // /images/batumi). Mirrors SitePage's inlineImageObjects.
        ...portraitInlines.map((img) => ({
          '@type': 'ImageObject',
          '@id': `${url}#${img.anchor}`,
          contentUrl: `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}.webp`,
          url: `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}.webp`,
          width: img.width,
          height: img.height,
          name: img.altText,
          caption: img.captionText,
          description: (img.caption && img.caption.en) || img.captionText,
          ...creditFields(img),
          contentLocation: {
            '@type': 'Place',
            name: img.locationName,
            // Address + geo are optional (same conditional path as SitePage/RegionPage
            // and the hero imageNode): a generic inline may ship a name+geo
            // contentLocation with no postal address (e.g. the Batumi parasailing
            // shot — "Batumi, Adjara, Georgia" + an approximate city geo, no street).
            // Every existing portraitInline (Ushguli) supplies locality+region, so its
            // output is unchanged; a locality-less inline omits the address block.
            ...((img.locality || img.region)
              ? {
                  address: {
                    '@type': 'PostalAddress',
                    addressLocality: img.locality,
                    addressRegion: img.region,
                    addressCountry: 'GE',
                  },
                }
              : {}),
            ...(img.geo
              ? { geo: { '@type': 'GeoCoordinates', latitude: img.geo.lat, longitude: img.geo.lng } }
              : {}),
          },
        })),
        // Hero ImageObject via the `imageMeta` block (for heroes whose file naming
        // or single-variant ceiling doesn't fit the gallery/imageObjects builders).
        // contentUrl points at the hero file itself (`city.image`); the cover is
        // representativeOfPage. Mirrors SitePage.
        ...(heroImageMeta ? [{
          '@type': 'ImageObject',
          // Optional stable @id for the hero node (page-scoped): a hero package may
          // ask the replacement node to reuse `#hero-image` so the swap is clean.
          // Only entries that set imageMeta.imageId emit an @id; every other city
          // hero is unchanged (no @id, as before).
          ...(heroImageMeta.imageId ? { '@id': `${url}#${heroImageMeta.imageId}` } : {}),
          contentUrl: `${SITE_URL}${heroImage}`,
          url: `${SITE_URL}${heroImage}`,
          width: heroImageMeta.width,
          height: heroImageMeta.height,
          representativeOfPage: true,
          name: heroImageMeta.name,
          // Prefer the per-locale `caption` map when the image SEO package ships
          // one, falling back to the localized alt when it doesn't. This line used
          // to be a bare `caption: heroAlt`, which silently DISCARDED
          // `imageMeta.caption` — so a city hero's caption differed between the two
          // graphs: scripts/seo-jsonld.js's own imageNode() has always preferred
          // meta.caption, so the prerendered <head> carried the real caption while
          // the hydrated page carried the alt. Seven cities were shipping that split
          // (Tbilisi, Akhaltsikhe, Tskaltubo, Batumi, Borjomi, Kazbegi, Gudauri).
          // Now identical to SitePage.jsx and ThingsToDoCityPage.jsx, which have
          // always had the conditional — this was the only builder that lacked it.
          // The `: heroAlt` fallback keeps the three imageMeta heroes that ship NO
          // caption map (Mtskheta, Mestia, Martvili) byte-identical to before.
          caption: heroImageMeta.caption
            ? (heroImageMeta.caption[lang] || heroImageMeta.caption.en)
            : heroAlt,
          description: heroImageMeta.description,
          ...creditFields(heroImageMeta),
          contentLocation: {
            '@type': 'Place',
            name: heroImageMeta.locationName,
            // Address + geo are optional (same conditional path as SitePage): a hero
            // package may ship a name+geo contentLocation with no postal address
            // (e.g. Kazbegi's regional anchor). Every existing imageMeta hero (Mestia)
            // supplies locality/region, so its output is unchanged; a geo-only or
            // address-less meta omits the missing block rather than emitting empties.
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
  }, [published, lang, path, seo.description, heroImage, faqItems, gallery, portraitInlines])

  useSEO(published ? {
    ...seo, lang, path,
    image: heroImage,
    imageAlt: heroAlt,
    // Prefer a dedicated 1.91:1 social image (og:image/twitter:image) when the
    // city defines one; otherwise useSEO falls back to the hero image.
    ogImage: city.ogImage?.src,
    ogImageWidth: city.ogImage?.width,
    ogImageHeight: city.ogImage?.height,
    // Optional LCP hero preload (page-scoped): only cities that set `heroPreload`
    // emit a <link rel=preload as=image> for that rung. Others pass undefined.
    preload: city.heroPreload
      ? { href: city.heroPreload, type: 'image/avif', fetchpriority: 'high' }
      : undefined,
    jsonLd,
  } : {})

  if (!published) {
    // Renamed-slug redirect (the SPA mirror of the static stubs emitted by
    // scripts/prerender.js). An old city slug that no longer matches a registry
    // entry — e.g. the former kazbegi-stepantsminda -> kazbegi rename — is looked
    // up in the shared registry and 301-redirected to its new URL so old links
    // and bookmarks land on the new page instead of a 404. Query params kept.
    const redirect = legacyRedirects().find((r) => r.from === `georgia/${citySlug}`)
    if (redirect) return <Navigate to={`/${lang}/${redirect.to}${location.search}`} replace />
    return <NotFoundPage />
  }

  return (
    <>
      {/* Small breadcrumb bar above the hero — the H1 is the city name. */}
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      {/* Hero. A city may opt out of the photo hero entirely (`noHero`) while a
          genuine image is sourced — same flag and same replacement as SitePage.
          The title band is NOT a removal: it keeps <main>'s child count stable so
          the .page-items :nth-child() light/dark banding below is unaffected, it
          carries the H1 that otherwise lives inside the hero (so the page still
          has exactly one), and its solid background keeps the transparent
          header's cream logo/nav legible. No image, no placeholder, no reserved
          100dvh. */}
      {city.noHero ? (
        <section className="dest-title-band">
          <h1>{h1}</h1>
        </section>
      ) : (
        <HeroSection image={heroImage} imageAvif={city.imageAvif} bgClass={city.heroClass} title={h1} />
      )}
      <section className="page-items about-georgia">
        <EntityToursTag type="city" slug={city.slug} name={city.name} />
        <div ref={contentRef}>
          {bodyChunks.map((chunk, i) => {
            const img = bodyImages.find((im) => im.afterChunk === i)
            const portrait = portraitInlines.find((im) => im.afterChunk === i)
            return (
              <Fragment key={`chunk-${i}`}>
                <FadeUp>
                  <div dangerouslySetInnerHTML={{ __html: chunk }} />
                </FadeUp>
                {portrait && (() => {
                  /* Inline body image between sections — real, crawlable, lazy
                     responsive <picture>/<img>. Data-driven ladder: `widths`
                     defaults to 768/1024 (the original two portrait inlines, native
                     1024×1536, unchanged). A landscape inline sets `portrait:false`
                     + its own `widths` (e.g. 768/1200/1448) and renders plain
                     `.body-img` (capped 642px); a portrait renders
                     `.body-img--portrait` (capped 560px). Files ship WITHOUT the `w`
                     suffix. No upscale, no 1600/2400, no fetchpriority, no OG. */
                  const widths = portrait.widths || [768, 1024]
                  // `dir` overrides the default /images/files/ folder (e.g. the
                  // Batumi city set ships in /images/batumi). Default unchanged.
                  const dir = portrait.dir || '/images/files'
                  const isPortrait = portrait.portrait !== false
                  const cap = isPortrait ? '560px' : '642px'
                  const sizes = `(min-width: 768px) ${cap}, 100vw`
                  // Portrait keeps its native-dimensioned <img> + smallest-rung src
                  // (byte-identical to the original inlines); landscape falls back to
                  // the 1200 rung at 1200×(scaled) to match the body-img convention.
                  const fbW = isPortrait ? widths[0] : (portrait.fallbackWidth || 1200)
                  const imgW = isPortrait ? portrait.width : fbW
                  const imgH = isPortrait ? portrait.height : Math.round(fbW * portrait.height / portrait.width)
                  return (
                  <FadeUp>
                    <figure className={isPortrait ? 'body-img body-img--portrait' : 'body-img'}>
                      <picture>
                        <source
                          type="image/avif"
                          srcSet={widths.map((w) => `${asset(`${dir}/${portrait.base}-${w}.avif`)} ${w}w`).join(', ')}
                          sizes={sizes}
                        />
                        <source
                          type="image/webp"
                          srcSet={widths.map((w) => `${asset(`${dir}/${portrait.base}-${w}.webp`)} ${w}w`).join(', ')}
                          sizes={sizes}
                        />
                        <img
                          src={asset(`${dir}/${portrait.base}-${fbW}.webp`)}
                          width={imgW}
                          height={imgH}
                          alt={portrait.altText}
                          loading="lazy"
                          decoding="async"
                        />
                      </picture>
                      {portrait.captionText && <figcaption>{portrait.captionText}</figcaption>}
                    </figure>
                  </FadeUp>
                  )
                })()}
                {img && (
                  /* Body image between content sections — real, crawlable, lazy
                     responsive <picture>/<img> (not the hero, not a CSS background). */
                  <FadeUp>
                    <figure className="city-body-figure">
                      <picture>
                        <source
                          type="image/avif"
                          srcSet={GALLERY_WIDTHS.map((w) => `${asset(`/images/files/${img.base}-${w}w.avif`)} ${w}w`).join(', ')}
                          sizes="(max-width: 768px) 100vw, 760px"
                        />
                        <source
                          type="image/webp"
                          srcSet={GALLERY_WIDTHS.map((w) => `${asset(`/images/files/${img.base}-${w}w.webp`)} ${w}w`).join(', ')}
                          sizes="(max-width: 768px) 100vw, 760px"
                        />
                        <img
                          src={asset(`/images/files/${img.base}-1600w.webp`)}
                          width={img.width}
                          height={img.height}
                          alt={img.alt}
                          loading="lazy"
                          decoding="async"
                          className="city-body-figure__img"
                        />
                      </picture>
                      {img.caption && <figcaption className="city-body-figure__caption">{img.caption}</figcaption>}
                    </figure>
                  </FadeUp>
                )}
              </Fragment>
            )
          })}
        </div>
        {hasThingsToDo && (
          <FadeUp>
            <p className="city-ttd-cta">
              <LocaleLink to={thingsToDoPath(city.slug)} className="button">
                {t('city.thingsToDoCta', { city: city.name })}
              </LocaleLink>
            </p>
          </FadeUp>
        )}
      </section>
      {faqItems.length > 0 && (
        <section className="page-items faq" id="faq-section">
          <Accordion items={linkedFaq} headingKey="faq.heroTitle" />
        </section>
      )}
    </>
  )
}
