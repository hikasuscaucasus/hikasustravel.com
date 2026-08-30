import { useEffect, useRef, useState } from 'react'
import { GalleryLightbox } from './Gallery'
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

/* Each photo carries its OWN category in hotelData.js. It used to be read off
   a fixed ['Exterior','Lobby','Room','Bathroom'] list by array position, which
   assumed every hotel held exactly those four shots in exactly that order.
   Most did not: an audit of all 131 photographs found 23 captioned as something
   they plainly were not — Boutique Hotel Argo's fourth photo is a table laid for
   dinner and was captioned "Bathroom"; Park Hotel Tsinandali's indoor pool was
   too; Lileo Inn's photos are room/bathroom/room and were labelled
   lobby/room/bathroom. The alt text was right in all 23 cases, so nothing was
   ever mis-described to a screen reader or a crawler — only the visible caption
   guessed, and it guessed from position. A photo with no category shows no
   caption at all, which is the honest outcome when we are not sure. */

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
  // Index of the photo shown in the enlarged viewer, or null when it is closed.
  // Each hotel panel owns its own index, so one hotel's photos can never run on
  // into the next hotel's — the viewer is handed this hotel's array and nothing
  // else.
  const [photoIndex, setPhotoIndex] = useState(null)
  // The thumbnail that opened the viewer, so focus can go back to it on close.
  const photoOpener = useRef(null)

  /* Scroll lock and focus are tied to the MODAL's own lifetime and nothing
     else. They deliberately do not depend on `photoIndex`: opening a photo
     would then tear this effect down and set it up again, and the restore on
     the way out would fight the viewer's own lock — which left `overflow`
     stuck on `hidden` after both layers had closed. It would also have pulled
     focus back to the accommodation table mid-interaction. */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const opener = document.activeElement
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open])

  /* Escape unstacks one layer at a time. While the photo viewer is open it owns
     Escape, so this handler stands down: the first press closes the photo and
     leaves the modal exactly as it was — same scroll position, still open — and
     the second press closes the modal. Rebinding on `photoIndex` is what keeps
     that guard current, and it is cheap because it is only a listener. */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape' && photoIndex === null) onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, photoIndex])

  // A hotel modal that gets closed while its viewer is open must not leave the
  // viewer behind on the next open.
  useEffect(() => { if (!open) setPhotoIndex(null) }, [open])

  const images = hotel.images || (hotel.image ? [{ src: hotel.image, alt: hotel.name }] : [])
  const amenities = hotel.amenities || []
  const locations = hotel.locationHighlights || []
  // "<tier> · <city>" — both come from the accommodation row this hotel sits in,
  // so both are already in the page's own language.
  const meta = [entry.tier, entry.city].filter(Boolean).join(' · ')

  return (
    <>
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
                {/* Every photo opens the viewer, not just the first, and it
                    opens on the one that was clicked. A real <button> so it is
                    reachable and operable from the keyboard; the whole image is
                    the target. The <img> keeps its own src, alt, lazy loading
                    and decoding, so the prerendered markup is unchanged. */}
                <button
                  type="button"
                  className="iv-hotel__photo-btn"
                  onClick={(e) => { photoOpener.current = e.currentTarget; setPhotoIndex(i) }}
                  aria-label={img.alt || hotel.name}
                >
                  <img src={img.src} alt={img.alt || hotel.name} loading="lazy" decoding="async" />
                </button>
                {showCategories && img.category && <figcaption>{img.category}</figcaption>}
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

      {/* The enlarged photo, on top of this modal rather than replacing it —
          closing the viewer returns to the same modal, still scrolled where it
          was. The array is THIS hotel's photos, so previous/next wrap within
          the hotel and stop nowhere else; with a single photo the shared viewer
          renders no arrows at all. `lightboxAlt` keeps the hotel record's own
          localized alt on the big image while the visible caption stays the
          short category label. Hotel images are single files with no width
          ladder, so the enlarged view uses the same source — which is the
          largest that exists.

          Deliberately a SIBLING of the hotel backdrop, not a child. The viewer
          portals into <body>, but React events bubble through the React tree,
          not the DOM: nested inside, every click on an arrow or the viewer's
          own backdrop would also reach the hotel backdrop's onClick and close
          the modal underneath. */}
      {photoIndex !== null && (
        <GalleryLightbox
          images={images.map((img) => ({
            src: img.src,
            lightboxAlt: img.alt || hotel.name,
            caption: showCategories ? img.category : undefined,
          }))}
          startIndex={photoIndex}
          onClose={() => {
            setPhotoIndex(null)
            if (photoOpener.current instanceof HTMLElement) photoOpener.current.focus()
          }}
          label={hotel.name}
          sideNav
          className="gallery-lightbox-backdrop--hotel"
          navLabels={{ prev: t('hotel.prevPhoto'), next: t('hotel.nextPhoto') }}
        />
      )}
    </>
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
