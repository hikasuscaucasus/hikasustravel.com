/**
 * Destination navigation — single source of truth.
 *
 * The Destinations dropdown is two levels: a country at level 1, that country's
 * entries at level 2. Level 2 for Georgia is the four hub links this dropdown
 * has always carried, moved down a level verbatim — same labels, same URLs,
 * same order. Nothing was reworded, reordered or re-slugged.
 *
 * Each country's level 2 also carries that country's Tours link plus Caucasus
 * Tours, below a `divider: true` entry (see NavCountry in Header.jsx). These
 * reuse the exact `to`/`labelKey` pairs the "Our Tours" dropdown uses for the
 * same four categories in src/data/siteData.js's `navLinks` below — one
 * tour-routing model, linked from two places, never a second one.
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
      // Same route/labelKey as the "Our Tours" dropdown (Header.jsx's
      // NavCountry renders a divider before the first entry flagged
      // `divider: true` — no separate tour-routing model).
      { to: '/tours/georgia', labelKey: 'nav.toursGeorgia', published: true, divider: true },
      { to: '/tours/caucasus', labelKey: 'nav.toursCaucasus', published: true },
    ],
  },
  {
    // Armenia now has its own landing page, so the level-1 label is a link.
    //
    // Level 2 lists HUBS, mirroring Georgia — not individual regions. Georgia
    // shows four hub links and none of its twelve regions; Armenia now shows the
    // same four, since /armenia/cities and /armenia/places-to-visit both exist
    // (src/App.jsx routes them to the shared CitiesHubPage and
    // PlacesToVisitHubPage with country="armenia"). An individual region is
    // reached from /armenia/regions, exactly as Kakheti is reached from
    // /georgia/regions.
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
      { to: '/armenia/cities', labelKey: 'nav.cities', published: true },
      { to: '/armenia/places-to-visit', labelKey: 'nav.placesToVisit', published: true },
      // Same route/labelKey as the "Our Tours" dropdown.
      { to: '/tours/armenia', labelKey: 'nav.toursArmenia', published: true, divider: true },
      { to: '/tours/caucasus', labelKey: 'nav.toursCaucasus', published: true },
      // Yerevan holds separate capital status: it is NOT one of the ten marzer,
      // so it never belonged under /armenia/regions. Corrected to its real route.
      // Still inert here, like every other seeded entry below — individual
      // destinations are not surfaced in the global Destinations menu on either
      // country. It is reached from /armenia, exactly as Tbilisi is reached from
      // /georgia.
      { to: '/armenia/yerevan', label: 'Yerevan', published: false },
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
  {
    // Azerbaijan: the same four hub links as Georgia and Armenia, in the same
    // order, reusing the same four ui keys. The landing page and hubs exist
    // (src/App.jsx routes them to the shared components with
    // country="azerbaijan"); every region, city and place behind them is
    // scaffolded as `published: false` in places.js and appears on the hubs as
    // a non-clickable "coming soon" card. Individual destinations are not
    // surfaced here, exactly as on the other two countries.
    id: 'azerbaijan',
    labelKey: 'nav.destinations.azerbaijan',
    published: true,
    hubPath: '/azerbaijan',
    regions: [
      { to: '/azerbaijan', labelKey: 'nav.allDestinations', published: true },
      { to: '/azerbaijan/regions', labelKey: 'nav.regions', published: true },
      { to: '/azerbaijan/cities', labelKey: 'nav.cities', published: true },
      { to: '/azerbaijan/places-to-visit', labelKey: 'nav.placesToVisit', published: true },
      // Same route/labelKey as the "Our Tours" dropdown.
      { to: '/tours/azerbaijan', labelKey: 'nav.toursAzerbaijan', published: true, divider: true },
      { to: '/tours/caucasus', labelKey: 'nav.toursCaucasus', published: true },
    ],
  },
]

export const navLinks = [
  { to: '/about-us', labelKey: 'nav.aboutUs' },
  {
    // Country-based categories, replacing the former Private/Group Tours
    // split. Private and group tours still exist as their own pages
    // (/private-tours, /group-tours) — only this dropdown's contents changed.
    // Caucasus first: it is the broader multi-country offering. Georgia has
    // no dedicated /georgia hub of its own the way Armenia/Azerbaijan do, so
    // it reuses the same /tours/<country> hub template as the other three.
    labelKey: 'nav.tours',
    children: [
      { to: '/tours/caucasus', labelKey: 'nav.toursCaucasus' },
      { to: '/tours/georgia', labelKey: 'nav.toursGeorgia' },
      { to: '/tours/armenia', labelKey: 'nav.toursArmenia' },
      { to: '/tours/azerbaijan', labelKey: 'nav.toursAzerbaijan' },
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
  // The company's own TripAdvisor listing. Kept here rather than in the Footer
  // component so both social links come from the same single source.
  tripadvisorUrl:
    'https://www.tripadvisor.com/Attraction_Review-g294195-d33097839-Reviews-Hikasus_Travel-Tbilisi.html',
  tripadvisorLabel: 'Tripadvisor',
}
