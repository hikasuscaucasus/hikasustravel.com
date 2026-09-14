import { useContext, useEffect, useState, useMemo } from 'react'
import ToursHero from '../shared/ToursHero'
import TourCard from '../shared/TourCard'
import PrivateTourCollectionLinks from '../shared/PrivateTourCollectionLinks'
import { tours } from '../../data/tours'
import { PRIVATE_TOUR_CATEGORIES } from '../../data/tourCategories'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

function isWinterTour(tour) {
  return (PRIVATE_TOUR_CATEGORIES[tour.slug] || []).includes('winter-tours')
}

// Winter/ski tours are pulled out of the day-range bands entirely and shown
// only in their own band, even though their day count would otherwise place
// them in "Classic routes" or "Grand tours" too.
const DURATION_BANDS = [
  { key: 'short', labelKey: 'tour.bandShort', min: 3, max: 5 },
  { key: 'classic', labelKey: 'tour.bandClassic', min: 6, max: 9 },
  { key: 'grand', labelKey: 'tour.bandGrand', min: 10, max: 20 },
]

/**
 * The Private Tours hub. Search works over the whole catalogue; the former
 * "Tours From" and "Tour Categories" dropdowns are crawlable links to the
 * eight collection pages under /private-tours/ (see PrivateTourCollectionLinks).
 *
 * The flat list is grouped into fixed duration bands (short/classic/grand/
 * winter) rather than offered a days/name sort — a single flat sort control
 * doesn't compose cleanly with bands, so it is removed in favour of the
 * grouped view itself acting as the ordering.
 */
export default function PrivateToursPage() {
  const privateTours = tours.filter((t) => t.type === 'private')
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const [search, setSearch] = useState('')
  const seo = getSEO('privateTours', lang)

  useSEO({ ...seo, lang, path: 'private-tours', image: '/images/files/georgia-tour-01.jpg' })

  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  const filtered = useMemo(() => {
    let list = privateTours

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((tour) => {
        const tt = tourTranslations?.[tour.slug]
        const title = (tt?.title || tour.title).toLowerCase()
        const desc = (tt?.listingDescription || tt?.description || tour.listingDescription || tour.description || '').toLowerCase()
        const dests = (tour.map?.markers?.map((m) => m.title) || []).join(' ').toLowerCase()
        return title.includes(q) || desc.includes(q) || dests.includes(q)
      })
    }

    return list
  }, [privateTours, tourTranslations, search])

  const bands = useMemo(() => {
    const winter = filtered.filter(isWinterTour).sort((a, b) => a.days - b.days)
    const rest = filtered.filter((tour) => !isWinterTour(tour))
    const result = DURATION_BANDS.map((band) => ({
      ...band,
      tours: rest.filter((tour) => tour.days >= band.min && tour.days <= band.max).sort((a, b) => a.days - b.days),
    }))
    result.push({ key: 'winter', labelKey: 'tour.bandWinter', tours: winter })
    return result.filter((band) => band.tours.length > 0)
  }, [filtered])

  return (
    <>
      <ToursHero
        compact
        image="/images/files/georgia-tour-01.jpg"
        title={t('tour.privateTours')}
        subtitle={t('tour.privateToursSubtitle')}
        tourCount={filtered.length}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <PrivateTourCollectionLinks />

      <section className="tour-listing-bands" aria-label={t('tour.privateTours')}>
        {bands.length > 0 ? (
          bands.map((band) => (
            <div key={band.key} className="tour-band">
              <h2 className="tour-band__title">{t(band.labelKey)}</h2>
              <div className="tour-listing">
                {band.tours.map((tour, index) => (
                  <TourCard
                    key={tour.slug}
                    tour={tour}
                    translation={tourTranslations?.[tour.slug]}
                    index={index}
                    basePath="/private-tours"
                  />
                ))}
              </div>
            </div>
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
