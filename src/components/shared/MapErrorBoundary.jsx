import { Component } from 'react'
import MapFallback from './MapFallback'

/**
 * Scoped boundary around the map slot only.
 *
 * Without it, a throw from the map — `Failed to initialize WebGL` is the one
 * that reached production — propagates out of the lazy chunk and React unmounts
 * the whole tree: header, page, forms and footer all replaced by bare page
 * ground. The boundary stops the unmount at the edge of the map's own section,
 * so a browser that cannot draw a map still gets the entire site.
 *
 * MapboxMap catches its own initialisation failure and swaps in the same
 * fallback; this is the net for everything it cannot catch — a render-phase
 * throw, or a failure inside the lazily imported module itself.
 */
export default class MapErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // Console only: the visitor gets the fallback, never the error text.
    if (import.meta.env.DEV) console.error('Map failed to render:', error)
  }

  render() {
    if (this.state.failed) {
      return (
        <section>
          <MapFallback className={this.props.className} />
        </section>
      )
    }
    return this.props.children
  }
}
