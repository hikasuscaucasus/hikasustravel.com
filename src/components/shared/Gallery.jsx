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

/* The expanded view wants the biggest rendition the pipeline built. `src` is
   whatever width the tile's fallback happened to name — often the 768 rung — so
   when the item ships a `widths` ladder the top rung is used instead. Items
   without a ladder keep their own `src`.
   `url` is an already-resolved URL used verbatim (no `asset()` prefixing).
   ContentImageLightbox reads its sources off live DOM <img>/<source>
   elements, which are absolute URLs; running those through asset() would
   prepend the base path a second time. No gallery or hotel item carries this
   key, so both existing callers resolve exactly as before. */
const lightboxSrc = (image) => (
  image.url
    ? image.url
    : image.base && image.widths?.length
      ? asset(`${image.base}-${Math.max(...image.widths)}.webp`)
      : asset(image.src)
)

const FADE_MS = 160
const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * The shared full-screen image viewer.
 *
 * Two callers: the tour Gallery, and the hotel-information modal. Everything
 * the hotel viewer needs beyond the gallery's behaviour is OPT-IN, so the tour
 * gallery renders exactly what it rendered before:
 *
 *   sideNav    large previous/next click zones down the left and right of the
 *              viewer, so a visitor does not have to hit a 48px arrow
 *   className  a modifier for stacking — the hotel viewer opens on top of the
 *              hotel modal, which already sits at z-index 2000
 *   navLabels  aria-labels for the arrows; the hotel viewer passes its own
 *              already-translated "previous/next photo" strings
 *
 * Each caller passes its own `images` array and owns its own open/index state,
 * so the two can never share an index or leak images into one another.
 */
export function GalleryLightbox({ images, startIndex, onClose, label, sideNav = false, className = '', navLabels }) {
  const t = useT()
  const [index, setIndex] = useState(startIndex)
  const closeBtnRef = useRef(null)
  const touchStartX = useRef(null)
  const imgRef = useRef(null)
  const fadeRef = useRef(null)
  const warm = useRef(new Map())
  const travel = useRef(0)
  /* Index of the photo that has finished loading. Warming is keyed on this, not
     on `index`, so the neighbours never compete with the photo the visitor is
     actually waiting for — on a slow connection they would split its bandwidth. */
  const [loadedIndex, setLoadedIndex] = useState(null)

  const count = images.length
  const goPrev = useCallback(() => { travel.current = -1; setIndex((i) => (i - 1 + count) % count) }, [count])
  const goNext = useCallback(() => { travel.current = 1; setIndex((i) => (i + 1) % count) }, [count])

  /* Each step used to wait on a full-size download of a photo never fetched (the
     tile only loads a small rung). Fetch and decode the neighbours early: prev,
     next, and one further in the direction of travel. Same URL, same file, so no
     quality change; anything outside that window is released. */
  useEffect(() => {
    if (count < 2 || loadedIndex === null) return
    const wrap = (n) => ((n % count) + count) % count
    const wanted = new Set([loadedIndex, wrap(loadedIndex + 1), wrap(loadedIndex - 1)])
    if (travel.current) wanted.add(wrap(loadedIndex + 2 * travel.current))
    const keep = new Set()
    for (const i of wanted) {
      const item = images[i]
      if (!item) continue
      const url = lightboxSrc(item)
      keep.add(url)
      if (warm.current.has(url)) continue
      const img = new Image()
      img.decoding = 'async'
      img.src = url
      img.decode?.().catch(() => {})
      warm.current.set(url, img)
    }
    for (const url of warm.current.keys()) if (!keep.has(url)) warm.current.delete(url)
  }, [loadedIndex, images, count])

  /* A short fade-in once the new photo has actually loaded, so a swap reads as
     soft rather than abrupt without ever holding the next photo back. It runs on
     the element's own opacity, so there is no remount (no blank frame), a fresh
     click cancels the previous fade instead of queueing behind it, and it is
     skipped entirely for visitors who ask for reduced motion. */
  const onImgLoad = () => {
    setLoadedIndex(index)
    const el = imgRef.current
    if (!el || !el.animate || prefersReducedMotion()) return
    fadeRef.current?.cancel()
    fadeRef.current = el.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: FADE_MS, easing: 'ease-out' })
  }

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
  /* `lightboxAlt` lets a caller state the alt outright instead of having it
     derived from the visible caption. The hotel viewer uses it so the enlarged
     photo keeps the hotel record's own descriptive, already-localized alt while
     the visible caption stays the short category label. No gallery item carries
     this key, so the tour gallery's alt is unchanged. */
  const alt = image.lightboxAlt || caption || (image.description || '')

  const fullSrc = lightboxSrc(image)

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
    <div className={`gallery-lightbox-backdrop${className ? ` ${className}` : ''}`} onClick={onClose} role="dialog" aria-modal="true" aria-label={label || t('tour.gallery')}>
      {/* The side zones come FIRST so the arrows, close button and caption are
          later siblings: they paint above the zones and a click on any of them
          is handled by that control, never by the zone underneath. The CSS also
          uses this order to brighten the matching arrow while a zone is hovered
          (`.zone--prev:hover ~ .nav--prev`). Real <button>s, so they are
          reachable and operable from the keyboard like any other control. */}
      {sideNav && count > 1 && (
        <>
          <button
            type="button"
            className="gallery-lightbox__zone gallery-lightbox__zone--prev"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label={navLabels?.prev || t('tour.prevImage')}
            tabIndex={-1}
          />
          <button
            type="button"
            className="gallery-lightbox__zone gallery-lightbox__zone--next"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label={navLabels?.next || t('tour.nextImage')}
            tabIndex={-1}
          />
        </>
      )}
      {count > 1 && (
        <p className="gallery-lightbox__counter" aria-live="polite">{index + 1} / {count}</p>
      )}
      <button ref={closeBtnRef} className="gallery-lightbox__close" onClick={onClose} aria-label={t('hotel.close')}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {count > 1 && (
        <button
          className="gallery-lightbox__nav gallery-lightbox__nav--prev"
          onClick={(e) => { e.stopPropagation(); goPrev() }}
          aria-label={navLabels?.prev || t('tour.prevImage')}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}
      <img
        ref={imgRef}
        src={fullSrc}
        alt={alt}
        decoding="async"
        onLoad={onImgLoad}
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
          aria-label={navLabels?.next || t('tour.nextImage')}
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
                    <h3 className="gallery-card__location">{caption}</h3>
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
