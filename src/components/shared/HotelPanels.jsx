import { useEffect, useRef } from 'react'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'

/* Ivory-badge pilot: the hotel information dialog, rendered INLINE instead of
   through a portal.
 *
 * The old HotelModal mounted only after a click and portalled into <body>.
 * react-dom/server does not render portals, and the component was not mounted
 * during the build anyway, so none of the hotel copy or photography reached the
 * served HTML — a crawler saw hotel names and nothing else.
 *
 * Every hotel named on the page now has its panel in the tree from the first
 * render, carrying its description and its four <img> tags with real src and
 * alt. A closed panel is `hidden` (display:none), which is what keeps the cost
 * at zero: browsers do not fetch images inside a display:none subtree, so
 * nothing is downloaded until a panel is opened.
 */

const CATEGORY_KEYS = ['Exterior', 'Lobby', 'Room', 'Bathroom']

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />
    </svg>
  )
}

function HotelPanel({ entry, hotel, open, onClose, showCategories }) {
  const t = useT()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const opener = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open, onClose])

  const images = hotel.images || (hotel.image ? [{ src: hotel.image, alt: hotel.name }] : [])
  const amenities = hotel.amenities || []
  const locations = hotel.locationHighlights || []
  // "<tier> · <city>" — both come from the accommodation row this hotel sits in,
  // so both are already in the page's own language.
  const meta = [entry.tier, entry.city].filter(Boolean).join(' · ')

  return (
    <div
      className="iv-hotel"
      hidden={!open}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={hotel.name}
    >
      <div className="iv-hotel__panel" onClick={(e) => e.stopPropagation()}>
        <div className="iv-hotel__head">
          <div>
            <h3 className="iv-hotel__name">
              {hotel.name}
              {hotel.stars > 0 && (
                <span className="iv-hotel__stars">
                  {Array.from({ length: hotel.stars }, (_, i) => <StarIcon key={i} />)}
                </span>
              )}
            </h3>
            {meta && <p className="iv-hotel__meta">{meta}</p>}
          </div>
          <button type="button" ref={closeRef} className="iv-sites__close" onClick={onClose} aria-label={t('hotel.close')}>
            <CloseIcon />
          </button>
        </div>

        {hotel.description && <p className="iv-hotel__desc">{hotel.description}</p>}

        {images.length > 0 && (
          <div className="iv-hotel__photos">
            {images.map((img, i) => (
              <figure key={i} className="iv-hotel__photo">
                <img src={img.src} alt={img.alt || hotel.name} loading="lazy" decoding="async" />
                {showCategories && CATEGORY_KEYS[i] && <figcaption>{CATEGORY_KEYS[i]}</figcaption>}
              </figure>
            ))}
          </div>
        )}

        {amenities.length > 0 && (
          <ul className="iv-hotel__list">
            {amenities.map((a, i) => <li key={i}>{a.label}</li>)}
          </ul>
        )}
        {locations.length > 0 && (
          <ul className="iv-hotel__list">
            {locations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        )}
      </div>
    </div>
  )
}

/* `entries` is [{ name, tier, city }] in the order the table lists them; the
   same hotel appearing twice is rendered once, under its first row. */
export default function HotelPanels({ entries, getHotel, openName, onClose }) {
  const { lang } = useLang()
  const seen = new Set()
  // The four photo captions are new English labels, so they are shown on the
  // English page only — the translated pages keep the photographs and their
  // (already translated) alt text without an untranslated caption under them.
  const showCategories = lang === 'en'

  return (
    <>
      {entries.map((entry) => {
        if (seen.has(entry.name)) return null
        seen.add(entry.name)
        const hotel = getHotel(entry.name)
        if (!hotel) return null
        return (
          <HotelPanel
            key={entry.name}
            entry={entry}
            hotel={hotel}
            open={openName === entry.name}
            onClose={onClose}
            showCategories={showCategories}
          />
        )
      })}
    </>
  )
}
