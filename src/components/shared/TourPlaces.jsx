import { useId, useState } from 'react'
import useT from '../../i18n/useT'

const NONE = []

/**
 * The places a tour visits, in route order. ONE source of truth: `tour.places`
 * (an ordered list of place ids in tours.js); the display name of each id is the
 * locale's own `place.<id>` string in ui.json, so no tour and no language carries
 * a separate hand-maintained list.
 *
 *  - variant="compact" (tour cards): the first `limit` places, then a real <button>
 *    "+N" that expands the remaining ones in place and collapses back. All ids are
 *    already in the card data, so expanding only changes what is rendered: no
 *    request, no modal, no layout shift outside the card.
 *  - variant="full" (tour page): every place as a plain semantic list under a
 *    heading, rendered in the static HTML. Plain labels, not links: most places
 *    have no destination page, and nested links would fight the card's own links.
 */
export default function TourPlaces({ places = NONE, variant = 'compact', limit = 6 }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const listId = useId()
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
  const shown = hidden > 0 && !open ? names.slice(0, limit) : names
  return (
    <ul id={listId} className="tc__tags" aria-label={t('a11y.destinations')}>
      {shown.map((name, i) => (
        <li key={places[i]} className="tc__tag">{name}</li>
      ))}
      {hidden > 0 && (
        <li className="tc__tag-toggle-item">
          <button
            type="button"
            className="tc__tag tc__tag--more tc__tag--toggle"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={open ? t('tour.fewerPlaces') : t('tour.morePlaces', { count: hidden })}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '−' : `+${hidden}`}
          </button>
        </li>
      )}
    </ul>
  )
}
