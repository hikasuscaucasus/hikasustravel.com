import { useEffect, useState } from 'react'
import useT from '../../i18n/useT'

/**
 * Desktop-width sticky request bar: appears once the hero's own top CTA
 * (`#td-hero-cta` in TourDetailHero) scrolls out of view, showing the
 * starting price and a "Request this tour" button that jumps to #book.
 *
 * Mobile is intentionally left to the existing `.iv-mobilebar` (always
 * visible ≤900px, already tuned — including its own hard-won WhatsApp/
 * back-to-top stacking fix — see ivory.css) rather than duplicated here:
 * `.iv-stickybar` only ever renders above 900px (see ivory.css), so the two
 * bars never compete for the same viewport.
 *
 * SSR-safe: IntersectionObserver only runs inside useEffect, which never
 * executes during prerendering, so this renders nothing extra server-side.
 */
export default function StickyRequestBar({ startingPrice }) {
  const t = useT()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!startingPrice) return undefined
    const target = document.getElementById('td-hero-cta')
    if (!target || typeof IntersectionObserver === 'undefined') return undefined

    // Reserve space so the WhatsApp float button never sits under the bar —
    // see the matching `body.has-tour-stickybar` rule in ivory.css. Applied
    // for the page's whole lifetime (not toggled with `visible`) so the
    // button doesn't jump position every time the bar shows/hides on scroll.
    document.body.classList.add('has-tour-stickybar')

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '0px', threshold: 0 }
    )
    observer.observe(target)
    return () => {
      observer.disconnect()
      document.body.classList.remove('has-tour-stickybar')
    }
  }, [startingPrice])

  if (!startingPrice) return null

  return (
    <div className={`iv-stickybar${visible ? ' iv-stickybar--visible' : ''}`}>
      <span className="iv-stickybar__price">
        <span className="iv-stickybar__amount">€{startingPrice.toLocaleString('en-US')}</span>
        <span className="iv-stickybar__note">{t('sidebar.startingFrom')} · {t('pricing.perPerson')}</span>
      </span>
      <a
        href="#book"
        className="iv-pill iv-stickybar__cta"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        {t('tour.requestThisTour')}
      </a>
    </div>
  )
}
