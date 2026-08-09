import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { langCodes, defaultLang } from './languages'
import { I18nContext } from './I18nContext'
import { getCachedLocale, getCachedTours, loadLocale, loadTours } from './localeData'

export default function I18nProvider({ children }) {
  const { lang: paramLang } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const lang = langCodes.includes(paramLang) ? paramLang : defaultLang

  const [loaded, setLoaded] = useState(null)
  // Prefer the module cache over state, so a locale that is already loaded is
  // used on the very first render rather than one effect later. This is what
  // lets the build-time render emit real content instead of null, and what keeps
  // hydration's first render identical to the HTML the build wrote.
  //
  // Falling back to `loaded` (rather than to null) preserves the old behaviour
  // during a switch to a not-yet-loaded language: the previous language's copy
  // stays on screen while the new one downloads, instead of blanking the page.
  const data = getCachedLocale(lang) || loaded
  // Store the loaded tour translations together with the language they belong to,
  // so a language change drops stale translations during render (no reset effect).
  const [tourState, setTourState] = useState({ lang: null, tours: null, hotels: null })
  // Same cache-first rule as the page copy above, so a warm locale's tour titles
  // are translated on the first render — otherwise the build would write the
  // English titles into a translated page.
  const cachedTours = getCachedTours(lang)
  const tourTranslations = cachedTours ? cachedTours.tours : (tourState.lang === lang ? tourState.tours : null)
  const hotelTranslations = cachedTours ? cachedTours.hotels : (tourState.lang === lang ? tourState.hotels : null)

  useEffect(() => {
    // Already cached — the render above used it, so there is nothing to fetch
    // and no state to set.
    if (getCachedLocale(lang)) return
    let cancelled = false
    loadLocale(lang).then((d) => { if (!cancelled) setLoaded(d) })
    return () => { cancelled = true }
  }, [lang])

  const setLang = useCallback((newLang) => {
    if (!langCodes.includes(newLang)) return
    const rest = location.pathname.replace(/^\/[a-z]{2}/, '')
    navigate(`/${newLang}${rest}${location.search}${location.hash}`)
  }, [location, navigate])

  const loadTourTranslations = useCallback(() => {
    return loadTours(lang).then(({ tours, hotels }) => {
      setTourState({ lang, tours, hotels })
      return tours
    })
  }, [lang])

  const translations = useMemo(() => (data ? data.ui : {}), [data])
  const pages = useMemo(() => (data ? data.pages : {}), [data])
  const faq = useMemo(() => (data ? data.faq : []), [data])
  const enPages = useMemo(() => (data ? data.enPages : {}), [data])

  const value = useMemo(() => ({
    lang,
    setLang,
    translations,
    pages,
    faq,
    enPages,
    tourTranslations,
    hotelTranslations,
    loadTourTranslations,
  }), [lang, setLang, translations, pages, faq, enPages, tourTranslations, hotelTranslations, loadTourTranslations])

  if (!data) return null

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}
