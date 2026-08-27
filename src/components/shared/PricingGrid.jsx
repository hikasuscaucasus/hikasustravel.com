import { useCallback, useContext, useState } from 'react'
import useT from '../../i18n/useT'
import useHotel from '../../i18n/useHotel'
import { I18nContext } from '../../i18n/I18nContext'
import FadeUp from './FadeUp'
import HotelModal from './HotelModal'
import { tierStartingFrom } from './pricingUtils'

// Selecting stores the hotel NAME, not a resolved record. The translated copy
// arrives with the tour translations, a moment after the table itself renders
// from the static tour data — snapshotting the record on click would freeze
// whatever was loaded at that instant and leave an early click showing English.
function HotelLink({ name, onSelect }) {
  return (
    <button
      type="button"
      className="hotel-link"
      aria-haspopup="dialog"
      onClick={() => onSelect(name)}
    >
      {name}
    </button>
  )
}

// A cell may hold a single hotel name (an exact hotelData key, which can itself
// contain a comma — e.g. "Tsinandali Estate, A Radisson Collection Hotel"), or a
// comma-separated list of options optionally ending in "or similar". We try an
// exact match first so every existing single-hotel cell renders exactly as
// before; only when that fails do we split a list and link the hotels we know.
function HotelName({ name, onSelect, getHotel }) {
  if (!name) return null
  if (getHotel(name)) return <HotelLink name={name} onSelect={onSelect} />

  const trailingMatch = name.match(/\s+or similar\s*$/i)
  const trailing = trailingMatch ? trailingMatch[0] : ''
  const core = trailingMatch ? name.slice(0, trailingMatch.index) : name
  const parts = core.split(',').map((p) => p.trim()).filter(Boolean)

  // Only treat the cell as a linkable list when it has multiple parts and at
  // least one is a known hotel; otherwise keep the original text verbatim.
  if (parts.length <= 1 || !parts.some((p) => getHotel(p))) return <>{name}</>

  return (
    <>
      {parts.map((part, j) => (
        <span key={j}>
          {j > 0 && ', '}
          {getHotel(part)
            ? <HotelLink name={part} onSelect={onSelect} />
            : part}
        </span>
      ))}
      {trailing}
    </>
  )
}

// The accommodation City column is authored in English in tours.js as
// "<City> (<n> night[s])". The city name is looked up in the curated per-locale
// destination list (pages.json → destinationsCities.items) so it matches the
// exonym the rest of the site already uses — Tiflis, Koutaïssi, Telawi — and the
// night count is pluralised by the active language. A cell we cannot parse, or a
// city we hold no curated name for, is left exactly as authored.
const CITY_CELL = /^(.+?)\s*\((\d+)\s*nights?\)\s*$/i

const CITY_SLUGS = {
  Tbilisi: 'tbilisi',
  Telavi: 'telavi',
  Kutaisi: 'kutaisi',
  Batumi: 'batumi',
  Kazbegi: 'kazbegi',
  Akhaltsikhe: 'akhaltsikhe',
  Borjomi: 'borjomi',
  Mestia: 'mestia',
  Gudauri: 'gudauri',
}

function useCityLabel() {
  const t = useT()
  const { pages } = useContext(I18nContext)
  const items = pages?.destinationsCities?.items

  return useCallback((cell) => {
    const match = (cell || '').match(CITY_CELL)
    if (!match) return cell

    const cityEn = match[1].trim()
    const nights = parseInt(match[2], 10)

    // Curated names can carry a parenthetical alias ("Kazbegi (Stepantsminda)")
    // that would collide with the night count, so keep only the leading name.
    const slug = CITY_SLUGS[cityEn]
    const curated = slug && items?.[slug]?.name
    const city = curated ? curated.split(' (')[0].trim() : cityEn

    const unit = nights === 1
      ? t('pricing.nightsOne')
      : nights <= 4
        ? t('pricing.nightsFew')
        : t('pricing.nightsMany')

    return `${city} (${nights} ${unit})`
  }, [items, t])
}

