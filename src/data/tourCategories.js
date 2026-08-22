// Taxonomy for the Private Tours collection pages (/:lang/private-tours/<slug>).
//
// IMPORTANT: everything here keys off stable, language-neutral IDs and tour
// slugs — never translated labels. Visible labels are mapped per locale in each
// ui.json under the keys in CATEGORY_LABEL_KEYS / ORIGIN_LABEL_KEYS below.
//
// Categories are collection data only: they are NOT shown on tour cards.
// A tour may belong to several categories and therefore appear on several
// collection pages, always linking back to its one canonical tour URL.
//
// NOTE: explicit .js extensions on imports of this module elsewhere — it is
// dynamically imported by the Node build scripts (prerender.js /
// generate-sitemap.js), where extensionless ESM specifiers do not resolve.

// Order the category chips are shown in.
export const CATEGORY_IDS = [
  'cultural-heritage',
  'wine-food',
  'adventure-hiking',
  'nature-mountain',
  'black-sea',
  'winter-tours',
]

// Stable id -> ui.json translation key (visible label per language).
export const CATEGORY_LABEL_KEYS = {
  'cultural-heritage': 'tour.catCulturalHeritage',
  'wine-food': 'tour.catWineFood',
  'adventure-hiking': 'tour.catAdventureHiking',
  'nature-mountain': 'tour.catNatureMountain',
  'black-sea': 'tour.catBlackSea',
  'winter-tours': 'tour.catWinterTours',
}

// Starting point of each private tour. This replaces the old hardcoded
// "kutaisiSlugs, everything else is Tbilisi" pair in PrivateToursPage — the
// membership is identical, but it is now stated per tour instead of inferred
// from a complement, so a future tour that starts somewhere else cannot be
// silently filed under Tbilisi. Origins are the tour's DEFINED starting point,
// never a place that merely appears in the itinerary.
export const ORIGIN_IDS = ['tbilisi', 'kutaisi']

export const ORIGIN_LABEL_KEYS = {
  tbilisi: 'tour.originTbilisi',
  kutaisi: 'tour.originKutaisi',
}

export const PRIVATE_TOUR_ORIGINS = {
  '3-day-kakheti-wine-and-food-tour-from-tbilisi': 'tbilisi',
  '5-day-private-tour-from-tbilisi-to-batumi': 'tbilisi',
  '5-day-georgia-private-tour-tbilisi-wine-and-sulfur-baths': 'tbilisi',
  '6-day-georgia-private-tour-highlights-from-tbilisi': 'tbilisi',
  '7-day-gudauri-ski-tour-from-tbilisi': 'tbilisi',
  '7-day-georgia-cultural-tour-kutaisi-to-tbilisi': 'kutaisi',
  '8-day-georgia-private-tour-culture-nature-and-wine': 'tbilisi',
  '8-day-georgia-culture-and-adventure-tour': 'tbilisi',
  '9-day-georgia-private-tour-kutaisi-to-tbilisi': 'kutaisi',
  'georgia-grand-tour-9-days-from-tbilisi-to-batumi': 'tbilisi',
  '9-day-georgia-wine-and-adventure-tour': 'tbilisi',
  'georgia-in-10-days-where-every-corner-has-a-story-and-every-meal-is-a-celebration': 'tbilisi',
  'georgias-wonders-11-day-grand-tour-from-kutaisi-to-kazbegi-and-batumi': 'kutaisi',
  '12-day-ultimate-georgia-adventure-tour-tbilisi-kazbegi-mestia-kutaisi-batumi': 'tbilisi',
  '13-day-georgia-grand-tour-from-kutaisi-culture-and-nature': 'kutaisi',
  'ultimate-15-day-georgia-tour-from-tbilisi-to-svaneti--wine-culture-and-natural-beauty': 'tbilisi',
  '20-day-georgia-grand-tour-wine-hiking-and-culture': 'tbilisi',
}

// Per-tour category assignments, keyed by stable slug.
//
// `black-sea` replaces the old, broader `western-georgia-black-sea`. Membership
// is now "the tour actually reaches the Black Sea coast" rather than "the tour
// goes to western Georgia": the 7-day Kutaisi–Tbilisi cultural tour and the
// 9-day Kutaisi–Tbilisi tour were dropped (neither reaches the coast), and the
// tours that do spend nights in Batumi were added. Every other assignment is
// carried over from the previous taxonomy unchanged.
export const PRIVATE_TOUR_CATEGORIES = {
  '3-day-kakheti-wine-and-food-tour-from-tbilisi': ['wine-food', 'cultural-heritage'],
  '5-day-private-tour-from-tbilisi-to-batumi': ['cultural-heritage', 'black-sea'],
  '5-day-georgia-private-tour-tbilisi-wine-and-sulfur-baths': ['wine-food', 'cultural-heritage'],
  '6-day-georgia-private-tour-highlights-from-tbilisi': ['cultural-heritage', 'wine-food'],
  '7-day-georgia-cultural-tour-kutaisi-to-tbilisi': ['cultural-heritage'],
  '8-day-georgia-private-tour-culture-nature-and-wine': ['cultural-heritage', 'wine-food', 'nature-mountain'],
  '8-day-georgia-culture-and-adventure-tour': ['cultural-heritage', 'adventure-hiking', 'nature-mountain'],
  '9-day-georgia-private-tour-kutaisi-to-tbilisi': ['cultural-heritage'],
  'georgia-grand-tour-9-days-from-tbilisi-to-batumi': ['wine-food', 'cultural-heritage', 'nature-mountain', 'black-sea'],
  '9-day-georgia-wine-and-adventure-tour': ['wine-food', 'nature-mountain', 'adventure-hiking'],
  'georgia-in-10-days-where-every-corner-has-a-story-and-every-meal-is-a-celebration': ['cultural-heritage', 'wine-food', 'black-sea'],
  'georgias-wonders-11-day-grand-tour-from-kutaisi-to-kazbegi-and-batumi': ['nature-mountain', 'black-sea'],
  '12-day-ultimate-georgia-adventure-tour-tbilisi-kazbegi-mestia-kutaisi-batumi': ['nature-mountain', 'adventure-hiking', 'black-sea'],
  '13-day-georgia-grand-tour-from-kutaisi-culture-and-nature': ['adventure-hiking', 'nature-mountain', 'cultural-heritage', 'black-sea'],
  'ultimate-15-day-georgia-tour-from-tbilisi-to-svaneti--wine-culture-and-natural-beauty': ['nature-mountain', 'wine-food', 'cultural-heritage', 'black-sea'],
  '20-day-georgia-grand-tour-wine-hiking-and-culture': ['wine-food', 'adventure-hiking', 'nature-mountain', 'black-sea'],
  '7-day-gudauri-ski-tour-from-tbilisi': ['winter-tours', 'nature-mountain', 'adventure-hiking'],
}
