import { Suspense, useEffect } from 'react'
import { Outlet, useLocation, useParams, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import BackToTop from './BackToTop'
import ScrollToTop from './ScrollToTop'
import WhatsAppButton from './WhatsAppButton'

export default function Layout() {
  const location = useLocation()
  const { lang } = useParams()
  const navigate = useNavigate()
  // Match /:lang/shuttle-service
  const isTaxiPage = /^\/[a-z]{2}\/shuttle-service$/.test(location.pathname)

  useEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  /* The Ivory theme class used to be toggled here per route. It is site-wide
     now and ships on <html> in index.html, so there is nothing to toggle. */

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
