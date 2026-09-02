import { useEffect, useRef, useState } from 'react'
// Moved here from main.jsx: as part of this lazily-loaded chunk, the stylesheet
// is fetched only by pages that actually render a map.
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  isMapSupported,
  initializeTourMap,
  initializeMap,
  addCustomMarker,
  addDestinationLabels,
  addSmoothCurve,
  addGeorgiaBorders,
} from '../../utils/mapUtils'
import asset from '../../utils/basePath'
import MapFallback from './MapFallback'

export default function MapboxMap({
  id = 'tour-map',
  center,
  zoom = 7,
  markers = [],
  routeCoordinates = [],
  showGeorgiaBorders = false,
  className = 'page-map',
  isHomePage = false,
}) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [isInteractive, setIsInteractive] = useState(isHomePage)
  // Set once the map has proved it cannot run here. Swapping in the fallback is
  // the component's job rather than the boundary's, because a failure inside
  // useEffect is recoverable: nothing else on the page is in a bad state.
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || !center) return

    // Ask before building. A browser without WebGL makes the constructor throw,
    // and a throw from an effect takes the entire React tree down with it.
    if (!isMapSupported()) {
      setFailed(true)
      return
    }

    let map
    try {
      if (isHomePage) {
        map = initializeMap(id, center, zoom)
      } else {
        map = initializeTourMap(id, center[1], center[0], zoom)
      }
      mapRef.current = map

      if (showGeorgiaBorders) {
        addGeorgiaBorders(map)
      }

      // Add markers
      markers.forEach((m) => {
        addCustomMarker(
          map,
          m.coordinates,
          asset(m.svgUrl || '/img/pennant.svg'),
          m.width || 34,
          m.height || 41,
          m.offsetX || 0,
          m.offsetY || 0
        )
      })

      // Add route
      if (routeCoordinates.length > 1) {
        addSmoothCurve(map, routeCoordinates)
      }

      // Add destination name labels (collision-managed so they don't overlap)
      addDestinationLabels(map, markers)
    } catch (err) {
      // Belt to the support check's braces: anything the probe did not predict
      // (a WebGL context that dies during setup, a style that will not build)
      // ends as a fallback in the map's own slot, never as a blank page.
      if (import.meta.env.DEV) console.error('Map failed to initialise:', err)
      if (map) {
        try { map.remove() } catch { /* already half-dead; nothing to clean up */ }
      }
      map = undefined
      mapRef.current = null
      setFailed(true)
      return
    }

    return () => {
      if (map) map.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, id])

  const handleClick = () => {
    if (!isInteractive) setIsInteractive(true)
  }

  // The wrapping <section> is kept in both branches so the slot the map lived in
  // keeps the same shape in the document either way.
  return (
    <section>
      {failed ? (
        <MapFallback className={className} />
      ) : (
        <div
          id={id}
          ref={mapContainer}
          className={`${className}${!isHomePage ? ' tour-map-container' : ''}${isInteractive ? ' map-interactive' : ''}`}
          onClick={handleClick}
          style={{ position: 'relative' }}
        />
      )}
    </section>
  )
}
