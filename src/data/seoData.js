// Runtime SEO lookup.
//
// The authoring data lives in seoData.source.js — 1.16 MB covering all seven
// locales — and used to be imported directly here, so every visitor downloaded
// every language's titles and descriptions to render one page in one language.
//
// scripts/generate-seo-locales.js splits that source into src/data/seo/<lang>.json
// (~166 kB each, with English already folded in as the per-key fallback, so the
// lookup below needs no fallback logic of its own). I18nProvider loads the file
// for the active locale and calls registerSEO() before it renders any children,
// which is what makes the synchronous getSEO() calls in ~28 components safe.
//
// The store is keyed by language rather than holding a single "current" table:
// during a language switch React can still be rendering the previous locale, and
// those components pass their own lang, so they keep getting the right data.

const store = {}

/** Install the SEO table for a locale. Called by I18nProvider on load. */
export function registerSEO(lang, table) {
  store[lang] = table
}

export function getSEO(pageKey, lang = 'en') {
  const table = store[lang] || store.en
  const entry = table && table[pageKey]
  if (!entry) return { title: 'Hikasus Travel', description: '' }
  return entry
}

/**
 * Whether an authored SEO entry exists for this key. Lets a card fallback tell
 * a real per-language title apart from the brand-name placeholder getSEO()
 * returns for a key that has not been written yet — a scaffolded destination
 * pre-assigns its seoKey before its entry exists.
 */
export function hasSEO(pageKey, lang = 'en') {
  const table = store[lang] || store.en
  return !!(table && table[pageKey])
}

// Derive a clean, translated card title from a per-language SEO title, e.g.
// "Festung Ujarma: königliche Hochburg …" -> "Festung Ujarma" and
// "Forteresse d'Ujarma : bastion …" -> "Forteresse d'Ujarma". Cuts at the first
// tagline / locator separator so marketing and ", City"/", Country" suffixes drop off.
export const seoCardName = (title) => (title || '').split(/[|:]/)[0].split(',')[0].trim()
