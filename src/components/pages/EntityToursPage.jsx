import { useContext, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import HeroSection from '../shared/HeroSection'
import TourCard from '../shared/TourCard'
import FadeUp from '../shared/FadeUp'
import Breadcrumbs from '../shared/Breadcrumbs'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getEntityTourPage, toursForEntity } from '../../data/entityTours'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.hikasustravel.com'

// Prefix for a tour's own detail URL (group vs private) — a listing can mix both.
const tourBasePath = (tour) => (tour.type === 'group' ? '/group-tours' : '/private-tours')

/**
 * Generated "<Entity> Tours" listing page at /:lang/tours/<entity-slug>-tours.
 * Lists every active private + group tour whose itinerary includes the entity
 * (from src/data/entityTours.js). An unknown slug, or an entity with no matching
 * tours, renders the 404 page — so an empty listing is never shown.
 */
export default function EntityToursPage() {
  const { slug } = useParams()
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)

  const page = getEntityTourPage(slug)
  const matches = useMemo(() => (page ? toursForEntity(page.type, page.slug) : []), [page])

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  const name = page ? page.name : ''
  const path = page ? page.path : ''
  const title = page ? t('tours.listMetaTitle', { name }) : ''
  const description = page ? t('tours.listMetaDescription', { name }) : ''

  const jsonLd = useMemo(() => {
    if (!page || !matches.length) return null
    const url = `${SITE_URL}/${lang}/${path}`
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: t('tours.entityToursCta', { name }),
      description,
      url,
      inLanguage: lang,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: matches.map((tour, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/${lang}${tourBasePath(tour)}/${tour.slug}`,
          name: tourTranslations?.[tour.slug]?.title || tour.title,
        })),
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, lang, path, name, description, matches, tourTranslations])

  useSEO(page && matches.length
    ? { title, description, lang, path, image: '/images/files/georgia-tour-01.jpg', jsonLd }
    : {})

  if (!page || !matches.length) return <NotFoundPage />

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('tours.entityToursCta', { name }) },
  ]

  return (
    <>
      {/* Breadcrumb bar above the hero, then the standard full-screen hero (the
          site header is a transparent overlay that expects a hero behind it — so
          this matches CityPage/SitePage and avoids the header overlapping the
          page content). The hero <h1> is the page title. */}
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>
      <HeroSection className="hero--compact" image="/images/files/georgia-tour-01.jpg" title={t('tours.entityToursCta', { name })} />
      <section className="page-items entity-tours-header">
        <FadeUp>
          <p className="entity-tours-intro">{t('tours.listIntro', { name })}</p>
        </FadeUp>
      </section>
      <section className="tour-listing" aria-label={t('tours.entityToursCta', { name })}>
        {matches.map((tour, index) => (
          <TourCard
            key={tour.slug}
            tour={tour}
            translation={tourTranslations?.[tour.slug]}
            index={index}
            basePath={tourBasePath(tour)}
          />
        ))}
      </section>
    </>
  )
}
