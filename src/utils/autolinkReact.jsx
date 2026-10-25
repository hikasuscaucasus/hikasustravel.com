/**
 * React helpers around the entity auto-linker (src/utils/autolink.js).
 *
 * - useLinkedHtml / useLinkedFaq: memoized wrappers for HTML content rendered
 *   via dangerouslySetInnerHTML (info pages, blog, tour itinerary/FAQ).
 * - autolinkNodes: links entity mentions inside a PLAIN-TEXT string and returns
 *   React children (string + <a> nodes), for content rendered directly in JSX
 *   (e.g. a tour's overview paragraph and highlight bullets) where there is no
 *   HTML string to feed the DOM-based linker.
 */
import { createElement, useContext, useMemo } from 'react'
import { I18nContext } from '../i18n/I18nContext'
import useLang from '../i18n/useLang'
import { autolinkHtml, getIndex, countryContext, resolveEntity } from './autolink'

export function useLinkedHtml(html, excludeKey) {
  const { pages } = useContext(I18nContext)
  const { lang } = useLang()
  return useMemo(() => autolinkHtml(html, lang, pages, excludeKey), [html, lang, pages, excludeKey])
}

export function useLinkedFaq(items, excludeKey) {
  const { pages } = useContext(I18nContext)
  const { lang } = useLang()
  return useMemo(
    () => (items || []).map((it) => ({ ...it, content: autolinkHtml(it.content, lang, pages, excludeKey) })),
    [items, lang, pages, excludeKey],
  )
}

/**
 * Link entity mentions in a plain-text string -> array of React children.
 * Returns the original string unchanged when there is nothing to link, so it is
 * safe to drop into JSX as `{autolinkNodes(text, lang, pages)}`.
 */
export function autolinkNodes(text, lang, pages, excludeKey) {
  if (!text || typeof text !== 'string') return text
  const { byName, regex } = getIndex(lang, pages)
  if (!regex) return text
  // Country context for contextual names, from this string's own mentions.
  regex.lastIndex = 0
  const seen = []
  let pm
  while ((pm = regex.exec(text))) {
    const pe = byName.get(pm[0].toLowerCase())
    if (pe && !pe.contextual) seen.push(pe)
  }
  const ctx = countryContext(seen)
  regex.lastIndex = 0
  const out = []
  let last = 0
  let m
  let i = 0
  while ((m = regex.exec(text))) {
    const ent = resolveEntity(byName.get(m[0].toLowerCase()) || { contextual: {} }, ctx)
    if (!ent || ent.key === excludeKey) continue
    if (m.index > last) out.push(text.slice(last, m.index))
    out.push(
      createElement(
        'a',
        { key: i++, href: `/${lang}${ent.url}`, 'data-internal': ent.url, className: 'entity-link' },
        m[0],
      ),
    )
    last = m.index + m[0].length
  }
  if (out.length === 0) return text
  if (last < text.length) out.push(text.slice(last))
  return out
}
