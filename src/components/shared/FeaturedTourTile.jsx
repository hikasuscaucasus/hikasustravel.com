import CardImage from './CardImage'
import LocaleLink from '../../i18n/LocaleLink'

// Extracted from HomePage.jsx so the country tour hubs (/tours/georgia etc.,
// see CountryToursHubPage.jsx) can show the exact same tile — image, days,
// "Price from €X" badge — instead of their own simpler markup that had no
// price at all.
export default function FeaturedTourTile({ tour, t, tourTranslations }) {
  const tt = tourTranslations?.[tour.slug]
  const classicRow = tour.pricing?.find((r) => r.travelers === '4')
  const classicNum = classicRow ? parseFloat((classicRow.economy || '').replace(/[^0-9.]/g, '')) : NaN
  const priceFrom = !isNaN(classicNum) && classicNum > 0 ? `€${classicNum.toLocaleString('en-US')}` : null
  const basePath = tour.type === 'group' ? 'group-tours' : 'private-tours'
  return (
    <div className="tour-tile">
      <LocaleLink to={`/${basePath}/${tour.slug}`} className="tour-tile-link">
        <CardImage
          src={tour.tileImage || tour.heroImage}
          position={tour.cardPosition}
          className="tour-tile-image"
        />
        <div className="tour-tile-overlay">
          <h3>{tt?.title || tour.title}</h3>
          <p>{tour.days} {t('tour.days')}</p>
          {priceFrom && (
            <p className="tour-tile-overlay__price">{t('tour.pricesFrom', { price: priceFrom })}</p>
          )}
        </div>
      </LocaleLink>
    </div>
  )
}
