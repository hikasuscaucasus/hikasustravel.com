import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import FadeUp from './FadeUp'
import BlurUpBackground from './BlurUpBackground'
import asset from '../../utils/basePath'
import useT from '../../i18n/useT'

const SWIPE_THRESHOLD = 50

/* The gallery used to be a 3x2 grid with the rest of the photos folded behind a
   "Show N more photos" button, and a per-tour `showAll` flag to opt out of the
   fold. The Ivory design made it a horizontal scroll strip, where every photo is
   already one swipe away — so the fold was asking people to click before they
   could scroll to something that was never far off. The whole mechanism is gone:
   no INITIAL_COUNT, no expanded state, no button, and no localized
   "Show N more photos" label. Every item renders into the strip on first paint.
   The images stay `loading="lazy"`, so the extra cards cost nothing until they
   are scrolled to. */

/* A gallery item opts into real responsive markup by supplying `base` + `widths`
   (plus the native `width`/`height`). Those render a crawlable
   <figure><picture><img> with an AVIF/WebP ladder and exact intrinsic
   dimensions, so the tile reserves its space and nothing shifts on load.
   Items without those keys keep the original blur-up background rendering —
   every existing tour gallery is therefore untouched. */
const GALLERY_SIZES = '(max-width:768px) 50vw, 300px'
const srcSetFor = (base, widths, ext) =>
  widths.map((w) => `${asset(`${base}-${w}.${ext}`)} ${w}w`).join(', ')

export function GalleryLightbox({ images, startIndex, onClose, label }) {
  const t = useT()
  const [index, setIndex] = useState(startIndex)
  const closeBtnRef = useRef(null)
  const touchStartX = useRef(null)

  const count = images.length
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count])
  const goNext = useCallback(() => setIndex((i) => (i + 1) % count), [count])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKey(e) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handleKey)
    closeBtnRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [onClose, goNext, goPrev])

  const image = images[index]
  if (!image) return null

  const caption = image.caption ? image.caption.replace(/<[^>]*>/g, '') : ''
  const alt = caption || (image.description || '')

  /* The expanded view is the one place that wants the biggest rendition the
     pipeline built. `src` is whatever width the tile's fallback happened to
     name — often the 768 rung — so when the item ships a `widths` ladder the
     top rung is used instead. Items without a ladder keep their own `src`. */
  const fullSrc = image.base && image.widths?.length
    ? asset(`${image.base}-${Math.max(...image.widths)}.webp`)
    : asset(image.src)

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  return createPortal(
    <div className="gallery-lightbox-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={label || t('tour.gallery')}>
      <button ref={closeBtnRef} className="gallery-lightbox__close" onClick={onClose} aria-label={t('hotel.close')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {count > 1 && (
        <button
          className="gallery-lightbox__nav gallery-lightbox__nav--prev"
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          aria-label={t('tour.prevImage')}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <img
        src={fullSrc}
        alt={alt}
        className="gallery-lightbox__img"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      />
      {(caption || image.description) && (
        /* Place name/caption in the expanded view — same data shown in the grid
           card. A bottom overlay bar (below the mid-height nav arrows and the
           top-right close, so nothing is blocked); pointer-events:none lets a
           click still fall through to close. */
        <div className="gallery-lightbox__caption">
          {caption && <p className="gallery-lightbox__caption-title">{caption}</p>}
          {image.description && <p className="gallery-lightbox__caption-desc">{image.description}</p>}
        </div>
      )}
      {count > 1 && (
        <button
          className="gallery-lightbox__nav gallery-lightbox__nav--next"
          onClick={(e) => { e.stopPropagation(); goNext() }}
          aria-label={t('tour.nextImage')}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  )
}

export default function Gallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lastFocused = useRef(null)
  const t = useT()

  if (!images || images.length === 0) return null

  /* The strip and the lightbox now render from the same array, in the same
     order, so a card's position IS its lightbox index — the invariant the old
     leading-slice relied on, now true by construction. */

  const openLightbox = (index, el) => {
    lastFocused.current = el
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
    lastFocused.current?.focus()
  }

  return (
    <>
      <div className="gallery-grid">
        {images.map((img, index) => {
          const caption = img.caption ? img.caption.replace(/<[^>]*>/g, '') : ''
          const day = img.day || ''
          const responsive = !!(img.base && img.widths?.length)
          const Card = responsive ? 'figure' : 'div'
          const Info = responsive ? 'figcaption' : 'div'
          return (
            <FadeUp key={index}>
              <Card className="gallery-card">
                <div
                  className="gallery-card__img-wrap"
                  role="button"
                  tabIndex={0}
                  aria-label={caption ? `${t('tour.viewImage')}: ${caption}` : t('tour.viewImage')}
                  onClick={(e) => openLightbox(index, e.currentTarget)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      openLightbox(index, e.currentTarget)
                    }
                  }}
                >
                  {responsive ? (
                    <picture>
                      <source type="image/avif" srcSet={srcSetFor(img.base, img.widths, 'avif')} sizes={GALLERY_SIZES} />
                      <source type="image/webp" srcSet={srcSetFor(img.base, img.widths, 'webp')} sizes={GALLERY_SIZES} />
                      <img
                        /* The <img> is only the fallback for browsers that take
                           neither <source>; the srcSet above drives real
                           selection. It defaults to the smallest rung, which is
                           what every existing gallery shipped with. An item may
                           name a different rung via `fallbackWidth` (the 13-day
                           Grand Tour package specifies "-1200 where present,
                           else native"), so no other gallery moves. */
                        src={asset(`${img.base}-${img.fallbackWidth || img.widths[0]}.webp`)}
                        width={img.width}
                        height={img.height}
                        loading="lazy"
                        decoding="async"
                        sizes={GALLERY_SIZES}
                        /* The <figcaption> and the alt are normally the same
                           string. An item may separate them by supplying
                           `imgAlt` — a short place label reads better under the
                           tile, while alt needs the full descriptive sentence
                           (the 9-day Wine & Adventure gallery ships both).
                           Omitting it falls back to `caption`, so every existing
                           gallery renders exactly as before. */
                        alt={img.imgAlt || caption}
                        className="gallery-card__img"
                        /* Optional per-item crop anchor. Tiles are a uniform 3:2
                           object-fit:cover box, so a tall portrait keeps only
                           ~44% of its height and a centred crop can behead the
                           subject (the Ali & Nino figures, the Alphabet Tower's
                           crown). An item may name the band to keep; omitting it
                           leaves the CSS default (50%), so every existing
                           gallery renders exactly as before. */
                        style={img.objectPosition ? { objectPosition: img.objectPosition } : undefined}
                      />
                    </picture>
                  ) : (
                    <BlurUpBackground src={img.src} className="gallery-card__img" />
                  )}
                  {day && <span className="gallery-card__day">{day}</span>}
                </div>
                {/* The card shows the short label only. Items whose data also
                    carries a descriptive sentence (`description`, resolved from
                    the per-locale `alt`) used to print it underneath, which gave
                    the strip two competing text lengths — some cards a place
                    name, others a full sentence. The sentence is not deleted: it
                    still travels in the images array, so the lightbox caption and
                    every structured-data consumer read exactly what they read
                    before. This is a display change only. */}
                {caption && (
                  <Info className="gallery-card__info">
                    <h4 className="gallery-card__location">{caption}</h4>
                  </Info>
                )}
              </Card>
            </FadeUp>
          )
        })}
      </div>
      {lightboxIndex !== null && (
        <GalleryLightbox images={images} startIndex={lightboxIndex} onClose={closeLightbox} />
      )}
    </>
  )
}
