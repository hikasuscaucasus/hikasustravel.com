/**
 * Stand-in for mapbox-gl during the build-time (SSR) render only — wired up by
 * the `isSsrBuild` alias in vite.config.js. The real library touches window at
 * import time and would crash Node.
 *
 * Nothing here is ever called: MapboxMap builds the map inside a useEffect, so
 * the build-time render only produces its wrapper <section><div/></section> —
 * byte-identical to the browser's first render, which is what hydration needs.
 * src/utils/mapUtils.js does assign `mapboxgl.accessToken` at module scope, so
 * the default export has to be a real object.
 */
const stub = {
  accessToken: '',
  Map: class { },
  NavigationControl: class { },
  Marker: class { },
  Popup: class { },
  LngLatBounds: class { },
}

export default stub
export const { Map, NavigationControl, Marker, Popup, LngLatBounds } = stub
