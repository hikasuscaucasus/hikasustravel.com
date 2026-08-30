import { useContext, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
import { getRegion, regionPath, thingsToDoPath } from '../../data/places'
import { autolinkHtml } from '../../utils/autolink'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.hikasustravel.com'
// Brand used for ImageObject credit/creator (mirrors og:site_name in useSEO).
const BRAND = 'Hikasus Travel'

/**
 * Brand credit for an image's ImageObject — applied by default, since region
 * photos are our own. An image whose provenance we cannot vouch for sets
 * `noCredit: true` and ships with the credit fields omitted entirely rather
 * than asserting an authorship we don't hold (schema.org treats absent credit
 * as unknown, which is the honest answer).
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
 * Generic region detail page. Scaffolded against the places.js registry; a
 * region renders only once it has `published: true` plus seoKey/contentKey/
 * image. Until then the route resolves to the 404 page (no thin/empty pages).
 */
export default function RegionPage() {
  const { regionSlug } = useParams()
  const region = getRegion(regionSlug)
  const t = useT()
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const published = region && region.published
  const contentKey = published ? region.contentKey : null
  const page = published ? (pages[contentKey] || enPages[contentKey]) : null
  const seo = getSEO(published ? region.seoKey : 'destinations', lang)
  const faqItems = useMemo(() => (page && page.faq) || [], [page])
  // Auto-link other destinations in the body + FAQ, skipping self-links to this
  // region. (Region pages are unpublished today; this is ready for when they go live.)
  const excludeKey = published ? `region:${region.slug}` : null
  // A region can opt out of auto-linking (region.noAutolink) so its body stays
  // plain text and its name isn't linked site-wide until linking is handled.
  const noLink = !!(published && region.noAutolink)
  const linkedContent = useMemo(
    () => (page ? (noLink ? page.content : autolinkHtml(page.content, lang, pages, excludeKey)) : ''),
    [page, lang, pages, excludeKey, noLink],
  )
  const linkedFaq = useMemo(
    () => faqItems.map((it) => ({ ...it, content: noLink ? it.content : autolinkHtml(it.content, lang, pages, excludeKey) })),
    [faqItems, lang, pages, excludeKey, noLink],
  )
  const path = published ? regionPath(region.slug).replace(/^\//, '') : ''
  const heroImage = published ? region.image : null
  // Only link the things-to-do guide when the region actually has one published
  // (mirrors CityPage). This excludes unpublished/informational regions such as
  // Abkhazia, which carry no `thingsToDo` block.
  const hasThingsToDo = published && !!region.thingsToDo

  const trail = published
    ? [
        { name: t('breadcrumb.home'), to: '/' },
        { name: t('nav.allDestinations'), to: '/georgia' },
        { name: t('nav.regions'), to: '/georgia/regions' },
        { name: region.name },
      ]
    : []

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
          name: region.name,
          description: seo.description,
          url,
          // Opt-in: a region may point this node at a dedicated 1.91:1 social
          // crop via `jsonLdImage` so schema.org, og:image and twitter:image all
          // name the same file — the mechanism SitePage already uses. Every
          // region without the field keeps the hero rung exactly as before.
          image: `${SITE_URL}${region.jsonLdImage || heroImage}`,
          containedInPlace: { '@type': 'Country', name: 'Georgia' },
        },
        // The cover photo plus the contextual body photos (our own). The non-hero
        // ones render as inline <figure> blocks in the per-locale body HTML (not a
        // gallery grid). Each gets one ImageObject here — contentUrl at the largest
        // shipped variant (img.width), brand credit, its own contentLocation, and the
        // cover flagged hero → representativeOfPage. Mirrors the SitePage/CityPage
        // imageObjects block. Regions whose imageObjects flag no hero (e.g. Svaneti,
        // whose cover is not in this list) simply get representativeOfPage:false.
        ...(region.imageObjects || []).map((img) => ({
          '@type': 'ImageObject',
          contentUrl: `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}w.webp`,
          url: `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}w.webp`,
          width: img.width,
          height: img.height,
          representativeOfPage: !!img.hero,
          name: img.name,
          caption: img.caption,
          description: img.description,
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
        // Inline body images (real <figure class="body-img"> blocks in the per-locale
        // content) that ship variants WITHOUT the `w` filename suffix and need a
        // stable per-image `@id` (e.g. #inline-landscape). Distinct from `imageObjects`
        // above (which builds `-<width>w.webp` city-body-figure inlines with geo).
        // name/caption are localized per locale. An entry may set `hero: true` to
        // become the page's representative image (Adjara's cover, which ships the
        // same no-`w` variants and wants localized strings — the older
        // `imageObjects` hero above is English-only). contentLocation is fully
        // conditional: address/geo drop out for a generic landscape (a NAME-ONLY
        // Place such as "Svaneti, Georgia"), and the whole node drops out when
        // there is no location to claim at all — e.g. a studio dish photograph,
        // where asserting a place would be an invented fact. Mirrors
        // SitePage/CityPage's inlineImageObjects convention.
        ...(region.inlineImageObjects || []).map((img) => ({
          '@type': 'ImageObject',
          '@id': `${url}#${img.anchor}`,
          contentUrl: `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}.webp`,
          url: `${SITE_URL}${img.dir || '/images/files'}/${img.base}-${img.width}.webp`,
          width: img.width,
          height: img.height,
          // emitted only for the hero, so existing regions' nodes are unchanged
          ...(img.hero ? { representativeOfPage: true } : {}),
          name: (img.name && (img.name[lang] || img.name.en)) || '',
          caption: (img.caption && (img.caption[lang] || img.caption.en)) || '',
          description: img.description,
          ...creditFields(img),
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
                          addressCountry: 'GE',
                        },
                      }
                    : {}),
                  ...(img.geo
                    ? { geo: { '@type': 'GeoCoordinates', latitude: img.geo.lat, longitude: img.geo.lng } }
                    : {}),
                },
              }
            : {}),
        })),
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
  }, [published, lang, path, seo.description, heroImage, faqItems])

  useSEO(published ? { ...seo, lang, path, image: heroImage, jsonLd } : {})

  if (!published) return <NotFoundPage />

  return (
    <>
      {/* Small breadcrumb bar above the hero — the H1 is the region name. */}
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      {/* `heroClass` is optional: a region that sets it gets a responsive
          image-set() ladder from CSS (.hero--<slug>) instead of the single-width
          inline background. Regions without it are unchanged. */}
      <HeroSection
        image={heroImage}
        imageAvif={region.imageAvif}
        bgClass={region.heroClass}
        title={(page && page.heroTitle) || region.name}
      />
      <section className="page-items about-georgia">
        <EntityToursTag type="region" slug={region.slug} name={region.name} />
        <FadeUp>
          <div ref={contentRef} dangerouslySetInnerHTML={{ __html: linkedContent }} />
        </FadeUp>
        {hasThingsToDo && (
          <FadeUp>
            <p className="city-ttd-cta">
              <LocaleLink to={thingsToDoPath(region.slug)} className="button">
                {t('city.thingsToDoCta', { city: region.name })}
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
