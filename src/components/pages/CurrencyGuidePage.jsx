import { useContext, useMemo } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import { I18nContext } from '../../i18n/I18nContext'
import useLang from '../../i18n/useLang'
import { useLinkedHtml, useLinkedFaq } from '../../utils/autolinkReact'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

// The 20/50/100 lari banknotes, National Bank of Georgia specimen artwork —
// public domain under Georgian copyright law (banknotes are exempt as
// official state symbols; commons.wikimedia.org/wiki/File:20,_50_and_100_
// lari._Georgia,_2016_a.png, sourced from the National Bank of Georgia).
// Replaces a Kutaisi market-produce photo that only loosely evoked "money"
// and duplicated that market's own destination-page hero; this reads as
// Georgian currency immediately. Same asset is used as the blog card image
// (src/data/blogData.js's blogGuides entry) so the two match everywhere.
const HERO_IMAGE = '/images/files/georgian-lari-banknotes-currency-georgia-1200.webp'
const HERO_IMAGE_AVIF = '/images/files/georgian-lari-banknotes-currency-georgia-1200.avif'
const OG_IMAGE = '/images/files/georgian-lari-banknotes-currency-georgia-og.jpg'
const SITE_URL = 'https://www.hikasustravel.com'
const PATH = 'georgian-lari-currency-guide'

const HERO_ALT = {
  en: 'Georgian lari banknotes: 20, 50 and 100 GEL',
  de: 'Georgische Lari-Banknoten: 20, 50 und 100 GEL',
  fr: 'Billets en lari géorgien : 20, 50 et 100 GEL',
  es: 'Billetes de lari georgiano: 20, 50 y 100 GEL',
  nl: 'Georgische laribiljetten: 20, 50 en 100 GEL',
  cs: 'Bankovky gruzínského lari: 20, 50 a 100 GEL',
  pl: 'Banknoty gruzińskiego lari: 20, 50 i 100 GEL',
}

export default function CurrencyGuidePage() {
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  // Fall back to English content until per-language translations are added.
  const page = pages.lariGuide || enPages.lariGuide
  const seo = getSEO('lariGuide', lang)
  const faqItems = useMemo(() => page.faq || [], [page])
  const linkedContent = useLinkedHtml(page.content)
  const linkedFaq = useLinkedFaq(faqItems)

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
            { '@type': 'ListItem', position: 2, name: 'Georgian Lari (GEL) Currency Guide', item: url },
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
  }, [lang, seo.description, page.heroTitle, faqItems])

  const imageAlt = HERO_ALT[lang] || HERO_ALT.en
  useSEO({ ...seo, lang, path: PATH, image: OG_IMAGE, imageAlt, jsonLd })

  return (
    <>
      <HeroSection image={HERO_IMAGE} imageAvif={HERO_IMAGE_AVIF} title={page.heroTitle} />
      <section className="page-items about-georgia">
        <FadeUp>
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
