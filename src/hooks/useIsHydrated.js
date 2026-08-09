import { useSyncExternalStore } from 'react'

// Nothing to subscribe to — this flips once, when React takes over the DOM.
const subscribe = () => () => {}
const onClient = () => true
const onServer = () => false

/**
 * False during the build-time render and during the browser's first (hydrating)
 * render; true from the render immediately after that.
 *
 * Use it to hold back anything that cannot exist in the static HTML — a
 * lazily-loaded widget, a value read from the browser — so that the markup the
 * build wrote and the markup hydration produces are the same. React is built for
 * this: it uses the server snapshot for the hydrating render, then re-renders
 * with the client one, which is why this does not cause a mismatch the way
 * reading the value during render would.
 */
export default function useIsHydrated() {
  return useSyncExternalStore(subscribe, onClient, onServer)
}
