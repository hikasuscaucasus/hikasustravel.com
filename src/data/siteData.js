/**
 * Destination navigation — single source of truth.
 *
 * The Destinations dropdown is two levels: a country at level 1, that country's
 * entries at level 2. Level 2 for Georgia is the four hub links this dropdown
 * has always carried, moved down a level verbatim — same labels, same URLs,
 * same order. Nothing was reworded, reordered or re-slugged.
 *
 * `published` gates rendering, per entry and per country. A `published: false`
 * entry is not rendered anywhere: not in the dropdown, not in a breadcrumb, not
 * in any internal link list. It is also invisible to the sitemap for free —
 * scripts/generate-sitemap.js builds from the src/data/places.js registry and
 * has never read this file — so turning one on here is a nav change only, and
 * still needs its page, route and registry entry before it can be linked.
 *
 * A published country with no published entries still shows at level 1; opening
 * it shows the single non-linked `nav.destinations.comingSoon` line.
 *
 * Adding an entry is therefore one line, and needs no component change.
 *
 * `hubPath` is the country's own landing page. Set it ONLY when that route
 * actually exists (Georgia: `/{lang}/georgia`, src/App.jsx). A country without
 * one renders its level-1 label as a plain toggle instead of a link.
 *
 * Entry labels come from `labelKey` (a ui.json key) when the string is
 * translated, or from `label` when it is the same in all seven locales —
 * transliterated Armenian region names are identical across the locale files,
 * so they carry no key.
 */
export const destinationCountries = [
  {
    id: 'georgia',
    labelKey: 'nav.destinations.georgia',
    published: true,
    hubPath: '/georgia',
    regions: [
      { to: '/georgia', labelKey: 'nav.allDestinations', published: true },
      { to: '/georgia/regions', labelKey: 'nav.regions', published: true },
      { to: '/georgia/cities', labelKey: 'nav.cities', published: true },
      { to: '/georgia/places-to-visit', labelKey: 'nav.placesToVisit', published: true },
    ],
  },
  {
    // Armenia now has its own landing page, so the level-1 label is a link.
    //
    // Level 2 lists HUBS, mirroring Georgia — not individual regions. Georgia
    // shows four hub links and none of its twelve regions; Armenia shows the two
    // hubs that exist (it has no cities or places-to-visit hub yet). An
    // individual region is reached from /armenia/regions, exactly as Kakheti is
    // reached from /georgia/regions.
    //
    // The eleven seeded region entries below stay `published: false`: they are
    // inert placeholders, and Aragatsotn — the one published Armenia region —
    // is deliberately NOT surfaced here, because regions do not belong in the
    // global Destinations menu on either country.
    id: 'armenia',
    labelKey: 'nav.destinations.armenia',
    published: true,
    hubPath: '/armenia',
    regions: [
      { to: '/armenia', labelKey: 'nav.allDestinations', published: true },
      { to: '/armenia/regions', labelKey: 'nav.regions', published: true },
      { to: '/armenia/regions/yerevan', label: 'Yerevan', published: false },
      { to: '/armenia/regions/kotayk', label: 'Kotayk', published: false },
      { to: '/armenia/regions/aragatsotn', label: 'Aragatsotn', published: false },
      { to: '/armenia/regions/armavir', label: 'Armavir', published: false },
      { to: '/armenia/regions/ararat', label: 'Ararat', published: false },
      { to: '/armenia/regions/gegharkunik', label: 'Gegharkunik', published: false },
      { to: '/armenia/regions/tavush', label: 'Tavush', published: false },
      { to: '/armenia/regions/lori', label: 'Lori', published: false },
      { to: '/armenia/regions/shirak', label: 'Shirak', published: false },
      { to: '/armenia/regions/vayots-dzor', label: 'Vayots Dzor', published: false },
      { to: '/armenia/regions/syunik', label: 'Syunik', published: false },
    ],
  },
]

export const navLinks = [
  { to: '/about-us', labelKey: 'nav.aboutUs' },
  {
    labelKey: 'nav.tours',
    children: [
      { to: '/group-tours', labelKey: 'nav.groupTours' },
      { to: '/private-tours', labelKey: 'nav.privateTours' },
    ],
  },
  {
    labelKey: 'nav.destinations',
    countries: destinationCountries,
  },
  { to: '/about-georgia', labelKey: 'nav.aboutGeorgia' },
  { to: '/shuttle-service', labelKey: 'nav.shuttleService' },
  { to: '/contact', labelKey: 'nav.contactUs' },
]

export const footerLinks = [
  { to: '/about-us', labelKey: 'footer.about' },
  { to: '/about-georgia', labelKey: 'footer.aboutGeorgia' },
  { to: '/group-tours', labelKey: 'footer.groupTours' },
  { to: '/private-tours', labelKey: 'footer.privateTours' },
  { to: '/faq', labelKey: 'footer.faq' },
  { to: '/privacy-policy', labelKey: 'footer.privacyPolicy' },
  { to: '/terms-and-conditions', labelKey: 'footer.termsConditions' },
  { to: '/contact', labelKey: 'footer.contact' },
]

export const contactInfo = {
  address: '111a Vakhtang Gorgasali Street, Tbilisi 0114, Georgia',
  phoneBelgium: '+32 468 32 06 98',
  phoneGeorgia: '+995 551 098 077',
  email: 'info@hikasustravel.com',
  instagramUrl: 'https://www.instagram.com/hikasus_travel',
  instagramHandle: 'hikasus_travel',
}
