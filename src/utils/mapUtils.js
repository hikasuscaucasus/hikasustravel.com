import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const MAP_STYLE = 'mapbox://styles/matthekim/cm9u0hfgr001001s941ym33e3'

/**
 * Can this browser actually run the interactive map?
 *
 * `new mapboxgl.Map()` throws `Failed to initialize WebGL` when the browser
 * has no working WebGL context — an old device, a locked-down build, a driver
 * blocklist, or a browser where the user has turned hardware acceleration off.
 * The throw happens inside our useEffect, where React treats it as a render
 * error and unmounts the whole tree, so the check has to come first.
 *
 * `mapboxgl.supported()` is the library's own probe (it builds a throwaway
 * context and reports the answer). It is wrapped because the probe itself can
 * throw on hostile browsers, and because the SSR stub does not define it.
 * A missing access token counts as unsupported too: the map would mount and
 * then fail every tile request, which looks worse than no map at all.
 */
export function isMapSupported() {
  if (typeof window === 'undefined') return false
  if (!mapboxgl.accessToken) return false
  try {
    return typeof mapboxgl.supported === 'function' ? mapboxgl.supported() : true
  } catch {
    return false
  }
}

export function initializeMap(containerId, coordinates, zoom) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const map = new mapboxgl.Map({
    container: containerId,
    style: MAP_STYLE,
    center: coordinates,
    zoom: zoom,
    dragPan: !isTouchDevice,
    cooperativeGestures: isTouchDevice,
  })
  map.addControl(new mapboxgl.NavigationControl())
  map.touchZoomRotate.disable()
  map.scrollZoom.disable()
  return map
}

export function initializeTourMap(containerId, lat, lng, zoom) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const map = new mapboxgl.Map({
    container: containerId,
    style: MAP_STYLE,
    center: [lng, lat],
    zoom: zoom,
    scrollZoom: false,
    dragPan: true,
    dragRotate: false,
    doubleClickZoom: false,
    touchZoomRotate: true,
    touchPitch: false,
    cooperativeGestures: isTouchDevice,
  })
  map.addControl(new mapboxgl.NavigationControl())
  // Enable two-finger pinch zoom on touch devices, but keep the map's
  // fixed 2D orientation (no two-finger rotate). cooperativeGestures still
  // lets a single finger scroll the page, so the page won't zoom on pinch.
  map.touchZoomRotate.disableRotation()
  return map
}

export function addCustomMarker(map, coordinates, svgUrl, width, height, offsetX = 0, offsetY = 0) {
  const markerElement = document.createElement('div')
  const img = document.createElement('img')
  img.src = svgUrl
  img.style.width = `${width}px`
  img.style.height = `${height}px`
  img.style.display = 'block'
  markerElement.appendChild(img)

  const marker = new mapboxgl.Marker({
    element: markerElement,
    anchor: 'bottom',
    offset: [offsetX, offsetY],
  })
    .setLngLat(coordinates)
    .addTo(map)

  return marker
}

// Adds always-visible destination name labels as a Mapbox symbol layer.
// Symbol text has built-in collision detection, so labels automatically
// de-clutter (a readable subset shows; more appear as you zoom in) and
// never pile up on top of each other. Brand styling: deep-green text with
// a soft cream halo. Only markers that have a title are labelled, so maps
// without destination titles (e.g. the homepage) are unaffected.
export function addDestinationLabels(map, markers) {
  const labeled = (markers || []).filter((m) => m && m.title && m.coordinates)
  if (labeled.length === 0) return

  const data = {
    type: 'FeatureCollection',
    features: labeled.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: m.coordinates },
      properties: { title: m.title },
    })),
  }

  const addLabelLayer = () => {
    if (map.getSource('destination-labels')) return
    map.addSource('destination-labels', { type: 'geojson', data })
    map.addLayer({
      id: 'destination-labels-layer',
      type: 'symbol',
      source: 'destination-labels',
      layout: {
        'text-field': ['get', 'title'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 6, 11, 9, 13, 12, 15],
        'text-anchor': 'top',
        'text-offset': [0, 0.7],
        'text-max-width': 9,
        'text-allow-overlap': false,
        'text-padding': 4,
      },
      paint: {
        'text-color': '#2b4e47',
        'text-halo-color': '#f7f0e6',
        'text-halo-width': 1.6,
        'text-halo-blur': 0.3,
      },
    })
  }

  if (map.isStyleLoaded()) addLabelLayer()
  else map.on('load', addLabelLayer)
}

