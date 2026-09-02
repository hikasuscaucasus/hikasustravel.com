import { useState, useMemo, useRef, useContext } from 'react'
import FadeUp from '../shared/FadeUp'
import LocaleLink from '../../i18n/LocaleLink'
import { startLocations, getStopsForStart, getStartsForStop, filterRoutes } from '../../data/shuttleData'
import asset from '../../utils/basePath'
import useT from '../../i18n/useT'
import useLang from '../../i18n/useLang'
import { I18nContext } from '../../i18n/I18nContext'
import { autolinkNodes } from '../../utils/autolinkReact'
import useSEO from '../../hooks/useSEO'
import { getSEO } from '../../data/seoData'

export default function ShuttleServicePage() {
  const [selectedStart, setSelectedStart] = useState('')
  const [selectedStop, setSelectedStop] = useState('')
  const t = useT()
  const { lang } = useLang()
  const { pages } = useContext(I18nContext)
  const seo = getSEO('shuttle', lang)
  useSEO({ ...seo, lang, path: 'shuttle-service', image: '/images/files/taxi-service.jpg' })

  const availableStops = useMemo(() => getStopsForStart(selectedStart), [selectedStart])
  const availableStarts = useMemo(() => {
    if (selectedStop) return getStartsForStop(selectedStop)
    return startLocations
  }, [selectedStop])

  const filteredRoutes = useMemo(() => filterRoutes(selectedStart, selectedStop), [selectedStart, selectedStop])

  // One resolved route — both ends chosen and exactly one row matching — is the
  // point at which a visitor can be offered something to do with it.
  const chosenRoute = selectedStart && selectedStop && filteredRoutes.length === 1 ? filteredRoutes[0] : null

  const handleStartChange = (e) => {
    setSelectedStart(e.target.value)
    // Reset stop if it's no longer valid
    if (e.target.value) {
      const validStops = getStopsForStart(e.target.value)
      if (selectedStop && !validStops.includes(selectedStop)) {
        setSelectedStop('')
      }
    }
  }

  const handleStopChange = (e) => {
    setSelectedStop(e.target.value)
    if (e.target.value) {
      const validStarts = getStartsForStop(e.target.value)
      if (selectedStart && !validStarts.includes(selectedStart)) {
        setSelectedStart('')
      }
    }
  }

  const heroRef = useRef(null)

  const scrollToNext = () => {
    const next = heroRef.current?.nextElementSibling
    if (next) next.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToRoutes = (e) => {
    e.preventDefault()
    document.getElementById('routes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section ref={heroRef} className="fullscreen coverme hero--compact" style={{ backgroundImage: `url(${asset('/images/files/taxi-service.jpg')})` }}>
        <div className="arrow-down taxi-arrow" onClick={scrollToNext} role="button" aria-label={t('a11y.scrollDown')}></div>
      </section>

      <section className="taxi-items">
        <div>
          <FadeUp>
            {/* The page's main heading. The hero above is a bare background
                image with no text, so this was the only candidate — it was an
                h2, leaving the page with no h1 at all. Styled to render exactly
                as it did (see `.taxi-items h1` in styles.css). */}
            <h1>{t('shuttle.title')}</h1>
          </FadeUp>
          <p>{autolinkNodes(t('shuttle.description'), lang, pages)}</p>
          {/* The hero carries no text at all, so the first screen said nothing
              about what this page is for. This sends a visitor straight to the
              thing they came for instead of past the description first. */}
          <p className="taxi-cta-row">
            <a href="#routes" className="taxi-cta" onClick={scrollToRoutes}>
              {t('shuttle.checkRoutes')}
            </a>
          </p>
        </div>
      </section>

      <section className="taxi-items" id="routes">
        <FadeUp>
          <h2>{t('shuttle.calculate')}</h2>
        </FadeUp>
        <div className="taxi-trip-selector">
          <FadeUp>
            {/* Both selects used to be named only by their own placeholder
                option, which assistive tech reads as the current value rather
                than as a name for the control. Real labels, associated by id. */}
            <div className="filter-container">
              <div className="filter-field">
                <label htmlFor="shuttle-from">{t('shuttle.fromHeader')}</label>
                <select id="shuttle-from" name="from" value={selectedStart} onChange={handleStartChange}>
                  <option value="">{t('shuttle.from')}</option>
                  {availableStarts.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div className="filter-field">
                <label htmlFor="shuttle-to">{t('shuttle.toHeader')}</label>
                <select id="shuttle-to" name="to" value={selectedStop} onChange={handleStopChange}>
                  <option value="">{t('shuttle.to')}</option>
                  {availableStops.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </FadeUp>
        </div>

        <FadeUp>
          {/* data-label on every cell is what lets the <=600px stylesheet turn
              each row into a labelled card instead of six 12px columns. The
              header row's `display: contents` moved from an inline style into
              .taxi-list-head so that stylesheet can hide it. */}
          <div className="taxi-list">
            <div className="taxi-list-row taxi-list-head">
              <div className="taxi-list-row-from">{t('shuttle.fromHeader')}</div>
              <div className="taxi-list-row-to">{t('shuttle.toHeader')}</div>
              <div className="taxi-list-row-duration">{t('shuttle.duration')}</div>
              <div className="taxi-list-row-sedan">{t('shuttle.sedan')}<span className="no-mobile"> {t('shuttle.sedanDetails')}</span></div>
              <div className="taxi-list-row-minivan">{t('shuttle.minivan')}<span className="no-mobile"> {t('shuttle.minivanDetails')}</span></div>
              <div className="taxi-list-row-minibus">{t('shuttle.minibus')}<span className="no-mobile"> {t('shuttle.minibusDetails')}</span></div>
            </div>

            {filteredRoutes.map((route, i) => (
              <div
                key={`${route.start}-${route.stop}-${i}`}
                className="taxi-list-row active"
              >
                <div className="taxi-list-row-from" data-label={t('shuttle.fromHeader')}>{route.start}</div>
                <div className="taxi-list-row-to" data-label={t('shuttle.toHeader')}>{route.stop}</div>
                <div className="taxi-list-row-duration" data-label={t('shuttle.duration')}>{route.duration}</div>
                <div className="taxi-list-row-sedan" data-label={`${t('shuttle.sedan')} ${t('shuttle.sedanDetails')}`}>€ {route.sedan}</div>
                <div className="taxi-list-row-minivan" data-label={`${t('shuttle.minivan')} ${t('shuttle.minivanDetails')}`}>€ {route.minivan}</div>
                <div className="taxi-list-row-minibus" data-label={`${t('shuttle.minibus')} ${t('shuttle.minibusDetails')}`}>€ {route.minibus}</div>
              </div>
            ))}

            {filteredRoutes.length === 0 && (selectedStart || selectedStop) && (
              <div className="taxi-list-row active taxi-list-empty">
                <div className="taxi-list-row-from">
                  {t('shuttle.noRoutes')}
                </div>
              </div>
            )}
          </div>
        </FadeUp>

        {/* Choosing a route used to be the end of the page: prices, and nothing
            to do with them. The enquiry link carries the two place names only —
            the contact page re-checks them against this same route list before
            it writes anything into the form, and nothing is ever sent on its
            own; the visitor still fills in and submits the form. */}
        {chosenRoute && (
          <FadeUp>
            <p className="taxi-cta-row">
              <LocaleLink
                className="taxi-cta"
                to={`/contact?from=${encodeURIComponent(chosenRoute.start)}&to=${encodeURIComponent(chosenRoute.stop)}`}
              >
                {t('shuttle.requestTransfer')}
              </LocaleLink>
            </p>
          </FadeUp>
        )}
      </section>
    </>
  )
}
