/**
 * The browser half of the `@dom` alias (see vite.config.js). Hands back the
 * platform's own DOM parser; the build-time half is src/ssr/dom.ssr.js.
 *
 * The indirection exists so src/utils/autolink.js can parse content HTML in both
 * places. It used to bail out when `window` was absent, which meant the
 * prerendered HTML had no entity links while the browser added them on its first
 * render — a hydration mismatch React does not patch up for
 * dangerouslySetInnerHTML, so the links were silently thrown away.
 */
export function domApi() {
  if (typeof DOMParser === 'undefined' || typeof NodeFilter === 'undefined') return null
  return { DOMParser, SHOW_TEXT: NodeFilter.SHOW_TEXT }
}
