import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { AppRoutes } from './App'
import { preloadRouteComponents } from './routeComponents'
import { loadLocale, loadTours } from './i18n/localeData'

/**
 * Build-time renderer. scripts/prerender.js imports this from the SSR bundle and
 * calls it once per route, then drops the markup inside #root.
 *
 * It renders the same <AppRoutes> tree the browser mounts — only the router
 * differs (StaticRouter here, BrowserRouter in src/main.jsx) — so the static
 * HTML and the hydrated DOM come from one source of truth.
 */

/**
 * Load everything the render needs synchronously: the locale copy (I18nProvider
 * renders null without it) and every route chunk (see src/routeComponents.js).
 * Both are cached, so this is only real work the first time a language appears.
 */
export async function prepareLocale(lang) {
  await Promise.all([loadLocale(lang), loadTours(lang), preloadRouteComponents()])
}

// Signs that a Suspense boundary did not complete during the render:
//   <!--$?-->, <template id="B:…">, <div hidden id="S:…">  streamed out of order
//   <!--$!-->                                              rendered its fallback
// Either way the real content is missing from the static HTML, and on the
// errored form the browser also throws React #419 while hydrating. Nothing
// should suspend once prepareLocale() has run, so treat these as hard failures
// rather than letting a half-rendered page ship.
const UNRESOLVED_BOUNDARY = /<template id="[BS]:|<!--\$\?-->|<!--\$!-->|<div hidden id="S:/

/**
 * Render one route to an HTML string.
 *
 * renderToString (not renderToPipeableStream) because this is a static build,
 * not a stream: it is synchronous and emits every element inline, in document
 * order. The streaming renderer moves a Suspense boundary's content to the end
 * of the document whenever it did not complete along with the shell, which it
 * did on real pages here even with every chunk preloaded.
 */
export function renderPage(url) {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
  )

  if (UNRESOLVED_BOUNDARY.test(html)) {
    throw new Error(
      `SSR left a Suspense boundary unresolved for ${url}. Something in the tree ` +
      'suspended, so its content is missing from the static HTML. Hold it back ' +
      'until after hydration with useIsHydrated, or preload it in prepareLocale.',
    )
  }
  return html
}
