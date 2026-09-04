import { useState, useEffect, useRef, useCallback, useId, lazy, Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { navLinks } from '../../data/siteData'
import asset from '../../utils/basePath'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import LocaleLink from '../../i18n/LocaleLink'
import LanguageSwitcher from './LanguageSwitcher'
import SearchButton from './SearchButton'

// The search panel and its index builder are only needed once someone actually
// searches, so they stay out of the main bundle and are fetched separately —
// warmed on button hover/focus and again when the page goes idle (see below).
const importSearchOverlay = () => import('./SearchOverlay')
const SearchOverlay = lazy(importSearchOverlay)

function Caret({ className = 'nav-dropdown__caret' }) {
  return (
    <svg
      className={className}
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// Desktop is the only breakpoint with a hover-driven flyout; below it the same
// markup is an in-place accordion (see the <=900 blocks in styles.css), so every
// pointer-hover handler is gated on this.
const isDesktop = () => typeof window !== 'undefined' && window.innerWidth > 900

/** Every menu item the visitor can actually see right now, in DOM order. */
const visibleItems = (root) =>
  Array.from(root?.querySelectorAll('[role="menuitem"]') || []).filter((el) => el.offsetParent !== null)

/**
 * One country at level 1 of the Destinations dropdown, with its entries at
 * level 2. The panel is always rendered and hidden with CSS — never mounted
 * conditionally — so it is present in the prerendered HTML (scripts/prerender.js
 * renders this same tree) and hydrates without a mismatch.
 *
 * A country whose landing page exists gets a link plus a separate caret button:
 * the link navigates, the caret opens the panel. Without that split there is no
 * way to reach the entries by tap, because the tap would follow the link. A
 * country with no landing page is a single toggle button.
 */
function NavCountry({ country, t, lang, pathname, open, setOpen, onNavigate }) {
  const ref = useRef(null)
  const panelId = useId()
  const labelId = useId()
  const label = t(country.labelKey)
  const entries = country.regions.filter((r) => r.published)

  // A flyout hung off the right edge of the parent menu can run past the
  // viewport. It is measured once it is laid out and flipped to the other side
  // when it would — never during render, so the server and the client agree.
  //
  // The result is written as a data attribute rather than held in state: it is a
  // measurement of the DOM, not a fact React owns, and one this component does
  // not render, so React can never overwrite it and no second render is needed.
  useEffect(() => {
    const panel = ref.current?.querySelector('.nav-country__panel')
    if (!panel) return
    if (!open) {
      panel.removeAttribute('data-flip')
      return
    }
    if (!isDesktop()) return
    if (panel.getBoundingClientRect().right > document.documentElement.clientWidth - 8) {
      panel.setAttribute('data-flip', '')
    }
  }, [open])

  const toggle = () => setOpen(open ? null : country.id)

  // aria-controls needs the panel to exist whether or not it holds menu items.
  // With no published entries it holds one line of text and no menu, so it is
  // deliberately not given role="menu" in that case.
  const panel = (
    <div
      className="nav-country__panel"
      id={panelId}
      {...(entries.length ? { role: 'menu', 'aria-labelledby': labelId } : {})}
    >
      {entries.length ? (
        entries.map((entry) => (
          <LocaleLink
            key={entry.to}
            to={entry.to}
            role="menuitem"
            className={pathname === `/${lang}${entry.to}` ? 'active' : ''}
            onClick={onNavigate}
          >
            {entry.labelKey ? t(entry.labelKey) : entry.label}
          </LocaleLink>
        ))
      ) : (
        <span className="nav-country__empty">{t('nav.destinations.comingSoon')}</span>
      )}
    </div>
  )

  return (
    <div
      className={`nav-country${open ? ' open' : ''}`}
      data-country={country.id}
      ref={ref}
      onMouseEnter={() => { if (isDesktop()) setOpen(country.id) }}
      onMouseLeave={() => { if (isDesktop() && open) setOpen(null) }}
    >
      <div className="nav-country__row">
        {country.hubPath ? (
          <>
            <LocaleLink
              to={country.hubPath}
              id={labelId}
              role="menuitem"
              className={`nav-country__link${pathname === `/${lang}${country.hubPath}` ? ' active' : ''}`}
              onClick={onNavigate}
            >
              {label}
            </LocaleLink>
            {/* Labelled by the country name rather than a string of its own, so
                the split control needs no copy that does not already exist. */}
            <button
              type="button"
              className="nav-country__caret"
              role="menuitem"
              aria-labelledby={labelId}
              aria-haspopup="true"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={toggle}
            >
              <Caret className="nav-country__chevron" />
            </button>
          </>
        ) : (
          <button
            type="button"
            id={labelId}
            className="nav-country__link nav-country__link--toggle"
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
          >
            {/* The label fills the row so it keeps the alignment its sibling
                country links have, rather than being pinned left by the flex. */}
            <span className="nav-country__label">{label}</span>
            <Caret className="nav-country__chevron" />
          </button>
        )}
      </div>
      {panel}
    </div>
  )
}

function NavDropdown({ item, t, lang, pathname }) {
  const [open, setOpen] = useState(false)
  // Which country's level-2 panel is open, if any. Held here rather than in each
  // NavCountry so only one is ever open — on desktop two overlapping flyouts, on
  // mobile an accordion that grows without bound.
  const [openCountry, setOpenCountry] = useState(null)
  const ref = useRef(null)
  const toggleRef = useRef(null)

  const closeAll = useCallback(() => {
    setOpen(false)
    setOpenCountry(null)
  }, [])

  // Close on outside click / Escape — mirrors the LanguageSwitcher pattern.
  useEffect(() => {
    if (!open && !openCountry) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) closeAll() }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, openCountry, closeAll])

  const label = t(item.labelKey)
  const countries = item.countries?.filter((c) => c.published)

  // Desktop: close when the cursor leaves the whole dropdown area. Also drop focus
  // so :focus-within (kept open after a click) releases. mouseleave does not fire on
  // touch, so mobile tap behaviour and keyboard tabbing are unaffected.
  const handleMouseLeave = () => {
    closeAll()
    const el = ref.current
    if (el && el.contains(document.activeElement)) document.activeElement.blur()
  }

  // Focus is moved within the open panel, and handed back to the control that
  // opened it on close. Tab is deliberately left alone: it walks out of the menu
  // and the focusout below closes it, which is how a menu is expected to behave.
  const handleKeyDown = (e) => {
    const items = visibleItems(ref.current)
    const here = items.indexOf(document.activeElement)
    const focusAt = (i) => {
      const next = items[(i + items.length) % items.length]
      if (next) { e.preventDefault(); next.focus() }
    }

    switch (e.key) {
      case 'Escape': {
        e.preventDefault()
        // Step out one level at a time: an open country panel first, then the
        // whole dropdown.
        if (openCountry) {
          const country = ref.current?.querySelector('.nav-country.open')
          setOpenCountry(null)
          country?.querySelector('.nav-country__link')?.focus()
        } else {
          setOpen(false)
          toggleRef.current?.focus()
        }
        break
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        const step = e.key === 'ArrowDown' ? 1 : -1
        if (!items.length) {
          // Closed on a breakpoint where nothing is shown on focus alone.
          e.preventDefault()
          setOpen(true)
          requestAnimationFrame(() => {
            const opened = visibleItems(ref.current)
            ;(step === 1 ? opened[0] : opened[opened.length - 1])?.focus()
          })
          break
        }
        focusAt(here === -1 ? (step === 1 ? 0 : items.length - 1) : here + step)
        break
      }
      case 'Home':
        focusAt(0)
        break
      case 'End':
        focusAt(items.length - 1)
        break
      case 'ArrowRight': {
        // Into the level-2 panel of the country the focus is sitting on.
        const country = document.activeElement?.closest?.('.nav-country')
        const id = country?.dataset.country
        if (!id || country.classList.contains('open')) break
        e.preventDefault()
        setOpenCountry(id)
        requestAnimationFrame(() => country.querySelector('.nav-country__panel [role="menuitem"]')?.focus())
        break
      }
      case 'ArrowLeft': {
        // Back out of a level-2 panel onto its country.
        const panel = document.activeElement?.closest?.('.nav-country__panel')
        if (!panel) break
        e.preventDefault()
        const country = panel.closest('.nav-country')
        setOpenCountry(null)
        country?.querySelector('.nav-country__link')?.focus()
        break
      }
      default:
        break
    }
  }

  // Leaving the dropdown entirely by keyboard closes it, the same way clicking
  // outside does. relatedTarget is the element focus is moving to.
  const handleBlur = (e) => {
    // relatedTarget is the element focus is moving to. A null one means it moved
    // to nothing at all — a programmatic blur, or the browser chrome taking it —
    // which is not the visitor leaving the menu, so it is left open. Genuinely
    // interacting elsewhere is already covered by the outside-click handler.
    if (e.relatedTarget && !ref.current?.contains(e.relatedTarget)) closeAll()
  }

  return (
    <span
      className={`nav-dropdown${open ? ' open' : ''}${countries ? ' nav-dropdown--countries' : ''}`}
      ref={ref}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="nav-dropdown__toggle"
        ref={toggleRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => (open ? closeAll() : setOpen(true))}
      >
        {label}
        <Caret />
      </button>
      <div className="nav-dropdown__menu" role="menu" aria-label={label}>
        {countries
          ? countries.map((country) => (
            <NavCountry
              key={country.id}
              country={country}
              t={t}
              lang={lang}
              pathname={pathname}
              open={openCountry === country.id}
              setOpen={setOpenCountry}
              onNavigate={closeAll}
            />
          ))
          : item.children.map((child) => (
            <LocaleLink
              key={child.to}
              to={child.to}
              role="menuitem"
              className={pathname === `/${lang}${child.to}` ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {t(child.labelKey)}
            </LocaleLink>
          ))}
      </div>
    </span>
  )
}

export default function Header({ variant = 'default' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchTrigger = useRef(null)
  const menuRef = useRef(null)
  const stickyThreshold = useRef(0)
  const [menuHeight, setMenuHeight] = useState(0)
  const location = useLocation()
  const t = useT()
  const { lang } = useLang()

  const openSearch = useCallback((trigger) => {
    searchTrigger.current = trigger || null
    setMenuOpen(false)
    setSearchOpen(true)
  }, [])

  // Hand focus back to the button that opened the panel. When search was opened
  // from the keyboard shortcut there is no such button, so fall back to whichever
  // search button the current breakpoint actually shows.
  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    const stored = searchTrigger.current
    const target = stored && document.contains(stored) && stored.offsetParent !== null
      ? stored
      : Array.from(document.querySelectorAll('.nav-search')).find((n) => n.offsetParent !== null)
    target?.focus()
    searchTrigger.current = null
  }, [])

  // The search chunk used to be fetched on idle for every visitor. It pulls in
  // the search index, which derives from seoData and blogData — about 410 kB
  // gzipped on every page load, for a panel most visitors never open. It is now
  // fetched on intent instead, early enough that opening still feels instant:
  //   - mouse: onMouseEnter / onFocus on the button (SearchButton)
  //   - touch: onPointerDown / onTouchStart, which fire before the click
  //   - keyboard: the modifier handler below, on Ctrl/Cmd down before the K

  // Ctrl/Cmd+K opens search from anywhere, unless the visitor is typing in a
  // field (contact forms, the tour filters) where the browser/OS shortcut wins.
  // Holding the modifier warms the chunk so the shortcut opens without a wait.
  useEffect(() => {
    const onKey = (e) => {
      // Ctrl/Cmd goes down before the K does, so warming here means the chunk is
      // already in flight by the time the combo completes. It also fires for
      // other Ctrl combos, which is harmless — the import promise is cached.
      if (e.key === 'Control' || e.key === 'Meta') importSearchOverlay()
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return
      const el = document.activeElement
      const tag = el?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el?.isContentEditable) return
      e.preventDefault()
      openSearch(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openSearch])

  // Close the mobile menu on navigation. Adjusting state during render (instead
  // of in an effect) avoids an extra render pass — see React's "you might not
  // need an effect" guidance for resetting state when a value changes.
  const [prevPathname, setPrevPathname] = useState(location.pathname)
  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname)
    if (menuOpen) setMenuOpen(false)
  }

  useEffect(() => {
    // On mobile the header is already position:fixed via CSS, so skip sticky logic
    if (window.innerWidth <= 900) return

    let ticking = false
    // Capture the initial offset once before any sticky toggle
    const menuEl = menuRef.current
    if (menuEl) {
      stickyThreshold.current = menuEl.offsetTop
      setMenuHeight(menuEl.offsetHeight)
    }
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsSticky(window.scrollY >= stickyThreshold.current || window.scrollY > 300)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isTaxi = variant === 'taxi'
  const menuClass = `main-menu${isTaxi ? ' taxi-menu' : ''}${isSticky ? ' sticky' : ''}${menuOpen ? ' active' : ''}`

  return (
    <header className={isTaxi ? 'taxi-header' : ''} id="top">
      <div className="logo">
        <LocaleLink to="/" title={t('breadcrumb.home')}>
          <img src={asset('/img/hikasustravel.svg')} alt="Hikasus Travel" />
        </LocaleLink>
      </div>

      <LanguageSwitcher />

      {/* Compact search button for the mobile/tablet header bar (<=900px).
          A direct child of <header> so it sits in the fixed bar next to the
          language switcher and the hamburger — see the pointer-events note above. */}
      <SearchButton
        variant="bar"
        onOpen={openSearch}
        onPreload={importSearchOverlay}
        expanded={searchOpen}
      />

      <button
        className={`hamburger${menuOpen ? ' active' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={t('a11y.toggleMenu')}
      >
        <span></span>
        <span></span>
      </button>

      <nav className={menuClass} id="mainMenu" ref={menuRef}>
        {navLinks.map((link) =>
          link.children || link.countries ? (
            <NavDropdown
              key={link.labelKey}
              item={link}
              t={t}
              lang={lang}
              pathname={location.pathname}
            />
          ) : (
            <span key={link.to}>
              <LocaleLink
                to={link.to}
                title={t(link.labelKey)}
                className={location.pathname === `/${lang}${link.to}` ? 'active' : ''}
              >
                {t(link.labelKey)}
              </LocaleLink>
            </span>
          )
        )}
        {/* Desktop nav search (>900px). Appended last so it never shifts the
            nth-child stagger the mobile drawer applies to the links above. */}
        <SearchButton
          variant="nav"
          onOpen={openSearch}
          onPreload={importSearchOverlay}
          expanded={searchOpen}
        />
      </nav>
      {isSticky && <div style={{ height: menuHeight }} />}

      {searchOpen && (
        <Suspense fallback={null}>
          <SearchOverlay onClose={closeSearch} />
        </Suspense>
      )}
    </header>
  )
}
