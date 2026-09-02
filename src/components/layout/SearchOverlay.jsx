import { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import { getSearchIndex } from '../../data/searchIndex'
import { searchEntries } from '../../utils/searchRank'

// Enough to cover the useful matches without turning the panel into a page of
// its own. Nothing is paginated: refining the query is faster than scrolling.
const MAX_RESULTS = 10

// URL sections a visitor can be shown by name. Every key here is a string the
// site already ships in all seven locales, so the trail is translated without
// a single new entry in ui.json.
const SECTION_KEYS = {
  'private-tours': 'tour.privateTours',
  'group-tours': 'tour.groupTours',
  tours: 'nav.tours',
  georgia: 'destinations.country',
  regions: 'nav.regions',
  cities: 'nav.cities',
  'places-to-visit': 'nav.placesToVisit',
  'border-crossings': 'nav.borderCrossings',
  blog: 'footer.blog',
  embassies: 'footer.embassies',
  'shuttle-service': 'shuttle.title',
  'about-us': 'footer.about',
  'about-georgia': 'footer.aboutGeorgia',
  contact: 'footer.contact',
  faq: 'footer.faq',
}

const titleize = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

/**
 * The sections a result sits in, for display only — the link's href is
 * untouched. "/en/georgia/regions/samtskhe-javakheti" reads as
 * "Georgia › Regions" rather than as a path.
 *
 * The language prefix goes (the visitor is already in that language) and so
 * does the last segment, which is the slug of the page whose title is the
 * first line of this very result. A top-level page has nothing left after
 * that, so it shows no trail at all rather than a lone repeat of its title.
 */
function resultTrail(url, t) {
  const parts = String(url || '').split('/').filter(Boolean).slice(1)
  const trail = parts.slice(0, -1)
  if (!trail.length) return null
  return trail.map((seg) => (SECTION_KEYS[seg] ? t(SECTION_KEYS[seg]) : titleize(seg))).join(' › ')
}

function CloseIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="20" height="20" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="20" y1="20" x2="16.65" y2="16.65" />
    </svg>
  )
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

/**
 * Global site search, as a modal overlay.
 *
 * Deliberately NOT a route: a /search?q=… page would mint an unbounded set of
 * thin, crawlable URLs. Results themselves are ordinary <Link>s to canonical
 * pages, so every destination stays a normal internal link.
 *
 * Keyboard model uses real focus rather than aria-activedescendant, so results
 * are plain links that screen readers announce as links: ArrowDown from the
 * input steps into the list, Arrow keys walk it, ArrowUp from the first result
 * returns to the input, Enter in the input opens the top result, Escape closes,
 * and Tab is trapped inside the panel.
 */
export default function SearchOverlay({ onClose }) {
  const t = useT()
  const { lang } = useLang()
  const { pages, tourTranslations, loadTourTranslations } = useContext(I18nContext)
  const [query, setQuery] = useState('')

  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const resultRefs = useRef([])

  // Tour titles live in a separate, lazily loaded locale file. Ask for it on
  // open; until it lands the index falls back to the English tour titles that
  // ship in tours.js, and rebuilds automatically once it resolves.
  useEffect(() => {
    if (!tourTranslations) loadTourTranslations()
  }, [tourTranslations, loadTourTranslations])

  // getSearchIndex memoises per locale, so calling it during render is cheap
  // and avoids a useMemo keyed on t(), which is a new closure every render.
  const index = getSearchIndex({ lang, pages, t, tourTranslations })
  const trimmed = query.trim()
  const results = useMemo(
    () => (trimmed ? searchEntries(index, trimmed, MAX_RESULTS) : []),
    [index, trimmed],
  )

  useEffect(() => { resultRefs.current = resultRefs.current.slice(0, results.length) }, [results.length])

  // Focus the input on open, and lock body scroll while the overlay is up
  // (same approach as the existing hotel/dish modals).
  useEffect(() => {
    inputRef.current?.focus()
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const focusResult = useCallback((i) => {
    const el = resultRefs.current[i]
    if (el) el.focus()
  }, [])

  const onPanelKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    if (e.key !== 'Tab') return
    // Focus trap: cycle within the panel rather than escaping to the page behind.
    const nodes = Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) || [])
      .filter((n) => n.offsetParent !== null || n === document.activeElement)
    if (nodes.length === 0) return
    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  const onInputKeyDown = (e) => {
    if (e.key === 'ArrowDown' && results.length) {
      e.preventDefault()
      focusResult(0)
    } else if (e.key === 'Enter' && results.length) {
      // Enter with no result focused opens the best match — the usual
      // "I typed the name, just take me there" shortcut.
      e.preventDefault()
      resultRefs.current[0]?.click()
    }
  }

  const onResultKeyDown = (e, i) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusResult(Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (i === 0) inputRef.current?.focus()
      else focusResult(i - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusResult(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusResult(results.length - 1)
    }
  }

  return createPortal(
    <div
      className="site-search"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="site-search__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="site-search-title"
        ref={panelRef}
        onKeyDown={onPanelKeyDown}
      >
        <h2 id="site-search-title" className="site-search__title">{t('search.title')}</h2>

        <div className="site-search__bar">
          <span className="site-search__bar-icon"><SearchIcon /></span>
          <input
            ref={inputRef}
            id="site-search-input"
            className="site-search__input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder={t('search.placeholder')}
            aria-label={t('search.title')}
            aria-describedby="site-search-status"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button
            type="button"
            className="site-search__close"
            onClick={onClose}
            aria-label={t('search.close')}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="site-search__body">
          {!trimmed && <p className="site-search__hint">{t('search.hint')}</p>}

          {trimmed && results.length === 0 && (
            <div className="site-search__empty">
              <p className="site-search__empty-title">{t('search.noResults', { query: trimmed })}</p>
              <p className="site-search__empty-hint">{t('search.noResultsHint')}</p>
            </div>
          )}

          {results.length > 0 && (
            <ul className="site-search__results">
              {results.map((r, i) => (
                <li key={r.id}>
                  <Link
                    to={r.url}
                    className="site-search__result"
                    ref={(el) => { resultRefs.current[i] = el }}
                    onClick={onClose}
                    onKeyDown={(e) => onResultKeyDown(e, i)}
                  >
                    <span className="site-search__result-head">
                      <span className="site-search__result-title">{r.title}</span>
                      <span className="site-search__result-type">{r.typeLabel}</span>
                    </span>
                    {r.description && (
                      <span className="site-search__result-desc">{r.description}</span>
                    )}
                    {(r.location || resultTrail(r.url, t)) && (
                      <span className="site-search__result-meta">
                        {r.location && <span className="site-search__result-loc">{r.location}</span>}
                        {resultTrail(r.url, t) && (
                          <span className="site-search__result-url">{resultTrail(r.url, t)}</span>
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="site-search__footer">
          <span id="site-search-status" className="site-search__status" role="status" aria-live="polite">
            {trimmed ? t('search.results', { count: results.length }) : ''}
          </span>
          <span className="site-search__keys" aria-hidden="true">
            <kbd>&#8629;</kbd> {t('search.viewResult')}
            <kbd>Esc</kbd> {t('search.close')}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
