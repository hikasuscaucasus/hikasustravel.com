import { useContext, useMemo } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import Accordion from '../shared/Accordion'
import { I18nContext } from '../../i18n/I18nContext'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

// Generic Georgia hero image — this is an informational status page, not a
// bookable destination, so it uses no destination-specific imagery, maps,
// "best time to visit" widgets or booking CTAs.
// ⚠️ Still the page's og:image / twitter:image and the Article node's `image`
// even while NO_HERO is on: only the VISIBLE hero is removed.
const HERO_IMAGE = '/images/files/georgia-home.jpg'

// Temporary no-hero state, the same one CityPage and SitePage give a record
// that sets `noHero` while a genuine image is sourced. This page is a
// standalone route with no places.js record to carry that flag, so it is held
// here; the branch below is otherwise identical, down to the `.dest-title-band`
// markup and class. Flip to false to restore the hero exactly as it was.
// Showing the generic georgia-home.jpg was the whole reason to remove it — it
// is a default, not a picture of Abkhazia.
const NO_HERO = true
const SITE_URL = 'https://www.hikasustravel.com'
const PATH = 'abkhazia'

export default function AbkhaziaPage() {
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  // Fall back to English content until per-language translations are loaded.
  const page = pages.abkhazia || enPages.abkhazia
  const seo = getSEO('abkhazia', lang)
  const faqItems = useMemo(() => page.faq || [], [page])
  // Rendered without the internal auto-linker on purpose — linking is handled
  // separately, so this page adds no internal/external links yet.

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
            { '@type': 'ListItem', position: 2, name: page.heroTitle, item: url },
          ],
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
  }, [lang, seo.description, page.heroTitle, faqItems])

  useSEO({ ...seo, lang, path: PATH, image: HERO_IMAGE, jsonLd })

  return (
    <>
      {/* The title band is NOT a removal: it keeps <main>'s child count stable
          so the .page-items :nth-child() light/dark banding below is
          unaffected, it carries the H1 that otherwise lives inside the hero (so
          the page still has exactly one), and its solid background keeps the
          transparent header's cream logo/nav legible. No image, no placeholder,
          no reserved 100dvh. Same band, same class, same reasoning as the
          `noHero` branch in CityPage and SitePage. */}
      {NO_HERO ? (
        <section className="dest-title-band">
          <h1>{page.heroTitle}</h1>
        </section>
      ) : (
        <HeroSection image={HERO_IMAGE} title={page.heroTitle} />
      )}
      <section className="page-items about-georgia">
        <FadeUp>
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </FadeUp>
      </section>
      {faqItems.length > 0 && (
        <section className="page-items faq" id="faq-section">
          <Accordion items={faqItems} headingKey="faq.heroTitle" />
        </section>
      )}
    </>
  )
}
