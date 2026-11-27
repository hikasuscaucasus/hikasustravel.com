import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import useT from '../../i18n/useT'

const NONE = []
const MARGIN = 12
const GAP = 8

/**
 * The places a tour visits, in route order. ONE source of truth: `tour.places`
 * (an ordered list of place ids in tours.js); the display name of each id is the
 * locale's own `place.<id>` string in ui.json, so no tour and no language carries
 * a separate hand-maintained list.
 *
 *  - variant="compact" (tour cards): the first `limit` places, then a real <button>
 *    "+N" that opens a small popover listing the remaining ones. The popover is
 *    portalled to <body> and fixed-positioned from the button's rect, so it never
 *    changes the card's height (the card image stretches to the body's height, so
 *    growing the chips in place stretched the photo) and is not clipped by the
 *    card's overflow:hidden. All ids are already in the card data: no request.
 *  - variant="full" (tour page): every place as a plain semantic list under a
 *    heading, rendered in the static HTML. Plain labels, not links: most places
 *    have no destination page, and nested links would fight the card's own links.
 */
export default function TourPlaces({ places = NONE, variant = 'compact', limit = 6 }) {
  const t = useT()
  if (!places.length) return null
  const names = places.map((id) => t(`place.${id}`))

  if (variant === 'full') {
    return (
      <div className="td-places">
        <h3 className="td-places__title">{t('tour.placesIncluded')}</h3>
        <ul className="tc__tags td-places__list">
          {names.map((name, i) => (
            <li key={places[i]} className="tc__tag">{name}</li>
          ))}
        </ul>
      </div>
    )
  }

  const hidden = names.length - limit
  const shownCount = hidden > 0 ? limit : names.length
  return (
    <ul className="tc__tags" aria-label={t('a11y.destinations')}>
      {names.slice(0, shownCount).map((name, i) => (
        <li key={places[i]} className="tc__tag">{name}</li>
      ))}
      {hidden > 0 && (
        <li className="tc__tag-toggle-item">
          <MorePlaces
            names={names.slice(limit)}
            ids={places.slice(limit)}
            label={t('tour.morePlaces', { count: hidden })}
            text={`+${hidden}`}
          />
        </li>
      )}
    </ul>
  )
}

function MorePlaces({ names, ids, label, text }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(null)
  const btnRef = useRef(null)
  const panelRef = useRef(null)
  const panelId = useId()

  const place = useCallback(() => {
    const btn = btnRef.current
    const panel = panelRef.current
    if (!btn || !panel) return
    const r = btn.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const width = Math.min(panel.offsetWidth, vw - MARGIN * 2)
    const height = panel.scrollHeight + 2
    const left = Math.max(MARGIN, Math.min(r.left, vw - width - MARGIN))
    const below = vh - r.bottom - GAP - MARGIN
    const above = r.top - GAP - MARGIN
    const flip = height > below && above > below
    const room = Math.max(96, flip ? above : below)
    const top = flip ? r.top - GAP - Math.min(height, room) : r.bottom + GAP
    setPos({ left, top, maxHeight: room })
  }, [])

  useLayoutEffect(() => {
    if (open) place()
  }, [open, place])

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    const onScroll = (e) => {
      if (panelRef.current?.contains(e.target)) return
      place()
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, place])

  const toggle = () => {
    setPos(null)
    setOpen((v) => !v)
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="tc__tag tc__tag--more tc__tag--toggle"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="true"
        aria-label={label}
        onClick={toggle}
      >
        {text}
      </button>
      {open && createPortal(
        <ul
          ref={panelRef}
          id={panelId}
          className="tc-more-pop"
          aria-label={label}
          style={pos ? { left: pos.left, top: pos.top, maxHeight: pos.maxHeight } : { left: 0, top: 0, visibility: 'hidden' }}
        >
          {names.map((name, i) => (
            <li key={ids[i]} className="tc__tag">{name}</li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  )
}
