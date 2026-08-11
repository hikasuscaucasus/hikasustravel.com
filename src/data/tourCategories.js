// Tour category assignments for the Private Tours listing filter.
//
// IMPORTANT: filtering uses these stable, language-neutral IDs (and tour slugs)
// only — never translated visible labels. Visible labels are mapped per locale
// in each ui.json under the keys in CATEGORY_LABEL_KEYS below.
//
// Categories are filtering data only: they are NOT shown on tour cards.
// A tour may belong to several categories. "all" is implicit for every tour and
// is only used as the default "no restriction" option.

// Order shown in the dropdown ("all" first as the default).
export const CATEGORY_IDS = [
  'all',
  'cultural-heritage',
  'wine-food',
  'adventure-hiking',
  'nature-mountain',
  'western-georgia-black-sea',
  'winter-tours',
]

// Stable id -> ui.json translation key (visible label per language).
export const CATEGORY_LABEL_KEYS = {
  all: 'tour.catAll',
  'cultural-heritage': 'tour.catCulturalHeritage',
  'wine-food': 'tour.catWineFood',
  'adventure-hiking': 'tour.catAdventureHiking',
  'nature-mountain': 'tour.catNatureMountain',
  'western-georgia-black-sea': 'tour.catWesternBlackSea',
  'winter-tours': 'tour.catWinterTours',
}

// Per-tour assignments, keyed by stable slug (confirmed with the owner).
export const PRIVATE_TOUR_CATEGORIES = {
  '3-day-kakheti-wine-and-food-tour-from-tbilisi': ['wine-food', 'cultural-heritage'],
  '5-day-private-tour-from-tbilisi-to-batumi': ['cultural-heritage', 'western-georgia-black-sea'],
  '5-day-georgia-private-tour-tbilisi-wine-and-sulfur-baths': ['wine-food', 'cultural-heritage'],
  '6-day-georgia-private-tour-highlights-from-tbilisi': ['cultural-heritage', 'wine-food'],
  '7-day-georgia-cultural-tour-kutaisi-to-tbilisi': ['cultural-heritage', 'western-georgia-black-sea'],
  '8-day-georgia-private-tour-culture-nature-and-wine': ['cultural-heritage', 'wine-food', 'nature-mountain'],
  '8-day-georgia-culture-and-adventure-tour': ['cultural-heritage', 'adventure-hiking', 'nature-mountain'],
  '9-day-georgia-private-tour-kutaisi-to-tbilisi': ['cultural-heritage', 'western-georgia-black-sea'],
  'georgia-grand-tour-9-days-from-tbilisi-to-batumi': ['wine-food', 'cultural-heritage', 'nature-mountain'],
  '9-day-georgia-wine-and-adventure-tour': ['wine-food', 'nature-mountain', 'adventure-hiking'],
  'georgia-in-10-days-where-every-corner-has-a-story-and-every-meal-is-a-celebration': ['cultural-heritage', 'wine-food'],
  'georgias-wonders-11-day-grand-tour-from-kutaisi-to-kazbegi-and-batumi': ['nature-mountain', 'western-georgia-black-sea'],
  '12-day-ultimate-georgia-adventure-tour-tbilisi-kazbegi-mestia-kutaisi-batumi': ['nature-mountain', 'adventure-hiking', 'western-georgia-black-sea'],
  '13-day-georgia-grand-tour-from-kutaisi-culture-and-nature': ['adventure-hiking', 'nature-mountain', 'cultural-heritage'],
  'ultimate-15-day-georgia-tour-from-tbilisi-to-svaneti--wine-culture-and-natural-beauty': ['nature-mountain', 'wine-food', 'cultural-heritage'],
  '20-day-georgia-grand-tour-wine-hiking-and-culture': ['wine-food', 'adventure-hiking', 'nature-mountain'],
  '7-day-gudauri-ski-tour-from-tbilisi': ['winter-tours', 'nature-mountain', 'adventure-hiking'],
}
