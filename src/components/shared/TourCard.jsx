import BlurUpBackground from './BlurUpBackground'
import FadeUp from './FadeUp'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import { tierStartingFrom } from './pricingUtils'

// An owner-approved advertised Classic price wins over the 4-traveller row when
// the tour ships one, so the listing badge matches the detail page. Opt-in.
function getClassicPrice(pricing, startingFrom) {
  const advertised = tierStartingFrom(startingFrom, 'economy')
  if (advertised !== null) return advertised
  if (!pricing || pricing.length === 0) return null
  const row = pricing.find((r) => r.travelers === '4')
  if (!row || !row.economy) return null
  const num = parseFloat(row.economy.replace(/[^0-9.]/g, ''))
  return isNaN(num) || num <= 0 ? null : num
}

export default function TourCard({ tour, translation, index = 0, basePath = '/private-tours' }) {
  const t = useT()
  const tt = translation
  const isReversed = index % 2 === 1
  const destinations = tour.map?.markers?.map((m) => m.title) || []
  const title = tt?.title || tour.title
  const description = tt?.listingDescription || tt?.description || tour.listingDescription || tour.description
  const tourUrl = `${basePath}/${tour.slug}`
  const classicPrice = getClassicPrice(tour.pricing, tour.startingFrom)

  return (
    <FadeUp>
      <article className={`tc${isReversed ? ' tc--rev' : ''}`}>
        <LocaleLink to={tourUrl} className="tc__img-link" aria-label={title}>
          <BlurUpBackground
            src={tour.listingImage || tour.heroImage}
            position={tour.cardPosition}
            className="tc__img"
          >
            <div className="tc__img-overlay" />
            {tour.days && (
              <span className="tc__badge">
                {tour.days} {t('tour.days')}
                {classicPrice && <> / {t('sidebar.startingFrom')} €{classicPrice.toLocaleString('en-US')}</>}
              </span>
            )}
          </BlurUpBackground>
        </LocaleLink>

        <div className="tc__body">
          <div className="tc__content">
            <h2 className="tc__title">
              <LocaleLink to={tourUrl}>{title}</LocaleLink>
            </h2>

            {destinations.length > 0 && (
              <div className="tc__tags" role="list" aria-label="Destinations">
                {destinations.slice(0, 6).map((dest, i) => (
                  <span key={i} className="tc__tag" role="listitem">{dest}</span>
                ))}
                {destinations.length > 6 && (
                  <span className="tc__tag tc__tag--more">+{destinations.length - 6}</span>
                )}
              </div>
            )}

            <p className="tc__desc">{description}</p>
          </div>

          <div className="tc__actions">
            <LocaleLink to={tourUrl} className="tc__cta">
              {t('tour.exploreTour')}
              <svg className="tc__cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </LocaleLink>
          </div>
        </div>
      </article>
    </FadeUp>
  )
}
