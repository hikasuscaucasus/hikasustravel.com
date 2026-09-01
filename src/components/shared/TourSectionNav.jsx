import { useState, useEffect, useRef, useCallback } from 'react'
import useT from '../../i18n/useT'

export default function TourSectionNav({ sections }) {
  const [activeId, setActiveId] = useState(sections[0]?.id || '')
  const [isFixed, setIsFixed] = useState(false)
  const navRef = useRef(null)
  const sentinelRef = useRef(null)
  // Set while a click-initiated smooth scroll is in flight; holds the clicked
  // id so the pill cannot flicker through every section on the way there.
  const lockRef = useRef(null)
  const lockTimerRef = useRef(0)
  // The section the visitor last asked for, used only to break a tie between
  // sections that share a row (see computeActive).
  const preferredRef = useRef(null)
  const rafRef = useRef(0)
  const t = useT()

  // Which section is "reached"? The browser puts a clicked section at its own
  // `scroll-margin-top` (ivory.css: header + sub-nav + 16px), so that value IS
  // the activation line — reading it back from the section means the scroll
  // target and the scrollspy can never disagree, at any breakpoint, with no
  // header height duplicated in JS. Previously the spy used a hard-coded 120px
  // while the sections landed at 126px, so a clicked section never counted as
  // reached and the previous one stayed active.
  const computeActive = useCallback(() => {
    let lastRendered = null
    let lastTop = 0
    const passed = []

    for (const section of sections) {
      const el = document.getElementById(section.id)
      // A section that is not rendered (or is hidden) must not take part.
      if (!el || !el.offsetHeight) continue
      const top = el.getBoundingClientRect().top
      lastRendered = section.id
      lastTop = top
      const line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      // Tolerance covers fractional device pixels and smooth-scroll rounding,
      // which can leave a section a hair below its own line.
      if (top - line <= 1.5) passed.push({ id: section.id, top })
    }

    let current = sections[0]?.id || ''
    if (passed.length) {
      // Normally the last section to pass the line is the one being read. But
      // sections that share a row — the group tour puts Accommodation and
      // Pricing side by side — cross the line in the same frame, and a tie is
      // not a sequence: taking the last would make Pricing unbeatable and
      // Accommodation unclickable. So the trailing run of equal tops is
      // resolved by intent (the pill the visitor actually clicked) and
      // otherwise by document order.
      const top = passed[passed.length - 1].top
      let i = passed.length - 1
      while (i > 0 && Math.abs(passed[i - 1].top - top) <= 4) i--
      const tied = passed.slice(i)
      current = (tied.find((s) => s.id === preferredRef.current) || tied[0]).id
    }

    // Bottom-of-document edge case: the last section (Book) can be shorter than
    // the space under the activation line, so no amount of scrolling can bring
    // it up to the line. Whoever is at the end of a scrollable page is looking
    // at the last section.
    const doc = document.documentElement
    const scrollable = doc.scrollHeight - window.innerHeight > 4
    const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= doc.scrollHeight - 2
    if (scrollable && atBottom && lastRendered && lastTop < window.innerHeight) {
      current = lastRendered
    }

    return current
  }, [sections])

  const update = useCallback(() => {
    const current = computeActive()
    const locked = lockRef.current
    if (locked) {
      // Still travelling towards the clicked section: keep its pill lit.
      if (current !== locked) return
      lockRef.current = null
      window.clearTimeout(lockTimerRef.current)
    }
    setActiveId(current)
  }, [computeActive])

  // rAF-coalesced: one layout read per frame however fast the wheel spins.
  const schedule = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0
      update()
    })
  }, [update])

  const handleClick = (e, id) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    // Immediate feedback, held for the length of the smooth scroll.
    setActiveId(id)
    preferredRef.current = id
    lockRef.current = id
    window.clearTimeout(lockTimerRef.current)
    // Safety net only: the lock normally releases the moment the geometry
    // agrees (see `update`) or on `scrollend`.
    lockTimerRef.current = window.setTimeout(() => {
      lockRef.current = null
      schedule()
    }, 1500)
    el.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const onScrollEnd = () => {
      lockRef.current = null
      window.clearTimeout(lockTimerRef.current)
      schedule()
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    if ('onscrollend' in window) window.addEventListener('scrollend', onScrollEnd)
    // Settle the initial state: top of page, a restored scroll position, or a
    // deep link such as #accommodation.
    schedule()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if ('onscrollend' in window) window.removeEventListener('scrollend', onScrollEnd)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      window.clearTimeout(lockTimerRef.current)
    }
  }, [schedule])

  // Use IntersectionObserver on sentinel to toggle fixed positioning.
  // rootMargin offsets the root's top edge by the fixed-nav offset (matching
  // .td-nav--fixed top: 64px desktop / 80px at <=600px) so the nav pins the
  // instant it reaches the bottom of the sticky site bar instead of the top
  // of the viewport. Without it the nav briefly slides up UNDER the site bar
  // during scroll and its top edge (e.g. the "Accommodation" tab) is clipped
  // before it snaps into place.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    // <=900px uses the compact 80px fixed header (see styles.css); above that
    // the section nav sits 64px below the ~51px sticky site bar.
    const mq = window.matchMedia('(max-width: 900px)')
    let observer

    const setup = () => {
      if (observer) observer.disconnect()
      const topOffset = mq.matches ? 80 : 64
      observer = new IntersectionObserver(
        ([entry]) =>
          // Pin only once the nav has actually scrolled up to the offset line.
          // The boundingClientRect.top guard prevents a boundary case: when the
          // hero is ~one viewport tall the sentinel sits right at the fold and
          // isIntersecting can read false at the very top of the page, which
          // would pin the nav while the full-size site header/logo is still on
          // screen — overlapping the nav (e.g. "Accommodation") at 601-900px
          // widths where there is no compact sticky header bar.
          setIsFixed(!entry.isIntersecting && entry.boundingClientRect.top <= topOffset),
        { threshold: 0, rootMargin: `-${topOffset}px 0px 0px 0px` }
      )
      observer.observe(sentinel)
    }

    setup()
    mq.addEventListener('change', setup)
    return () => {
      if (observer) observer.disconnect()
      mq.removeEventListener('change', setup)
    }
  }, [])

  // scroll active tab into view on mobile
  useEffect(() => {
    if (!navRef.current) return
    const active = navRef.current.querySelector('.td-nav__link--active')
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeId])

  return (
    <>
      <div ref={sentinelRef} className="td-nav-sentinel" />
      <nav className={`td-nav${isFixed ? ' td-nav--fixed' : ''}`} ref={navRef} aria-label="Tour sections">
        <div className="td-nav__inner">
          {sections.map(({ id, labelKey }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`td-nav__link${activeId === id ? ' td-nav__link--active' : ''}`}
              onClick={(e) => handleClick(e, id)}
              aria-current={activeId === id ? 'true' : undefined}
            >
              {t(labelKey)}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}