export function addCustomMarkerWithPopup(map, coordinates, svgUrl, width, height, offsetX, offsetY, popupTitle, popupText) {
  const markerElement = document.createElement('div')
  const img = document.createElement('img')
  img.src = svgUrl
  img.style.width = `${width}px`
  img.style.height = `${height}px`
  img.style.display = 'block'
  img.style.cursor = 'pointer'
  markerElement.appendChild(img)

  const marker = new mapboxgl.Marker({
    element: markerElement,
    anchor: 'bottom',
    offset: [offsetX, offsetY],
  })
    .setLngLat(coordinates)
    .addTo(map)

  const popup = new mapboxgl.Popup({
    offset: 25,
    closeButton: true,
    closeOnClick: true,
    maxWidth: '300px',
  }).setHTML(`
    <div style="font-family: inherit;">
      <h3 style="margin: 0 0 8px 0; padding: 0; font-size: 16px; font-weight: bold; line-height: 1.2;">${popupTitle}</h3>
      <p style="margin: 0; padding: 0; font-size: 14px; line-height: 1.4;">${popupText}</p>
    </div>
  `)

  marker.setPopup(popup)
  return marker
}

export function catmullRomSpline(points, segments = 50) {
  let curve = []

  function interpolate(p0, p1, p2, p3, t) {
    const t2 = t * t
    const t3 = t2 * t
    return [
      0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
    ]
  }

  const extendedPoints = [points[0], ...points, points[points.length - 1]]
  for (let i = 1; i < extendedPoints.length - 2; i++) {
    for (let t = 0; t < 1; t += 1 / segments) {
      curve.push(interpolate(extendedPoints[i - 1], extendedPoints[i], extendedPoints[i + 1], extendedPoints[i + 2], t))
    }
  }
  return curve
}

export function addSmoothCurve(map, coordinates) {
  const smoothPoints = catmullRomSpline(coordinates, 100)

  map.on('load', function () {
    if (!map.getSource('smooth-curve')) {
      map.addSource('smooth-curve', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: smoothPoints } }],
        },
      })
      // Soft cream casing beneath the route so the line stays crisp and
      // readable against any map background (premium, subtle halo).
      map.addLayer({
        id: 'smooth-curve-casing',
        type: 'line',
        source: 'smooth-curve',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#f7f0e6', 'line-width': 8, 'line-opacity': 0.9 },
      })
      // Main route line in the brand deep green for clear, elegant contrast.
      map.addLayer({
        id: 'smooth-curve-layer',
        type: 'line',
        source: 'smooth-curve',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#2b4e47', 'line-width': 4.5, 'line-opacity': 0.95 },
      })
    }
  })
}

export function addLineBetweenCoordinates(map, coordinates) {
  map.on('load', function () {
    const lineData = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates } }],
    }
    if (!map.getSource('line-source')) {
      map.addSource('line-source', { type: 'geojson', data: lineData })
      map.addLayer({
        id: 'line-layer',
        type: 'line',
        source: 'line-source',
        paint: { 'line-color': '#2b4e47', 'line-width': 4, 'line-opacity': 0.85 },
      })
    }
  })
}

export function addGeorgiaBorders(map) {
  map.on('load', () => {
    map.addSource('country-boundaries', {
      type: 'vector',
      url: 'mapbox://mapbox.country-boundaries-v1',
    })
    map.addLayer({
      id: 'georgia-border',
      type: 'line',
      source: 'country-boundaries',
      'source-layer': 'country_boundaries',
      filter: ['==', 'iso_3166_1_alpha_3', 'GEO'],
      paint: { 'line-color': '#2B4E47', 'line-width': 3, 'line-opacity': 1, 'line-blur': 0 },
    })
    map.addLayer({
      id: 'georgia-fill',
      type: 'fill',
      source: 'country-boundaries',
      'source-layer': 'country_boundaries',
      filter: ['==', 'iso_3166_1_alpha_3', 'GEO'],
      paint: { 'fill-color': '#FFFFFF', 'fill-opacity': 0 },
    })
  })
}
