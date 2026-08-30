import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import ScrollToTop from './ScrollToTop'
import WhatsAppButton from './WhatsAppButton'
import { tours } from '../../data/tours'

/* Ivory-badge design pilot (branch design-ivory-pilot).
   The theme lives in assets/css/ivory.css, entirely under `.theme-ivory`, and
   the class is put on <html> for tour-detail routes only. scripts/prerender.js
   writes the same class into the static HTML, so the served page and the
   hydrated page agree; this effect keeps it correct across SPA navigation.
   Matching on the tour registry rather than the URL shape is deliberate — the
   private-tour COLLECTION pages share the /private-tours/<slug> path and must
   not be themed. */
const TOUR_DETAIL_PATH = /^\/[a-z]{2}\/(?:private-tours|group-tours)\/([^/]+)\/?$/
const TOUR_SLUGS = new Set(tours.map((t) => t.slug))
const isIvoryRoute = (pathname) => {
  const m = pathname.match(TOUR_DETAIL_PATH)
  return !!m && TOUR_SLUGS.has(m[1])
}

export default function Layout() {
  const location = useLocation()
  const { lang } = useParams()
  const navigate = useNavigate()
  // Match /:lang/shuttle-service
  const isTaxiPage = /^\/[a-z]{2}\/shuttle-service$/.test(location.pathname)

  useEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    document.documentElement.classList.toggle('theme-ivory', isIvoryRoute(location.pathname))
  }, [location.pathname])

  // App-wide soft-navigation for auto-generated in-content links. The linker
  // emits <a data-internal="/georgia/..."> (lang-less) plus a full-href
  // fallback; this delegated handler turns a plain left-click into an SPA
  // navigation. It defers to any page-local handler that already called
  // preventDefault, and ignores modifier-clicks so "open in new tab" still works.
  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest && e.target.closest('a[data-internal]')
      if (!a) return
      const to = a.getAttribute('data-internal')
      if (!to) return
      e.preventDefault()
      navigate(`/${lang}${to}`)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [lang, navigate])

  return (
    <>
      <ScrollToTop />
      <Header variant={isTaxiPage ? 'taxi' : 'default'} />
      <main>
        {/* Page components are code-split (see App.jsx). The boundary sits here
            rather than around <Routes> so the header and footer stay mounted
            while a chunk loads; the fallback is deliberately empty so nothing
            flashes in and out of the page area. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>
      <BackToTop />
      <WhatsAppButton />
      <Footer variant={isTaxiPage ? 'taxi' : 'default'} />
    </>
  )
}
