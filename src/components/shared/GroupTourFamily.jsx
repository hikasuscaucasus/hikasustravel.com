import { useContext } from 'react'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import { I18nContext } from '../../i18n/I18nContext'
import { countryLabels, familyOf } from '../../utils/groupTourFamily'
import { formatPrice, parsePrice } from './pricingUtils'

/* The scheduled group tours that share one departure calendar
   (`departureFamily` on the tour record, see src/data/groupDepartures.js) are
   sold as one family: the full 15-day route and its two 11-day sections.
   This compact chooser sits under the Overview on each of their pages so a
   visitor who finds the open tour too long (or too short) sees the other two
   without hunting through the site. It compares exactly three things —
   duration, countries, fixed price — and nothing else: no dates, no
   supplements, no hotels. The open tour is marked, not linked. */

export default function GroupTourFamily({ current }) {
  const t = useT()
  const { tourTranslations } = useContext(I18nContext)
  const family = familyOf(current)
  if (family.length < 2) return null

  return (
    <section id="family" className="td-section td-family" aria-labelledby="td-family-title">
      <h2 id="td-family-title" className="td-section__title">{t('tour.familyTitle')}</h2>
      <p className="td-section__subtitle">{t('tour.familyIntro')}</p>
      <ul className="td-family__list">
        {family.map((tour) => {
          const isCurrent = tour.slug === current.slug
          const tt = tourTranslations?.[tour.slug]
          const title = tt?.shortTitle || tour.tourFormTitle || tt?.title || tour.title
          const price = parsePrice(tour.pricePerPerson)
          const url = `/group-tours/${tour.slug}`
          return (
            <li
              key={tour.slug}
              className={`td-family__item${isCurrent ? ' td-family__item--current' : ''}`}
              aria-current={isCurrent ? 'page' : undefined}
            >
              <span className="td-family__days">{tour.days} {t('tour.days')}</span>
              <span className="td-family__main">
                <span className="td-family__title">
                  {isCurrent ? title : <LocaleLink to={url}>{title}</LocaleLink>}
                </span>
                <span className="td-family__countries">{countryLabels(tour, t)}</span>
              </span>
              {price && (
                <span className="td-family__price">
                  <strong>{formatPrice(price)}</strong> <span>{t('pricing.perPerson')}</span>
                </span>
              )}
              {isCurrent ? (
                <span className="td-family__badge">{t('tour.familyCurrent')}</span>
              ) : (
                <LocaleLink to={url} className="td-family__cta">{t('tour.exploreTour')}</LocaleLink>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
