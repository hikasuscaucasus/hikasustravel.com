import { useContext } from 'react'
import FadeUp from '../shared/FadeUp'
import { I18nContext } from '../../i18n/I18nContext'
import useLang from '../../i18n/useLang'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'
import { IMAGE_LICENSING_PATH } from '../../utils/imageLicense'

// Image Usage & Licensing — the page every ImageObject's `license` and
// `acquireLicensePage` point at (see src/utils/imageLicense.js). Same template
// as the Terms and Privacy pages: title band + localized HTML from pages.json.
export default function ImageLicensingPage() {
  const { pages } = useContext(I18nContext)
  const { lang } = useLang()
  const page = pages.imageLicensing || {}
  const seo = getSEO('imageLicensing', lang)
  useSEO({ ...seo, lang, path: IMAGE_LICENSING_PATH, image: '/images/files/georgia-tour-13.jpg' })

  return (
    <>
      <section className="dest-title-band">
        <h1>{page.heroTitle}</h1>
      </section>
      <section className="page-items image-licensing">
        <FadeUp>
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </FadeUp>
      </section>
    </>
  )
}
