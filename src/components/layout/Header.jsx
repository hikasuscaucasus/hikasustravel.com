import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
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

function Caret() {
  return (
    <svg
      className="nav-dropdown__caret"
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function NavDropdown({ item, t, lang, pathname }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click / Escape — mirrors the LanguageSwitcher pattern.
  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const label = t(item.labelKey)

  // Desktop: close when the cursor leaves the whole dropdown area. Also drop focus
  // so :focus-within (kept open after a click) releases. mouseleave does not fire on
  // touch, so mobile tap behaviour and keyboard tabbing are unaffected.
  const handleMouseLeave = () => {
    setOpen(false)
    const el = ref.current
    if (el && el.contains(document.activeElement)) document.activeElement.blur()
  }

  return (
    <span className={`nav-dropdown${open ? ' open' : ''}`} ref={ref} onMouseLeave={handleMouseLeave}>
      <button
        type="button"
        className="nav-dropdown__toggle"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {label}
        <Caret />
      </button>
      <div className="nav-dropdown__menu" role="menu" aria-label={label}>
        {item.children.map((child) => (
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
          link.children ? (
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
