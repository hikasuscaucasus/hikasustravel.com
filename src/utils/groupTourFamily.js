import { tours } from '../data/tours'

// Helpers for the scheduled group tours that share one departure calendar
// (`departureFamily` on the tour record, see src/data/groupDepartures.js).
// Plain functions, kept out of the component files so React fast refresh can
// treat those as component-only modules.

const COUNTRY_KEYS = {
  azerbaijan: 'nav.destinations.azerbaijan',
  georgia: 'nav.destinations.georgia',
  armenia: 'nav.destinations.armenia',
}

/** "Azerbaijan · Georgia · Armenia" in the page language, from `areaServed`. */
export function countryLabels(tour, t) {
  return (tour.areaServed || [])
    .map((c) => (COUNTRY_KEYS[c.toLowerCase()] ? t(COUNTRY_KEYS[c.toLowerCase()]) : c))
    .join(' · ')
}

/** Every group tour on the same departure calendar as `tour`, longest first. */
export function familyOf(tour) {
  if (!tour?.departureFamily) return []
  return tours
    .filter((x) => x.type === 'group' && x.departureFamily === tour.departureFamily)
    .sort((a, b) => (b.days || 0) - (a.days || 0))
}
