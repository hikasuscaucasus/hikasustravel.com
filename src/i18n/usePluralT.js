import { useContext } from 'react'
import { I18nContext } from './I18nContext'
import useLang from './useLang'

// Resolves `${baseKey}.${category}` where `category` is the CLDR plural
// category Intl.PluralRules picks for `n` in the current locale (one/few/
// many/other — exactly what English "1 tour" vs "19 tours" needs, and what
// Czech/Polish need their extra `few`/`many` forms for). Falls back to
// `${baseKey}.other` when the locale doesn't define that specific category
// (e.g. en/de/fr/es/nl only ever produce "one" or "other"), then to the raw
// key if even that is missing. `{n}` in the resolved string is replaced with
// the count, same placeholder syntax useT() already uses everywhere else.
export default function usePluralT() {
  const { translations } = useContext(I18nContext)
  const { lang } = useLang()

  return function tCount(baseKey, n) {
    let category = 'other'
    try {
      category = new Intl.PluralRules(lang).select(n)
    } catch {
      // Intl.PluralRules always exists in modern Node/browsers; this guard is
      // only for exotic environments and keeps the fallback string working.
    }
    const value = translations[`${baseKey}.${category}`]
      ?? translations[`${baseKey}.other`]
      ?? baseKey
    return value.split('{n}').join(n)
  }
}
