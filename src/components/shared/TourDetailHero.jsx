import { useEffect, useRef, useState } from 'react'
import asset from '../../utils/basePath'
import LocaleLink from '../../i18n/LocaleLink'
import useT from '../../i18n/useT'

/* Ivory-badge pilot: the hero is a two-column split (copy left, framed cover
   photo right) instead of the full-viewport photo it used to be, so the photo
   is a real <img> rather than a CSS background — which is what lets it carry
   fetchpriority, a srcset and explicit dimensions.

   The renditions come from the tour's own gallery: a gallery item that ships
   `base` + `widths` and whose base is the stem of `heroImage` is the same
   photograph at every size the image pipeline built. Any tour without such an
   item still renders, from the single `heroImage` file. Nothing new is
   generated and no image is introduced that the page did not already use. */
function heroRenditions(tour) {
  const src = tour.heroImage || ''
  const item = (tour.gallery || []).find(
    (g) => g.base && g.widths?.length && src.startsWith(`${g.base}-`),
  )
  if (!item) return null
  const set = (ext) => item.widths.map((w) => `${asset(`${item.base}-${w}.${ext}`)} ${w}w`).join(', ')
  return { avif: set('avif'), webp: set('webp'), width: item.width, height: item.height }
}

const HERO_SIZES = '(max-width: 760px) 100vw, 520px'

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function MapPinIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

/* The sites panel is rendered inline (not through a portal) and toggled with
   `hidden`, so its 15 internal links are in the served HTML — renderToString
   does not support portals, and a crawler must be able to follow them. */
function SitesPanel({ sites, label, open, onClose }) {
  const t = useT()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <div className="iv-sites" hidden={!open} onClick={onClose} role="dialog" aria-modal="true" aria-label={label}>
      <div className="iv-sites__panel" onClick={(e) => e.stopPropagation()}>
        <div className="iv-sites__head">
          <h2 className="iv-sites__title">{label}</h2>
          <button type="button" ref={closeRef} className="iv-sites__close" onClick={onClose} aria-label={t('hotel.close')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <ul className="iv-sites__list">
          {sites.map((s, i) => (
            <li key={s.to}>
              <span className="iv-sites__n">{i + 1}</span>
              <LocaleLink to={s.to}>{s.name}</LocaleLink>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function TagIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
      <circle cx="7" cy="7" r="1.4" />
    </svg>
  )
}

export default function TourDetailHero({ tour, translatedTitle, heroH1, isGroup, sites, startingPrice }) {
  const t = useT()
  const [sitesOpen, setSitesOpen] = useState(false)
  const title = translatedTitle || tour.title
  const h1 = heroH1 || title
  const rend = heroRenditions(tour)
  const sitesLabel = sites?.length ? `${sites.length} sites` : null

  const scrollToBook = (e) => {
    e.preventDefault()
    const el = document.getElementById('book')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const backPath = isGroup ? '/group-tours' : '/private-tours'
  const backLabel = isGroup ? t('tour.groupTours') : t('tour.privateTours')

  return (
    <section className="td-hero td-hero--split">
      <div className="td-hero__inner">
        <div className="td-hero__copy">
          <nav className="td-hero__breadcrumb" aria-label={t('a11y.breadcrumb')}>
            <LocaleLink to={backPath}>{backLabel}</LocaleLink>
            <span aria-hidden="true">/</span>
            <span>{title}</span>
          </nav>

          <h1 className="td-hero__title">{h1}</h1>

          {/* Orientation chips: how long, what kind of tour, and — English only,
              on a tour that supplies the list — how many named stops. The
              hero's old subtitle/fact list stays retired; `heroSubtitle` and
              `heroFacts` remain in the tour data untouched. */}
          <div className="td-hero__meta">
            {tour.days && (
              <span className="iv-chip">
                <CalendarIcon />
                {tour.days} {t('tour.days')}
              </span>
            )}
            <span className="iv-chip">
              <UsersIcon />
              {isGroup ? t('tour.groupTours') : t('tour.privateTours')}
            </span>
            {startingPrice > 0 && (
              <span className="iv-chip iv-chip--price">
                <TagIcon />
                {!isGroup && `${t('sidebar.startingFrom')} `}
                €{startingPrice.toLocaleString('en-US')} {t('pricing.perPerson')}
              </span>
            )}
            {sitesLabel && (
              <button
                type="button"
                className="iv-chip"
                aria-haspopup="dialog"
                aria-expanded={sitesOpen}
                onClick={() => setSitesOpen(true)}
              >
                <MapPinIcon />
                {sitesLabel}
              </button>
            )}
          </div>

          <div className="td-hero__actions">
            <a href="#book" onClick={scrollToBook} className="iv-pill">
              {isGroup ? t('tour.requestTour') : t('tour.requestTourCustom')}
            </a>
          </div>
        </div>

        <figure className="td-hero__photo frame">
          {rend ? (
            <picture>
              <source type="image/avif" srcSet={rend.avif} sizes={HERO_SIZES} />
              <source type="image/webp" srcSet={rend.webp} sizes={HERO_SIZES} />
              <img
                src={asset(tour.heroImage)}
                width={rend.width}
                height={rend.height}
                sizes={HERO_SIZES}
                alt={title}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          ) : (
            <img src={asset(tour.heroImage)} alt={title} fetchPriority="high" decoding="async" />
          )}
        </figure>
      </div>

      {sitesLabel && (
        <SitesPanel sites={sites} label={sitesLabel} open={sitesOpen} onClose={() => setSitesOpen(false)} />
      )}
    </section>
  )
}
