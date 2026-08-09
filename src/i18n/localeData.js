import { defaultLang } from './languages'
import { registerSEO } from '../data/seoData'

/**
 * Locale copy loading, split out of I18nProvider.jsx so that both entry points
 * can fill the cache *before* the first render:
 *   - src/entry-server.jsx awaits it so the build-time render has the copy,
 *   - src/main.jsx awaits it so hydration's first render produces the same
 *     markup the build wrote.
 * Without a warm cache the provider bails out at `return null` and hydration
 * would find an empty tree where the static HTML has a full page.
 */

const translationCache = {}

export function getCachedLocale(lang) {
  return translationCache[lang]
}

export async function loadLocale(lang) {
  if (translationCache[lang]) return translationCache[lang]

  // `en-fallback.json` carries only what a translated locale actually needs from
  // English — the keys it has no translation for, plus the destination-hub keys
  // whose English item names are used as a per-card fallback. English itself
  // needs none of it: its own pages.json already is the fallback. See
  // scripts/generate-en-fallback.js.
  const [ui, pages, faq, enFallback, seo] = await Promise.all([
    import(`./locales/${lang}/ui.json`),
    import(`./locales/${lang}/pages.json`),
    import(`./locales/${lang}/faq.json`),
    lang === defaultLang ? null : import('./locales/en-fallback.json'),
    // Per-locale page metadata, split out of the 1.16 MB seoData source so a
    // visitor downloads only their own language. Registered on the module
    // before this promise resolves, so the synchronous getSEO() calls in the
    // page components (and in the search index) always find their table.
    import(`../data/seo/${lang}.json`),
  ])

  registerSEO(lang, seo.default)

  const result = {
    ui: ui.default,
    pages: pages.default,
    faq: faq.default,
    enPages: enFallback ? enFallback.default : pages.default,
  }
  translationCache[lang] = result
  return result
}

const tourCache = {}

export function getCachedTours(lang) {
  return tourCache[lang]
}

/**
 * Translated tour copy — titles, summaries and itineraries for the tour hubs,
 * tour detail pages, the "<Entity> Tours" listings and the home page's cards.
 *
 * Loaded up front by both entries for the same reason as the page copy: without
 * it the build-time render writes the English titles into a translated page.
 */
export async function loadTours(lang) {
  if (tourCache[lang]) return tourCache[lang]

  // `hotels.json` carries the translated hotel copy shown in the accommodation
  // modal (description, amenity labels, location highlights, image alt text).
  // English reads straight from hotelData.js, so it has no file of its own; a
  // locale that has not been translated yet simply falls back to English.
  const [tours, hotels] = await Promise.all([
    import(`./locales/${lang}/tours.json`),
    lang === defaultLang
      ? null
      : import(`./locales/${lang}/hotels.json`).catch(() => null),
  ])

  const result = { tours: tours.default, hotels: hotels ? hotels.default : null }
  tourCache[lang] = result
  return result
}
