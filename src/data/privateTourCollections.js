// The eight Private Tours collection pages at /:lang/private-tours/<slug>.
//
// Two kinds, both driven by the taxonomy in tourCategories.js so the chips on
// /private-tours and the landing pages they open share one source of truth:
//   - origin   : the tour's DEFINED starting point (Tbilisi / Kutaisi)
//   - category : what kind of trip it is (a tour may be in several)
//
// These are collection pages. They link to the existing canonical tour URLs and
// never duplicate a tour record.
//
// NOTE: explicit .js extensions — this module is dynamically imported by the
// Node build scripts (prerender.js / generate-sitemap.js), where extensionless
// ESM specifiers do not resolve. Vite resolves the extension too.
import { tours } from './tours.js'
import {
  CATEGORY_IDS,
  CATEGORY_LABEL_KEYS,
  ORIGIN_IDS,
  ORIGIN_LABEL_KEYS,
  PRIVATE_TOUR_CATEGORIES,
  PRIVATE_TOUR_ORIGINS,
} from './tourCategories.js'

// Public URL slug per collection id. Kept identical across locales, matching the
// site's existing convention (only the /:lang prefix changes).
export const COLLECTION_SLUGS = {
  tbilisi: 'tours-from-tbilisi',
  kutaisi: 'tours-from-kutaisi',
  'cultural-heritage': 'cultural-heritage-tours',
  'wine-food': 'wine-food-tours',
  'adventure-hiking': 'adventure-hiking-tours',
  'nature-mountain': 'nature-mountain-tours',
  'black-sea': 'black-sea-tours',
  'winter-tours': 'winter-tours',
}

const privateTours = tours.filter((t) => t.type === 'private')

const build = (kind, id, labelKey) => {
  const slug = COLLECTION_SLUGS[id]
  const tourSlugs = privateTours
    .filter((t) => (kind === 'origin'
      ? PRIVATE_TOUR_ORIGINS[t.slug] === id
      : (PRIVATE_TOUR_CATEGORIES[t.slug] || []).includes(id)))
    .map((t) => t.slug)
  return {
    kind,
    id,
    slug,
    labelKey,
    path: `private-tours/${slug}`,
    // ui.json keys for the page's own copy.
    h1Key: `ptc.${slug}.h1`,
    titleKey: `ptc.${slug}.title`,
    descriptionKey: `ptc.${slug}.description`,
    introKey: `ptc.${slug}.intro`,
    tourSlugs,
  }
}

/** All eight collections, origins first, then categories — the chip order. */
export const privateTourCollections = [
  ...ORIGIN_IDS.map((id) => build('origin', id, ORIGIN_LABEL_KEYS[id])),
  ...CATEGORY_IDS.map((id) => build('category', id, CATEGORY_LABEL_KEYS[id])),
]

/** Only collections that actually have tours ever become a page. */
export const privateTourCollectionPages = privateTourCollections.filter((c) => c.tourSlugs.length > 0)

const BY_SLUG = {}
for (const c of privateTourCollectionPages) BY_SLUG[c.slug] = c

/** Reverse lookup for the route: `wine-food-tours` -> collection (or null). */
export function getPrivateTourCollection(slug) {
  return BY_SLUG[slug] || null
}

/** The tour objects for a collection, in the catalogue's own order. */
export function toursForCollection(collection) {
  if (!collection) return []
  const wanted = new Set(collection.tourSlugs)
  return privateTours.filter((t) => wanted.has(t.slug))
}
