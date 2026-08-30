import { useContext, useMemo } from 'react'
import Accordion from '../shared/Accordion'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

export default function FaqPage() {
  const t = useT()
  const { lang } = useLang()
  const { faq } = useContext(I18nContext)

  const seo = getSEO('faq', lang)
  const faqJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faq || []).map(item => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.content,
      },
    })),
  }), [faq])
  useSEO({ ...seo, lang, path: 'faq', image: '/images/files/georgia-tour-14.jpg', jsonLd: faqJsonLd })

  // This page renders no hero, permanently — it is a plain Q&A list, not a
  // destination. It uses the same title band as the site's other hero-less
  // pages: the band carries the single <h1> and its solid background keeps the
  // absolutely-positioned header's cream logo and nav legible, which a bare
  // light page cannot. The accordion's own heading is suppressed because it
  // would repeat that <h1> word for word. The og:image above is unaffected —
  // a social preview does not require a visible hero.
  return (
    <>
      <section className="dest-title-band">
        <h1>{t('faq.heroTitle')}</h1>
      </section>
      <section className="page-items faq" id="faq-section">
        <Accordion items={faq} headingKey="faq.heroTitle" hideHeading />
      </section>
    </>
  )
}
