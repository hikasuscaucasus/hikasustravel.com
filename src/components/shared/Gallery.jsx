import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import FadeUp from './FadeUp'
import BlurUpBackground from './BlurUpBackground'
import asset from '../../utils/basePath'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'

/* Two rows of three on desktop (.gallery-grid is repeat(3, 1fr) above 600px);
   2 columns ≤768px and 1 column on phones — 6 divides evenly into all three, so
   the last visible row is never left with an empty slot. */
const INITIAL_COUNT = 6
const SWIPE_THRESHOLD = 50

/* "Show more" label carries the number of hidden photos. Czech and Polish need
   more than singular/plural (cs: 1 / 2-4 / 5+; pl: 1 / 2-4 / 5+ with the 12-14
   exception), so the category comes from Intl.PluralRules rather than a
   hand-rolled n===1 test. Falls back through `.other` to the original bare
   `tour.showMore`, so a missing translation degrades to the old label instead of
   printing a raw key. */
const pluralCategory = (lang, n) => {
  try { return new Intl.PluralRules(lang).select(n) } catch { return 'other' }
}

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
        src={asset(image.src)}
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

/* `showAll` opts a single gallery out of the "show more" fold and renders every
   tile immediately. Added for the 5-day Tbilisi→Batumi tour, whose route map is
   the closing tile: behind the 6-tile fold it was invisible until you pressed
   the button, which read as the map having been dropped. Defaults to false, so
   every other gallery keeps the fold exactly as before. */
export default function Gallery({ images, showAll = false }) {
  const [expanded, setExpanded] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lastFocused = useRef(null)
  const t = useT()
  const { lang } = useLang()

  if (!images || images.length === 0) return null

  /* `visible` drives the GRID only. The lightbox always receives the full
     `images` array, so a visitor who opens the last visible card can page on
     into the still-hidden photos without pressing "show more" first.
     Because `visible` is a leading slice, a card's index within it IS its index
     within `images` — keep that invariant if the grid order ever changes
     (indexOf would misresolve a gallery that repeats the same src). */
  const visible = (showAll || expanded) ? images : images.slice(0, INITIAL_COUNT)
  const hasMore = !showAll && images.length > INITIAL_COUNT

  /* How many photos the button will reveal. `t()` returns the key itself when a
     string is missing, which is what the `!== k` probe below detects. */
  const remainingCount = images.length - INITIAL_COUNT
  const showMoreKey =
    [`tour.showMorePhotos.${pluralCategory(lang, remainingCount)}`, 'tour.showMorePhotos.other']
      .find((k) => t(k) !== k) || 'tour.showMore'
  const showMoreLabel = t(showMoreKey, { count: remainingCount })

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
        {visible.map((img, index) => {
          const caption = img.caption ? img.caption.replace(/<[^>]*>/g, '') : ''
          const description = img.description || ''
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
                        src={asset(`${img.base}-${img.widths[0]}.webp`)}
                        width={img.width}
                        height={img.height}
                        loading="lazy"
                        decoding="async"
                        sizes={GALLERY_SIZES}
                        alt={caption}
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
                {(caption || description) && (
                  <Info className="gallery-card__info">
                    {caption && <h4 className="gallery-card__location">{caption}</h4>}
                    {description && <p className="gallery-card__desc">{description}</p>}
                  </Info>
                )}
              </Card>
            </FadeUp>
          )
        })}
      </div>
      {hasMore && !expanded && (
        <div className="gallery-show-more">
          <button className="gallery-show-more__btn" onClick={() => setExpanded(true)}>
            {showMoreLabel}
          </button>
        </div>
      )}
      {lightboxIndex !== null && (
        <GalleryLightbox images={images} startIndex={lightboxIndex} onClose={closeLightbox} />
      )}
    </>
  )
}