export function AccommodationsTable({ accommodations }) {
  const t = useT()
  const getHotel = useHotel()
  const cityLabel = useCityLabel()
  const [selectedHotel, setSelectedHotel] = useState(null)
  if (!accommodations || accommodations.length === 0) return null

  return (
    <>
      <div className="pricing-grid pricing-grid--accommodations">
        <div className="pricing-grid-header">
          <div>{t('pricing.city')}</div>
          <div>{t('pricing.hotels')}</div>
        </div>
        {accommodations.map((row, i) => {
          const hotelNames = row.hotel ? [row.hotel] : [row.luxury, row.midRange, row.economy].filter(Boolean)
          return (
            <div key={i} className="pricing-grid-row pricing-hotels-row">
              <div>{cityLabel(row.city)}</div>
              <div>
                {hotelNames.map((name, j) => (
                  <span key={j}>
                    {j > 0 && ', '}
                    <HotelName name={name} onSelect={setSelectedHotel} getHotel={getHotel} />
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {selectedHotel && <HotelModal hotel={getHotel(selectedHotel)} onClose={() => setSelectedHotel(null)} />}
    </>
  )
}

export function TravelerPricingTable({ pricing }) {
  const t = useT()
  if (!pricing || pricing.length === 0) return null

  return (
    <div className="pricing-grid pricing-grid-travelers">
      <div className="pricing-grid-header">
        <div>{t('pricing.travelers')}</div>
        <div className="pricing-luxury">{t('pricing.premium')}</div>
        <div>{t('pricing.midRange')}</div>
        <div>{t('pricing.economy')}</div>
      </div>
      {pricing.map((row, i) => (
        <div key={i} className="pricing-grid-row">
          <div>{row.travelers}</div>
          <div>{row.luxury}</div>
          <div>{row.midRange}</div>
          <div>{row.economy}</div>
        </div>
      ))}
    </div>
  )
}

function getTierPrice(pricing, tier, startingFrom) {
  // An owner-approved advertised price wins over the derived minimum when the
  // tour ships one; the two are allowed to differ. Opt-in, so every tour
  // without `startingFrom` keeps the exact card price it had before.
  const advertised = tierStartingFrom(startingFrom, tier)
  if (advertised !== null) return advertised
  const numericRows = pricing.filter((r) => r.travelers !== 'Single Supplement')
  if (numericRows.length === 0) return null
  const prices = numericRows
    .map((r) => parseFloat((r[tier] || '').replace(/[^0-9.]/g, '')))
    .filter((n) => !isNaN(n) && n > 0)
  return prices.length > 0 ? Math.min(...prices) : null
}

function scrollToBook(e) {
  e.preventDefault()
  const el = document.getElementById('book')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function formatEuro(raw) {
  const num = parseFloat((raw || '').replace(/[^0-9.]/g, ''))
  if (isNaN(num) || num <= 0) return raw
  return `€${num.toLocaleString('en-US')}`
}

function PricingCards({ pricing, startingFrom, onSelectPackage }) {
  const t = useT()
  // `accommodation` is the exact internal value of the booking form's
  // Accommodation Type <select> for private tours (Classic / Mid-Range /
  // Premium), so clicking a package pre-selects the matching option.
  const tiers = [
    { key: 'economy', label: t('pricing.economy'), accommodation: 'Classic' },
    { key: 'midRange', label: t('pricing.midRange'), featured: true, accommodation: 'Mid-Range' },
    { key: 'luxury', label: t('pricing.premium'), accommodation: 'Premium' },
  ]

  const numericRows = pricing.filter((r) => r.travelers !== 'Single Supplement')
  const singleSupplement = pricing.find((r) => r.travelers === 'Single Supplement')
  // Find the row with the lowest price across all tiers (best value)
  let bestValueCount = null
  if (numericRows.length > 1) {
    let lowest = Infinity
    numericRows.forEach((row) => {
      ;['economy', 'midRange', 'luxury'].forEach((k) => {
        const n = parseFloat((row[k] || '').replace(/[^0-9.]/g, ''))
        if (!isNaN(n) && n > 0 && n < lowest) {
          lowest = n
          bestValueCount = row.travelers
        }
      })
    })
  }

  return (
    <div className="td-price-cards">
      {tiers.map((tier) => {
        const startPrice = getTierPrice(pricing, tier.key, startingFrom)

        return (
          <div
            key={tier.key}
            className={`td-price-card${tier.featured ? ' td-price-card--featured' : ''}`}
          >
            {tier.featured && (
              <div className="td-price-card__badge">{t('pricing.mostPopular')}</div>
            )}
            <h3 className="td-price-card__tier">{tier.label}</h3>
            {startPrice && (
              <div className="td-price-card__price">
                <span className="td-price-card__price-from">{t('sidebar.startingFrom')}</span>
                <span className="td-price-card__price-value">€{startPrice.toLocaleString('en-US')}</span>
                <span className="td-price-card__price-pp">{t('pricing.perPerson')}</span>
              </div>
            )}
            {numericRows.length > 0 && (
              <div className="td-price-card__breakdown">
                {numericRows.map((row, i) => (
                  <div
                    key={i}
                    className={`td-price-card__row${row.travelers === bestValueCount ? ' td-price-card__row--best' : ''}`}
                  >
                    <span>
                      {row.travelers === '1'
                        ? `1 ${t('pricing.travelers').replace(/s$/i, '')}`
                        : `${row.travelers} ${t('pricing.travelers')}`
                      }
                    </span>
                    <span>{formatEuro(row[tier.key])}</span>
                  </div>
                ))}
                {singleSupplement && (
                  <div className="td-price-card__row">
                    <span>{t('pricing.singleSupplement')}</span>
                    <span>{formatEuro(singleSupplement[tier.key])}</span>
                  </div>
                )}
              </div>
            )}
            <a
              href="#book"
              onClick={(e) => {
                if (onSelectPackage) onSelectPackage(tier.accommodation)
                scrollToBook(e)
              }}
              className="td-price-card__cta"
            >
              {t('tour.bookNow')}
            </a>
          </div>
        )
      })}
    </div>
  )
}

function PrivateAccommodationsTable({ accommodations }) {
  const t = useT()
  const getHotel = useHotel()
  const cityLabel = useCityLabel()
  const [selectedHotel, setSelectedHotel] = useState(null)
  if (!accommodations || accommodations.length === 0) return null

  return (
    <>
      <div className="pricing-grid pricing-grid--private">
        <div className="pricing-grid-header">
          <div>{t('pricing.city')}</div>
          <div className="pricing-luxury">{t('pricing.premium')}</div>
          <div>{t('pricing.midRange')}</div>
          <div>{t('pricing.economy')}</div>
        </div>
        {accommodations.map((row, i) => (
          <div key={i} className="pricing-grid-row">
            <div>{cityLabel(row.city)}</div>
            <div><span className="td-hotel"><HotelName name={row.luxury} onSelect={setSelectedHotel} getHotel={getHotel} /></span></div>
            <div><span className="td-hotel"><HotelName name={row.midRange} onSelect={setSelectedHotel} getHotel={getHotel} /></span></div>
            <div><span className="td-hotel"><HotelName name={row.economy} onSelect={setSelectedHotel} getHotel={getHotel} /></span></div>
          </div>
        ))}
      </div>
      {selectedHotel && <HotelModal hotel={getHotel(selectedHotel)} onClose={() => setSelectedHotel(null)} />}
    </>
  )
}

// Accommodation section (id="accommodation"). Group tours use the single-hotel
// table; private tours use the per-tier table. Same content as before, now in
// its own section so the navbar can link to it directly.
export function AccommodationSection({ accommodations, isGroup }) {
  const t = useT()
  if (!accommodations || accommodations.length === 0) return null

  return (
    <section id="accommodation" className="td-section">
      <FadeUp>
        <h2 className="td-section__title">{t('pricing.accommodations')}</h2>
        {isGroup ? (
          <AccommodationsTable accommodations={accommodations} />
        ) : (
          <PrivateAccommodationsTable accommodations={accommodations} />
        )}
      </FadeUp>
    </section>
  )
}

// Price section (id="pricing"). Private tours show the per-tier pricing cards;
// group tours show their fixed per-person price (existing data, unchanged).
export function PriceSection({ isGroup, pricing, startingFrom, pricePerPerson, singleSupplement, onSelectPackage }) {
  const t = useT()
  const hasPricing = pricing && pricing.length > 0
  const hasGroupPrice = isGroup && pricePerPerson
  if (!hasPricing && !hasGroupPrice) return null

  return (
    <section id="pricing" className="td-section">
      <FadeUp>
        <div className="td-pricing">
          <div className="td-pricing__header">
            <h2 className="td-section__title">{t('pricing.title')}</h2>
          </div>

          <div className="td-pricing__block">
            {hasPricing ? (
              <PricingCards pricing={pricing} startingFrom={startingFrom} onSelectPackage={onSelectPackage} />
            ) : (
              <div className="td-price-cards td-price-cards--single">
                <div className="td-price-card td-price-card--featured">
                  <h3 className="td-price-card__tier">{t('pricing.pricePerPerson')}</h3>
                  <div className="td-price-card__price">
                    <span className="td-price-card__price-value">€{pricePerPerson}</span>
                    <span className="td-price-card__price-pp">{t('pricing.perPerson')}</span>
                  </div>
                  {singleSupplement && (
                    <div className="td-price-card__breakdown">
                      <div className="td-price-card__row">
                        <span>{t('pricing.singleSupplement')}</span>
                        <span>€{singleSupplement}</span>
                      </div>
                    </div>
                  )}
                  <a href="#book" onClick={scrollToBook} className="td-price-card__cta">
                    {t('tour.getExactPrice')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeUp>
    </section>
  )
}
