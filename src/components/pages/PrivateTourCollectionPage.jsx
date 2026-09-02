import { useContext, useEffect, useMemo, useState } from 'react'
import ToursHero from '../shared/ToursHero'
import TourCard from '../shared/TourCard'
import FadeUp from '../shared/FadeUp'
import Breadcrumbs from '../shared/Breadcrumbs'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getPrivateTourCollection, toursForCollection } from '../../data/privateTourCollections'
import NotFoundPage from './NotFoundPage'

const SITE_URL = 'https://www.hikasustravel.com'
const HERO = '/images/files/georgia-tour-01.jpg'

/**
 * A Private Tours collection page at /:lang/private-tours/<collection-slug>:
 * either a starting point (Tours from Tbilisi / Kutaisi) or a category.
 *
 * Search and Sort work on this page's own subset only — the two removed
 * dropdowns are deliberately NOT recreated here, because origin and category
 * are what the URL already expresses. An unknown slug renders the 404 page, so
 * an empty collection can never be published.
 */
export default function PrivateTourCollectionPage({ slug }) {
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('')

  const collection = getPrivateTourCollection(slug)
  const matches = useMemo(() => toursForCollection(collection), [collection])

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  const h1 = collection ? t(collection.h1Key) : ''
  const title = collection ? t(collection.titleKey) : ''
  const description = collection ? t(collection.descriptionKey) : ''
  const path = collection ? collection.path : ''

  // CollectionPage + ItemList, mirroring the /tours/<entity>-tours listings.
  // Deliberately NOT TouristTrip: this page is a list of tours, not a tour.
  const jsonLd = useMemo(() => {
    if (!collection || !matches.length) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: h1,
      description,
      url: `${SITE_URL}/${lang}/${path}`,
      inLanguage: lang,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: matches.map((tour, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}/${lang}/private-tours/${tour.slug}`,
          name: tourTranslations?.[tour.slug]?.title || tour.title,
        })),
      },
    }
  }, [collection, matches, h1, description, lang, path, tourTranslations])

  useSEO(collection && matches.length
    ? { title, description, lang, path, image: HERO, jsonLd }
    : {})

  const filtered = useMemo(() => {
    let list = matches
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((tour) => {
        const tt = tourTranslations?.[tour.slug]
        const name = (tt?.title || tour.title).toLowerCase()
        const desc = (tt?.listingDescription || tt?.description || tour.listingDescription || tour.description || '').toLowerCase()
        const dests = (tour.map?.markers?.map((m) => m.title) || []).join(' ').toLowerCase()
        return name.includes(q) || desc.includes(q) || dests.includes(q)
      })
    }
    if (sort === 'days-asc') list = [...list].sort((a, b) => a.days - b.days)
    else if (sort === 'days-desc') list = [...list].sort((a, b) => b.days - a.days)
    else if (sort === 'name') list = [...list].sort((a, b) => {
      const aName = tourTranslations?.[a.slug]?.title || a.title
      const bName = tourTranslations?.[b.slug]?.title || b.title
      return aName.localeCompare(bName)
    })
    return list
  }, [matches, tourTranslations, search, sort])

  if (!collection || !matches.length) return <NotFoundPage />

  const trail = [
    { name: t('breadcrumb.home'), to: '/' },
    { name: t('tour.privateTours'), to: '/private-tours' },
    { name: h1 },
  ]

  return (
    <>
      <div className="dest-breadcrumbs">
        <Breadcrumbs trail={trail} />
      </div>

      <ToursHero
        compact
        image={HERO}
        title={h1}
        tourCount={filtered.length}
        searchValue={search}
        onSearchChange={setSearch}
        sortValue={sort}
        onSortChange={setSort}
      />

      <section className="page-items ptc-intro-section">
        <FadeUp>
          <p className="ptc-intro">{t(collection.introKey)}</p>
        </FadeUp>
      </section>

      <section className="tour-listing" aria-label={h1}>
        {filtered.length > 0 ? (
          filtered.map((tour, index) => (
            <TourCard
              key={tour.slug}
              tour={tour}
              translation={tourTranslations?.[tour.slug]}
              index={index}
              basePath="/private-tours"
            />
          ))
        ) : (
          <div className="tour-listing__empty">
            <p>{t('tour.noResults')}</p>
          </div>
        )}
      </section>
    </>
  )
}
