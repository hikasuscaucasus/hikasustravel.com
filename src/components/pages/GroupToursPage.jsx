import { useContext, useEffect } from 'react'
import HeroSection from '../shared/HeroSection'
import FadeUp from '../shared/FadeUp'
import BlurUpBackground from '../shared/BlurUpBackground'
import { tours } from '../../data/tours'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import LocaleLink from '../../i18n/LocaleLink'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

export default function GroupToursPage() {
  const groupTours = tours.filter((t) => t.type === 'group')
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const seo = getSEO('groupTours', lang)
  useSEO({ ...seo, lang, path: 'group-tours', image: '/images/files/Gergeti-Church.jpg' })

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  return (
    <>
      {/* Hero shows the same Gergeti frame as the Georgia Group Tour page it
          lists, from that tour's own image folder. `imageAvif` upgrades the
          CSS background to AVIF via image-set() where the browser supports it
          — the same opt-in the city/region/site heroes use. The legacy
          /images/files/Gergeti-Church.jpg is still referenced by a blog post,
          so it stays on disk. */}
      <HeroSection
        image="/images/group-tours/georgia-group-tour/gergeti-trinity-church-kazbegi-georgia-1448.webp"
        imageAvif="/images/group-tours/georgia-group-tour/gergeti-trinity-church-kazbegi-georgia-1448.avif"
        title={t('tour.groupTours')}
      />

      <div className="tour-listing">
        {groupTours.map((tour) => {
          const tt = tourTranslations?.[tour.slug]
          return (
            <FadeUp key={tour.slug}>
              <div className="tour-item tour-item-card">
                <LocaleLink
                  to={`/group-tours/${tour.slug}`}
                  className="tour-image-link"
                  aria-label={tt?.title || tour.title}
                >
                  <BlurUpBackground
                    src={tour.listingImage || tour.heroImage}
                    className="tour-image"
                  >
                    <div className="tour-image-scrim" aria-hidden="true" />
                  </BlurUpBackground>
                </LocaleLink>
                <div className="tour-info">
                  <h2>
                    <LocaleLink to={`/group-tours/${tour.slug}`}>{tt?.title || tour.title}</LocaleLink>
                  </h2>
                  <h3>{tour.days} {t('tour.days')}</h3>
                  <p>{tt?.listingDescription || tt?.description || tour.listingDescription || tour.description}</p>
                  <div className="more">
                    <LocaleLink to={`/group-tours/${tour.slug}`}>{t('tour.moreInfo')}</LocaleLink>
                  </div>
                </div>
                <div className="tour-data">
                  {tour.groupDates && (
                    <>
                      <div className="available">{t('tour.availableDates')}</div>
                      <div className="date-chips">
                        {/* Same rule as the homepage card: only bookable dates. */}
                        {tour.groupDates
                          .filter((d) => !d.soldOut)
                          .map((d, i) => (
                          <div key={i} className="date-chip">
                            <span className="date-range">{d.start} – {d.end}</span>
                            <span className="date-year">{d.year}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {tour.pricePerPerson && (
                    <div className="tour-data-price">{t('tour.perPerson', { price: tour.pricePerPerson })}</div>
                  )}
                </div>
              </div>
            </FadeUp>
          )
        })}
      </div>
    </>
  )
}
