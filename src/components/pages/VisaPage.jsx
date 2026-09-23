import { useContext, useMemo } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import { I18nContext } from '../../i18n/I18nContext'
import useLang from '../../i18n/useLang'
import { useLinkedHtml, useLinkedFaq } from '../../utils/autolinkReact'
import useT from '../../i18n/useT'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

const SITE_URL = 'https://www.hikasustravel.com'

// Per-country settings for this one shared page. Armenia passes
// `country="armenia"`. `breadcrumbName` is the English schema label — the
// visible breadcrumb comes from the localized content, but this JSON-LD name
// has always been English on the Georgia page, so both countries keep that
// behaviour.
const VISA_PAGES = {
  georgia: {
    pageKey: 'visaGuide',
    seoKey: 'visaGuide',
    path: 'georgia-visa-entry-requirements',
    breadcrumbName: 'Georgia Visa & Entry Requirements',
    // Permanently no hero (matches the Azerbaijan visa page): the solid
    // `.dest-title-band` carries the H1 instead. og:image/twitter:image keep
    // the site-wide default (georgia-home.jpg) via prerender.js's
    // staticPageImages fallback — unaffected by this page having no hero.
    noHero: true,
  },
  armenia: {
    pageKey: 'armeniaVisaGuide',
    seoKey: 'armeniaVisaGuide',
    path: 'armenia-visa-entry-requirements',
    breadcrumbName: 'Armenia Visa & Entry Requirements',
    // Permanently no hero (matches the Azerbaijan visa page): the solid
    // `.dest-title-band` carries the H1 instead. `ogImage` keeps this page on
    // its own Khor Virap social crop (also set in prerender.js's
    // staticPageImages) rather than falling back to Georgia's default photo.
    noHero: true,
    ogImage: '/images/files/khor-virap-monastery-ararat-armenia-og.jpg',
  },
  azerbaijan: {
    pageKey: 'azerbaijanVisaGuide',
    seoKey: 'azerbaijanVisaGuide',
    path: 'azerbaijan-visa-entry-requirements',
    breadcrumbName: 'Azerbaijan Visa & Entry Requirements',
    // No photograph of Azerbaijan exists in the repo yet. Rather than put a
    // Georgian or Armenian picture on this page (and in its social card), it
    // renders the solid `.dest-title-band` the destination pages use for the
    // same situation, asserts no image in its Article node, and prerender.js
    // strips the template og:image for its explicit null. Swap in a hero and
    // og:image when an Azerbaijani photograph arrives.
    noHero: true,
  },
}

function formatDate(dateStr, lang) {
  try {
    return new Date(dateStr).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function VisaPage({ country = 'georgia' }) {
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const t = useT()
  const conf = VISA_PAGES[country] || VISA_PAGES.georgia
  const HERO_IMAGE = conf.hero
  const PATH = conf.path
  // Fall back to English content until per-language translations are added.
  const page = pages[conf.pageKey] || enPages[conf.pageKey]
  const seo = getSEO(conf.seoKey, lang)
  const faqItems = useMemo(() => page.faq || [], [page])
  const linkedContent = useLinkedHtml(page.content)
  const linkedFaq = useLinkedFaq(faqItems)
  const published = page.date

  const jsonLd = useMemo(() => {
    const url = `${SITE_URL}/${lang}/${PATH}`
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: page.heroTitle,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          ...(HERO_IMAGE ? { image: `${SITE_URL}${HERO_IMAGE}` } : {}),
          ...(published && { datePublished: published, dateModified: published }),
          author: { '@type': 'Organization', name: 'Hikasus Travel' },
          publisher: {
            '@type': 'Organization',
            name: 'Hikasus Travel',
            url: SITE_URL,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}` },
            { '@type': 'ListItem', position: 2, name: conf.breadcrumbName, item: url },
          ],
        },
        {
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.title,
            acceptedAnswer: { '@type': 'Answer', text: item.content },
          })),
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, seo.description, page.heroTitle, faqItems, published, conf])

  useSEO({ ...seo, lang, path: PATH, image: conf.ogImage || HERO_IMAGE, jsonLd })

  return (
    <>
      {conf.noHero ? (
        /* No approved photograph yet — the same solid title band the
           destination pages use for `noHero`, carrying the page's single H1. */
        <section className="dest-title-band">
          <h1>{page.heroTitle}</h1>
        </section>
      ) : (
        <HeroSection image={HERO_IMAGE} imageAvif={conf.heroAvif} title={page.heroTitle} />
      )}
      <section className="page-items about-georgia">
        <FadeUp>
          {published && (
            <p className="page-published">{t('page.publishedOn')} {formatDate(published, lang)}</p>
          )}
          <div dangerouslySetInnerHTML={{ __html: linkedContent }} />
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
