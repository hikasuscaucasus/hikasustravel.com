// The four tour hubs the /private-tours chooser leads to, in the order the
// chooser shows them (Caucasus, Azerbaijan, Georgia, Armenia — the owner's
// order, not alphabetical). ONE registry for every surface that names a hub:
// the chooser cards, the hub pages' own <head> image, the homepage destination
// cards' status line, the tour-detail "back to" link and the build-time
// prerender (scripts/prerender.js imports this file for og:image), so a hub
// cannot be described differently in two places.
//
// Routes stay /:lang/tours/<id> — the segment is English in every locale, the
// site's existing convention. Hub CONTENT (which tours appear) is not here: it
// comes from the tour registry via primaryToursFor() / combinedToursCovering()
// in src/data/tours.js, so a newly tagged tour appears without touching this.
//
// NOTE: explicit .js extensions are not needed here (no imports), but this
// module is dynamically imported by scripts/prerender.js, so it must stay
// plain data — no React, no window.
export const TOUR_HUBS = [
  {
    id: 'caucasus',
    path: '/tours/caucasus',
    seoKey: 'toursCaucasus',
    titleKey: 'home.hubTitleCaucasus',
    introKey: 'home.hubIntroCaucasus',
    nameKey: 'home.destCaucasus',
    navKey: 'nav.toursCaucasus',
    cardKey: 'tourHub.cardCaucasus',
    ctaKey: 'tourHub.ctaCaucasus',
    altKey: 'tourHub.altCaucasus',
    // The same Greater Caucasus frame the homepage's Caucasus card already
    // uses: a range, not a landmark, so it does not read as one country.
    image: '/images/files/svaneti-caucasus-mountains-georgia-1200.webp',
  },
  {
    id: 'azerbaijan',
    path: '/tours/azerbaijan',
    seoKey: 'toursAzerbaijan',
    titleKey: 'home.hubTitleAzerbaijan',
    introKey: 'home.hubIntroAzerbaijan',
    nameKey: 'nav.destinations.azerbaijan',
    navKey: 'nav.toursAzerbaijan',
    cardKey: 'tourHub.cardAzerbaijan',
    ctaKey: 'tourHub.ctaAzerbaijan',
    altKey: 'home.azerbaijanCardAlt',
    combinedKey: 'tourHub.combinedAzerbaijan',
    image: '/images/files/azerbaijan-home.jpg',
  },
  {
    id: 'georgia',
    path: '/tours/georgia',
    seoKey: 'toursGeorgia',
    titleKey: 'home.hubTitleGeorgia',
    introKey: 'home.hubIntroGeorgia',
    nameKey: 'nav.destinations.georgia',
    navKey: 'nav.toursGeorgia',
    cardKey: 'tourHub.cardGeorgia',
    ctaKey: 'tourHub.ctaGeorgia',
    altKey: 'tourHub.altGeorgia',
    combinedKey: 'tourHub.combinedGeorgia',
    image: '/images/files/Sighnaghi.jpg',
  },
  {
    id: 'armenia',
    path: '/tours/armenia',
    seoKey: 'toursArmenia',
    titleKey: 'home.hubTitleArmenia',
    introKey: 'home.hubIntroArmenia',
    nameKey: 'nav.destinations.armenia',
    navKey: 'nav.toursArmenia',
    cardKey: 'tourHub.cardArmenia',
    ctaKey: 'tourHub.ctaArmenia',
    altKey: 'tourHub.altArmenia',
    combinedKey: 'tourHub.combinedArmenia',
    image: '/images/files/amberd-fortress-aragats-armenia-1086.webp',
  },
]

export const tourHubById = Object.fromEntries(TOUR_HUBS.map((h) => [h.id, h]))

// Social image for the chooser page itself (/private-tours): the Caucasus
// frame, since the page spans all three countries.
export const TOUR_HUB_CHOOSER_IMAGE = tourHubById.caucasus.image
