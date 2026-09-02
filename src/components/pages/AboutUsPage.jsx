import { useContext } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import { I18nContext } from '../../i18n/I18nContext'
import useLang from '../../i18n/useLang'
import { useLinkedHtml } from '../../utils/autolinkReact'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

export default function AboutUsPage() {
  const { pages } = useContext(I18nContext)
  const t = useT()
  const { lang } = useLang()
  const page = pages.aboutUs || {}
  const linkedContent = useLinkedHtml(page.content)
  const seo = getSEO('aboutUs', lang)
  useSEO({ ...seo, lang, path: 'about-us', image: '/images/files/about-us.jpg' })

  return (
    <>
      <HeroSection image="/images/files/about-us.jpg" title={page.heroTitle} />
      <section className="page-items about-us">
        <FadeUp>
          <div dangerouslySetInnerHTML={{ __html: linkedContent }} />
        </FadeUp>
        <FadeUp>
          <p className="about-cta-row">
            <LocaleLink to="/contact" className="iv-pill">
              {t('home.ctaTailorMade')}
            </LocaleLink>
          </p>
        </FadeUp>
      </section>
    </>
  )
}
