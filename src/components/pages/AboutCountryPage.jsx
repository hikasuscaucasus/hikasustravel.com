import { useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import DishModal from '../shared/DishModal'
import Accordion from '../shared/Accordion'
import { I18nContext } from '../../i18n/I18nContext'
import useLang from '../../i18n/useLang'
import { useLinkedHtml, useLinkedFaq } from '../../utils/autolinkReact'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import dishData from '../../data/dishData'

const SITE_URL = 'https://www.hikasustravel.com'

// Per-country settings for this one shared page, the same pattern VisaPage
// uses. Georgia's are the defaults, so its route renders exactly as before —
// same content key, same image, same dish-click-to-modal behavior, no FAQ
// schema (it never had one). Armenia and Azerbaijan opt into a visible FAQ +
// FAQPage/Article/BreadcrumbList JSON-LD, which Georgia's page has never had;
// adding that to Georgia too would be a scope change nobody asked for.
const ABOUT_PAGES = {
  georgia: {
    pageKey: 'aboutGeorgia',
    seoKey: 'aboutGeorgia',
    path: 'about-georgia',
    // A wide, uncropped view of Gergeti Trinity Church on its hilltop against
    // the Greater Caucasus — replaces a generic, unrecognizable alpine-meadow
    // photo that could have been any mountain range. Chosen over the
    // gergeti-trinity-church-kazbegi-georgia-* asset family already used
    // across the homepage, group tours and several tour pages: same landmark,
    // but this frame has no tourists on the path and gives this page its own
    // identity rather than repeating an already-heavily-used shot.
    // Rendered via `.hero--about-georgia` (bgClass) rather than the plain
    // image/imageAvif props below, because the church sits off-centre
    // (~30% across) and needs a custom background-position to survive a
    // narrow mobile crop — see the CSS comment in styles.css.
    image: '/images/files/gergeti-church-kazbegi-panorama-georgia.webp',
    ogImage: '/images/files/gergeti-church-kazbegi-panorama-georgia-og.jpg',
    bgClass: 'hero--about-georgia',
    imageAlt: {
      en: 'Gergeti Trinity Church and the Greater Caucasus mountains in Georgia',
      de: 'Gergeti-Dreifaltigkeitskirche und die Berge des Großen Kaukasus in Georgien',
      fr: "L'église de la Trinité de Gergeti et les montagnes du Grand Caucase en Géorgie",
      es: 'La iglesia de la Trinidad de Gergeti y las montañas del Gran Cáucaso en Georgia',
      nl: 'De Drie-eenheidskerk van Gergeti en de bergen van de Grote Kaukasus in Georgië',
      cs: 'Kostel Nejsvětější Trojice v Gergeti a hory Velkého Kavkazu v Gruzii',
      pl: 'Cerkiew Trójcy Świętej w Gergeti i góry Wielkiego Kaukazu w Gruzji',
    },
    hasDishModal: true,
  },
  armenia: {
    pageKey: 'aboutArmenia',
    seoKey: 'aboutArmenia',
    path: 'about-armenia',
    // Khor Virap under Ararat — the same approved Armenian photograph
    // VisaPage's Armenia route already uses. Reusing it here keeps this page
    // off Georgia's or Azerbaijan's imagery without sourcing a new asset.
    image: '/images/files/khor-virap-monastery-ararat-armenia-1086.webp',
    imageAvif: '/images/files/khor-virap-monastery-ararat-armenia-1086.avif',
    ogImage: '/images/files/khor-virap-monastery-ararat-armenia-og.jpg',
    hasFaqSchema: true,
    breadcrumbName: 'About Armenia',
  },
  azerbaijan: {
    pageKey: 'aboutAzerbaijan',
    seoKey: 'aboutAzerbaijan',
    path: 'about-azerbaijan',
    // No approved Azerbaijani photograph exists in the repo yet — the same
    // solid title band VisaPage's Azerbaijan route uses rather than borrowing
    // a Georgian or Armenian picture (and putting it in this page's og:image).
    noHero: true,
    hasFaqSchema: true,
    breadcrumbName: 'About Azerbaijan',
  },
}

export default function AboutCountryPage({ country = 'georgia' }) {
  const { pages, enPages } = useContext(I18nContext)
  const { lang } = useLang()
  const conf = ABOUT_PAGES[country] || ABOUT_PAGES.georgia
  const page = pages[conf.pageKey] || enPages[conf.pageKey] || {}
  const linkedContent = useLinkedHtml(page.content)
  const seo = getSEO(conf.seoKey, lang)

  const faqItems = useMemo(() => page.faq || [], [page])
  const linkedFaq = useLinkedFaq(faqItems)

  const contentRef = useRef(null)
  const [selectedDish, setSelectedDish] = useState(null)
  const closeDish = useCallback(() => setSelectedDish(null), [])

  useEffect(() => {
    if (!conf.hasDishModal) return
    const el = contentRef.current
    if (!el) return

    function handleClick(e) {
      const li = e.target.closest('li')
      if (!li || !el.contains(li)) return

      const img = li.querySelector('img')
      if (!img) return

      const src = img.getAttribute('src') || ''
      const match = src.match(/\/images\/dishes\/(.+)\.\w+$/)
      if (!match) return

      const slug = match[1]
      if (dishData[slug]) {
        setSelectedDish(dishData[slug])
      }
    }

    el.addEventListener('click', handleClick)
    return () => el.removeEventListener('click', handleClick)
  }, [conf.hasDishModal])

  const jsonLd = useMemo(() => {
    if (!conf.hasFaqSchema) return undefined
    const url = `${SITE_URL}/${lang}/${conf.path}`
    const image = conf.ogImage || conf.image
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Article',
          headline: page.heroTitle,
          description: seo.description,
          inLanguage: lang,
          mainEntityOfPage: url,
          ...(image ? { image: `${SITE_URL}${image}` } : {}),
          author: { '@type': 'Organization', name: 'Hikasus Travel' },
          publisher: { '@type': 'Organization', name: 'Hikasus Travel', url: SITE_URL },
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
          mainEntity: faqItems.map((item) => ({
            '@type': 'Question',
            name: item.title,
            acceptedAnswer: { '@type': 'Answer', text: item.content },
          })),
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, seo.description, page.heroTitle, faqItems, conf])

  const imageAlt = conf.imageAlt?.[lang] || conf.imageAlt?.en
  useSEO({ ...seo, lang, path: conf.path, image: conf.ogImage || conf.image, imageAlt, jsonLd })

  return (
    <>
      {conf.noHero ? (
        <section className="dest-title-band">
          <h1>{page.heroTitle}</h1>
        </section>
      ) : (
        <HeroSection
          image={conf.image}
          imageAvif={conf.imageAvif}
          bgClass={conf.bgClass || ''}
          title={page.heroTitle}
        />
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
      {selectedDish && <DishModal dish={selectedDish} lang={lang} onClose={closeDish} />}
    </>
  )
}
