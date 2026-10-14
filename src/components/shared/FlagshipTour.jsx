import { useContext, useEffect, useRef } from 'react'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import asset from '../../utils/basePath'
import { trackEvent } from '../../utils/analytics'
import { formatPrice, parsePrice } from './pricingUtils'

/* Homepage flagship module for the one scheduled tour the business leads with
   (`flagship: true` on its record in tours.js). It sits directly under the
   homepage hero and is deliberately NOT a tour card: one photo, one title,
   the three countries, one value sentence, three quick facts, the fixed price
   and one primary action. Everything it shows is read from the tour record
   and its locale copy, so a date, price or group-size change in the data is
   the only edit ever needed here.

   The price is a fixed per-person price: it is printed as "<amount> per
   person", never "from". Departures are summarised as a count ("4 departures
   in 2027") rather than listed — the tour page's inquiry form is where a
   visitor picks one. The single supplement is a product-page detail and is
   left off on purpose. */

const COUNTRY_KEYS = {
  azerbaijan: 'nav.destinations.azerbaijan',
  georgia: 'nav.destinations.georgia',
  armenia: 'nav.destinations.armenia',
}

// Same lookup TourDetailHero uses: the gallery item whose `base` is the stem
// of `heroImage` is that photograph at every width the image pipeline built.
function heroLadder(tour) {
  const src = tour.heroImage || ''
  return (tour.gallery || []).find((g) => g.base && g.widths?.length && src.startsWith(`${g.base}-`)) || null
}
const srcSet = (base, widths, ext) => widths.map((w) => `${asset(`${base}-${w}.${ext}`)} ${w}w`).join(', ')
const SIZES = '(max-width: 900px) 100vw, 540px'

export default function FlagshipTour({ tour }) {
  const t = useT()
  const { lang } = useLang()
  const { tourTranslations } = useContext(I18nContext)
  const sectionRef = useRef(null)

  // One impression event per page view, once half the module has been seen.
  useEffect(() => {
    const el = sectionRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      trackEvent('flagship_view', { tour: tour?.slug })
      observer.disconnect()
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [tour?.slug])

  if (!tour) return null
  const tt = tourTranslations?.[tour.slug]
  const url = `/group-tours/${tour.slug}`
  const title = tt?.shortTitle || tour.tourFormTitle || tt?.title || tour.title
  const countries = (tour.areaServed || [])
    .map((c) => (COUNTRY_KEYS[c.toLowerCase()] ? t(COUNTRY_KEYS[c.toLowerCase()]) : c))
    .join(' · ')
  const bookable = (tour.groupDates || []).filter((d) => !d.soldOut)
  const years = [...new Set(bookable.map((d) => d.year))].join('/')
  const price = parsePrice(tour.pricePerPerson)
  const ladder = heroLadder(tour)
  const imgAlt = tour.imageMeta?.alt?.[lang] || tour.imageMeta?.alt?.en || title
  const onCta = (cta) => () => trackEvent('flagship_cta_click', { tour: tour.slug, cta })

  return (
    <section ref={sectionRef} className="home-items home-flagship" aria-labelledby="flagship-title">
      <div className="flagship">
        <figure className="flagship__media frame">
          <LocaleLink to={url} aria-label={title} tabIndex={-1} onClick={onCta('image')}>
            {ladder ? (
              <picture>
                <source type="image/avif" srcSet={srcSet(ladder.base, ladder.widths, 'avif')} sizes={SIZES} />
                <source type="image/webp" srcSet={srcSet(ladder.base, ladder.widths, 'webp')} sizes={SIZES} />
                <img
                  src={asset(tour.heroImage)}
                  width={ladder.width}
                  height={ladder.height}
                  sizes={SIZES}
                  alt={imgAlt}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            ) : (
              <img src={asset(tour.heroImage)} alt={imgAlt} loading="lazy" decoding="async" />
            )}
          </LocaleLink>
        </figure>

        <div className="flagship__body">
          <p className="flagship__eyebrow">{t('home.flagshipEyebrow', { year: years })}</p>
          <h2 id="flagship-title" className="flagship__title">
            <LocaleLink to={url} onClick={onCta('title')}>{title}</LocaleLink>
          </h2>
          {countries && <p className="flagship__countries">{countries}</p>}
          <p className="flagship__lead">{t('home.flagshipLead')}</p>

          <ul className="flagship__facts">
            {tour.days && <li>{tour.days} {t('tour.days')}</li>}
            {tour.groupSize && <li>{t('home.flagshipAdults', { min: tour.groupSize.min, max: tour.groupSize.max })}</li>}
            {bookable.length > 0 && <li>{t('home.flagshipDepartures', { n: bookable.length, year: years })}</li>}
          </ul>

          {price && (
            <p className="flagship__price">
              <strong className="flagship__amount">{formatPrice(price)}</strong>
              <span className="flagship__per">{t('pricing.perPerson')}</span>
            </p>
          )}

          <div className="flagship__actions">
            <LocaleLink to={url} className="iv-pill flagship__cta" onClick={onCta('primary')}>
              {t('home.flagshipCta')}
            </LocaleLink>
            {bookable.length > 0 && (
              <LocaleLink to={`${url}#book`} className="flagship__link" onClick={onCta('secondary')}>
                {t('home.flagshipCtaSecondary', { year: years })}
              </LocaleLink>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
