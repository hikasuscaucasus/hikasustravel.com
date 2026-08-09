import { createElement, lazy } from 'react'

/**
 * Code-splitting wrapper for the page components in App.jsx.
 *
 * In the browser this is exactly React.lazy: the route's chunk is fetched the
 * first time that route renders, which is what keeps the entry bundle small.
 *
 * At build time it is not. src/entry-server.jsx calls preloadRouteComponents()
 * first, and from then on each page renders its real component synchronously.
 * That matters because a component that suspends during the build-time render
 * makes React stream the page out of order — it writes an empty <template> where
 * the page should be and appends the real content at the end of the document,
 * to be moved into place by an inline script. That is precisely the "invisible
 * without JavaScript" problem the static render exists to solve, so the server
 * has to render without suspending at all.
 */

const preloaders = []

export function routeComponent(factory, pick = (m) => m.default) {
  const Lazy = lazy(() => factory().then((m) => ({ default: pick(m) })))
  let Resolved = null

  // Only ever invoked by preloadRouteComponents(), which the browser never
  // calls — so this closure does not drag the chunk into the entry bundle.
  preloaders.push(() => factory().then((m) => { Resolved = pick(m) }))

  return function RouteComponent(props) {
    return createElement(Resolved || Lazy, props)
  }
}

/** Resolve every route chunk up front. Build-time only — see above. */
export function preloadRouteComponents() {
  return Promise.all(preloaders.map((load) => load()))
}
