// Duration bands for a long private-tour listing. Moved out of the old
// /private-tours page (which listed every Georgia tour this way) so the
// country hubs can group a long list identically.
//
// Winter/ski tours are pulled out of the day-range bands entirely and shown
// only in their own band, even though their day count would otherwise place
// them in "Classic routes" or "Grand tours" too.
import { PRIVATE_TOUR_CATEGORIES } from './tourCategories.js'

export const DURATION_BANDS = [
  { key: 'short', labelKey: 'tour.bandShort', min: 3, max: 5 },
  { key: 'classic', labelKey: 'tour.bandClassic', min: 6, max: 9 },
  { key: 'grand', labelKey: 'tour.bandGrand', min: 10, max: 20 },
]

export const isWinterTour = (tour) => (PRIVATE_TOUR_CATEGORIES[tour.slug] || []).includes('winter-tours')

/** [{ key, labelKey, tours }] — only bands that have at least one tour. */
export function groupToursByDuration(list) {
  const winter = list.filter(isWinterTour).sort((a, b) => a.days - b.days)
  const rest = list.filter((tour) => !isWinterTour(tour))
  const result = DURATION_BANDS.map((band) => ({
    ...band,
    tours: rest.filter((tour) => tour.days >= band.min && tour.days <= band.max).sort((a, b) => a.days - b.days),
  }))
  result.push({ key: 'winter', labelKey: 'tour.bandWinter', tours: winter })
  return result.filter((band) => band.tours.length > 0)
}
