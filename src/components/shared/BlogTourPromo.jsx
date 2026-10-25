import { tours } from '../../data/tours'
import LocaleLink from '../../i18n/LocaleLink'
import useLang from '../../i18n/useLang'
import asset from '../../utils/basePath'
import { getEntryPrices, formatPrice } from './pricingUtils'

// The one private tour the Travel Blogs index promotes. Everything the module
// shows about it — title, photo, length, season, price — is read from the
// canonical tour record at render time, so a later price or season change can
// never leave a stale figure behind on the blog index.
const PROMOTED_TOUR_SLUG = '7-day-armenia-tour-yerevan-tatev-dilijan'

function tf(t, key, fallback) {
  const val = t(key)
  return val === key ? fallback : val
}

// The card image is a rung of the tour's own existing width ladder (768 / 1200),
// not a new file: the blog promo reuses the tour's approved listing photo and
// only lets the browser pick the smaller rung on a phone.
function imageProps(src) {
  const m = src && src.match(/^(.*)-(\d+)\.webp$/)
  if (!m) return { src: asset(src) }
  const base = m[1]
  return {
    src: asset(`${base}-768.webp`),
    srcSet: `${asset(`${base}-768.webp`)} 768w, ${asset(`${base}-1200.webp`)} 1200w`,
    sizes: '(min-width: 900px) 300px, 100vw',
  }
}

export default function BlogTourPromo({ t, tourTranslations }) {
  const { lang } = useLang()
  const tour = tours.find((x) => x.slug === PROMOTED_TOUR_SLUG)
  if (!tour) return null

  const tt = tourTranslations?.[tour.slug]
  const title = tt?.title || tour.title
  const entry = getEntryPrices(tour.pricing)
  const startingPrice = entry.from
  const season = tour.seasonality === 'seasonal' ? t('tour.seasonalitySeasonal') : null
  const alt = tour.alt?.[lang] || tour.alt?.en || ''

  const facts = [
    tour.days ? `${tour.days} ${t('tour.days')}` : null,
    tf(t, 'blog.tourPromo.private', 'Private tour'),
    season,
    startingPrice
      ? `${t('sidebar.startingFrom')} ${formatPrice(startingPrice)} ${t('pricing.perPerson')}${entry.basisFour ? ` ${t('pricing.fourTravelers')}` : ''}`
      : null,
    entry.basisFour && entry.two
      ? t('pricing.forTwoTravelers', { price: formatPrice(entry.two) })
      : null,
  ].filter(Boolean)

  return (
    <LocaleLink to={`/private-tours/${tour.slug}`} className="blog-promo">
      <div className="blog-promo__img-wrap">
        <img
          className="blog-promo__img"
          alt={alt}
          loading="lazy"
          decoding="async"
          {...imageProps(tour.listingImage || tour.heroImage)}
        />
      </div>
      <div className="blog-promo__body">
        <p className="blog-promo__eyebrow">{tf(t, 'blog.tourPromo.eyebrow', 'Travel this itinerary')}</p>
        <h2 className="blog-promo__title">{title}</h2>
        <p className="blog-promo__text">
          {tf(t, 'blog.tourPromo.text', 'A private one-week journey through Armenia, from Yerevan and Tatev to Lake Sevan and Dilijan.')}
        </p>
        <ul className="blog-promo__facts">
          {facts.map((f) => <li key={f}>{f}</li>)}
        </ul>
        <span className="blog-promo__cta">{t('tour.exploreTour')} →</span>
      </div>
    </LocaleLink>
  )
}
