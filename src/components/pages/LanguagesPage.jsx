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

// The Mkhedruli alphabet chart is already used by the sibling "Essential
// Georgian Words and Phrases" article, so this guide (about the wider
// Kartvelian language family — Georgian, Mingrelian, Svan, Laz) uses a
// distinct image: the Svan stone towers of Mestia, tying to the Svan
// language this article specifically discusses.
const HERO_IMAGE = '/images/files/mestia-svan-tower-houses-svaneti-georgia-1200.webp'
const SITE_URL = 'https://www.hikasustravel.com'
const PATH = 'languages-of-georgia'

function formatDate(dateStr, lang) {
  try {
    return new Date(dateStr).toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function LanguagesPage() {
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const t = useT()
  // Fall back to English content until per-language translations are added.
  const page = pages.languagesGuide || enPages.languagesGuide
  const seo = getSEO('languagesGuide', lang)
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
          image: `${SITE_URL}${HERO_IMAGE}`,
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
            { '@type': 'ListItem', position: 2, name: 'Languages of Georgia', item: url },
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
  }, [lang, seo.description, page.heroTitle, faqItems, published])

  useSEO({ ...seo, lang, path: PATH, image: HERO_IMAGE, jsonLd })

  return (
    <>
      <HeroSection image={HERO_IMAGE} title={page.heroTitle} />
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
