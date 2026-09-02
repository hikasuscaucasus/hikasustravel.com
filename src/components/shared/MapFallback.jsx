import useT from '../../i18n/useT'
import LocaleLink from '../../i18n/LocaleLink'

/**
 * Shown in the map's own slot whenever the interactive map cannot run — no
 * WebGL, a missing token, or a Mapbox failure at any point after mount. It is
 * plain HTML: nothing here needs WebGL, a canvas, or the mapbox chunk, so it
 * still renders on the machines that made the map fail in the first place.
 *
 * It deliberately shows no geography. The project has no general Georgia map
 * asset (the only static maps are per-tour route maps), and drawing the wrong
 * country outline would be worse than drawing none — so the slot falls back to
 * the information the map was there to offer: where you can go.
 */
export default function MapFallback({ className = 'page-map' }) {
  const t = useT()

  return (
    <div className={`${className} map-fallback`} role="note">
      <div className="map-fallback__inner">
        <p className="map-fallback__text">{t('map.unavailable')}</p>
        <LocaleLink to="/georgia/places-to-visit/" className="map-fallback__link">
          {t('nav.placesToVisit')}
        </LocaleLink>
      </div>
    </div>
  )
}
