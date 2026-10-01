import { useContext, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import Breadcrumbs from '../shared/Breadcrumbs'
import { I18nContext } from '../../i18n/I18nContext'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { useLinkedHtml, useLinkedFaq } from '../../utils/autolinkReact'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import {
  borderOverview,
  getBorderCrossing,
  borderHubPath,
  borderCrossingPath,
} from '../../data/borders'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.hikasustravel.com'

/**
 * Generic border-crossing page. Driven by the borders.js registry and serves
 * two routes:
 *   - the overview guide at /georgia/border-crossings        (overview prop)
 *   - an individual crossing at /georgia/border-crossings/:borderSlug
 *
 * It uses the article layout (hero + HTML body + FAQ) like the city pages, but
 * without destination-only widgets (maps, "best time to visit"), since a border
 * crossing is a reference page, not a destination.
 */
export default function BorderCrossingPage({ overview = false }) {
  const { borderSlug } = useParams()
  const entry = overview ? borderOverview : getBorderCrossing(borderSlug)
  const t = useT()
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const navigate = useNavigate()
  const contentRef = useRef(null)

  const published = !!entry && entry.published
  const contentKey = published ? entry.contentKey : null
  // Fall back to the English copy until a translation exists (same as cities).
  const page = published ? (pages[contentKey] || enPages[contentKey]) : null
  const seo = getSEO(published ? entry.seoKey : 'destinations', lang)
  const faqItems = useMemo(() => (page && page.faq) || [], [page])
  const linkedContent = useLinkedHtml(page.content)
  const linkedFaq = useLinkedFaq(faqItems)
  const heroImage = published ? entry.image : null
  const path = overview
    ? borderHubPath.replace(/^\//, '')
    : published
      ? borderCrossingPath(entry.slug).replace(/^\//, '')
      : ''

  const trail = !published
    ? []
    : overview
      ? [
          { name: t('breadcrumb.home'), to: '/' },
          { name: t('nav.allDestinations'), to: '/georgia' },
          { name: t('nav.borderCrossings') },
        ]
      : [
          { name: t('breadcrumb.home'), to: '/' },
          { name: t('nav.allDestinations'), to: '/georgia' },
          { name: t('nav.borderCrossings'), to: '/georgia/border-crossings' },
          { name: entry.name },
        ]

  // Intercept in-content internal links (data-internal) for same-tab SPA nav.
  // (No links yet, but future-proof and consistent with the other pages.)
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
          '@type': 'Article',
          headline: page.heroTitle,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          image: `${SITE_URL}${heroImage}`,
          about: { '@type': 'Country', name: 'Georgia' },
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
      {/* Small breadcrumb bar above the hero — the H1 is the page title. */}
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      {entry.noHero ? (
        // Hero-free page: the same solid title band the other no-hero pages use,
        // carrying the H1. It stays in <main> so the alternating page-items
        // bands below keep their order. `heroImage` still feeds og/JSON-LD.
        <section className="dest-title-band">
          <h1>{page.heroTitle}</h1>
        </section>
      ) : (
        <HeroSection image={heroImage} title={page.heroTitle} />
      )}
      <section className="page-items about-georgia">
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
