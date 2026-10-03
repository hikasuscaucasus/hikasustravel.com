// Factual-freshness registry.
//
// The site carries facts that go stale: border rules, visa terms, fares,
// train services. This file records which pages carry such facts, which
// shared facts they depend on, where those facts are verified, and when each
// page was last checked. It is read by:
//   - scripts/content-freshness.js  (`npm run content:freshness`) — the due /
//     overdue report, year-in-title check and blog-date regression check;
//   - VisaPage.jsx and BorderCrossingPage.jsx — the visible "Last reviewed"
//     line and the Article `dateModified`.
//
// Rules (see docs/content-freshness.md):
//   - `lastVerified` moves only when the page was actually re-checked against
//     current authoritative sources. `lastChanged` moves only when the copy
//     materially changed. Neither is ever bumped for appearance.
//   - A year in a title (yearInTitle) may change only after that page has been
//     re-verified in the new year.
//   - Blog `date` (datePublished) is never touched by an audit.

export const AUDIT_INTERVAL_DAYS = 90

// The last full audit that completed, and the next one due.
export const lastFullAudit = '2026-10-03'
export const nextFullAudit = '2027-01-01'

// Shared volatile facts. Research each ONCE per audit, then update every page
// in `usedOn` so the wording cannot drift between pages.
export const facts = {
  azLandEntry: {
    fact: 'Azerbaijan: ordinary foreign travellers may enter by land only with Task Force permission; they may leave by land without it. Special quarantine regime currently runs to 2 January 2027 and has always been extended.',
    sources: ['https://www.mfa.gov.az/en/category/entry-rules-to-the-republic-of-azerbaijan-during-covid-19-pandemic', 'https://en.apa.az/', 'https://report.az/en/'],
    usedOn: ['azerbaijanBorderCrossings', 'borderCrossingsOverview', 'redBridgeBorderCrossing', 'lagodekhiBalakanBorderCrossing', 'azerbaijanVisaGuide', 'aboutAzerbaijan', 'blog:ultimate-guide-to-traveling-to-azerbaijan', 'blog:ultimate-guide-to-traveling-to-georgia', 'blog:azerbaijan-georgia-armenia-2-weeks-current-borders', 'tour:14-day-caucasus-tour'],
  },
  azGeRail: {
    fact: 'Baku–Tbilisi passenger rail: since 25 May 2026 entry/exit by rail is open to Azerbaijani citizens and to foreigners with visa-free entry rights to Azerbaijan only.',
    sources: ['https://www.mfa.gov.az/en/category/entry-rules-to-the-republic-of-azerbaijan-during-covid-19-pandemic', 'https://ady.az/'],
    usedOn: ['azerbaijanBorderCrossings', 'borderCrossingsOverview', 'azerbaijanVisaGuide', 'tbilisiRailwayStation', 'blog:ultimate-guide-to-traveling-to-azerbaijan', 'blog:azerbaijan-georgia-armenia-2-weeks-current-borders'],
  },
  azEvisa: {
    fact: 'Azerbaijan ASAN e-Visa: standard within 3 working days, urgent 3 hours, single entry, stay up to 30 days, valid 90 days.',
    sources: ['https://evisa.gov.az/en/information'],
    usedOn: ['azerbaijanVisaGuide', 'blog:ultimate-guide-to-traveling-to-azerbaijan', 'blog:azerbaijan-georgia-armenia-2-weeks-current-borders'],
  },
  geInsurance: {
    fact: 'Georgia: travel health and accident insurance is mandatory for foreign visitors since 1 January 2026 and can be checked at entry.',
    sources: ['https://matsne.gov.ge/', 'https://ge.usembassy.gov/georgia-to-require-insurance-for-all-tourists-starting-1-1-2026/'],
    usedOn: ['visaGuide', 'borderCrossingsOverview', 'aboutGeorgia', 'blog:ultimate-guide-to-traveling-to-georgia', 'blog:azerbaijan-georgia-armenia-2-weeks-current-borders'],
  },
  geVisa: {
    fact: 'Georgia: citizens of roughly 95 countries enter visa-free for up to one year; others may use the e-Visa portal (decision within about 5 working days).',
    sources: ['https://www.evisa.gov.ge/GeoVisa/', 'https://www.geoconsul.gov.ge/'],
    usedOn: ['visaGuide', 'aboutGeorgia', 'blog:ultimate-guide-to-traveling-to-georgia'],
  },
  amVisa: {
    fact: 'Armenia: visa-free nationals (EU, UK, US, Australia and others — NOT Canada, NOT Vietnam ordinary passports) may stay up to 180 days within a year; others use the e-Visa or a consulate.',
    sources: ['https://www.mfa.am/en/visa/', 'https://www.mfa.am/en/visafreelist', 'https://www.mfa.am/en/whoneedvisa', 'https://evisa.mfa.am/'],
    usedOn: ['armeniaVisaGuide', 'aboutArmenia', 'blog:ultimate-guide-to-traveling-to-armenia'],
  },
  amBorders: {
    fact: 'Armenia: borders with Georgia (Bagratashen, Bavra, Gogavan) and Iran (Agarak) are open; borders with Turkey and Azerbaijan are closed to travellers. Margara is prepared but not opened.',
    sources: ['https://www.mfa.am/en/', 'https://www.petekamutner.am/'],
    usedOn: ['armeniaBorderCrossings', 'borderCrossingsOverview', 'sadakhloBagratashenBorderCrossing', 'ninotsmindaBavraBorderCrossing', 'gugutiGogavanBorderCrossing', 'aboutArmenia', 'blog:ultimate-guide-to-traveling-to-armenia', 'blog:azerbaijan-georgia-armenia-2-weeks-current-borders', 'tour:10-day-georgia-armenia-tour', 'tour:14-day-caucasus-tour'],
  },
  geFx: {
    fact: 'Georgian lari reference rate (dated example only): about 2.6 GEL per USD and 3.0 GEL per EUR in October 2026.',
    sources: ['https://nbg.gov.ge/en/monetary-policy/currency'],
    usedOn: ['lariGuide', 'aboutGeorgia', 'blog:ultimate-guide-to-traveling-to-georgia'],
  },
  tbilisiFares: {
    fact: 'Tbilisi public transport: 1 GEL per ride with 90 minutes of transfers; Rike–Narikala cable car 2.5 GEL; Mtatsminda funicular 10 GEL.',
    sources: ['https://ttc.com.ge/en'],
    usedOn: ['tbilisiMetro', 'tbilisiAirportGuide', 'rikeNarikalaCableCar', 'tbilisiFunicular', 'blog:ultimate-guide-to-traveling-to-georgia'],
  },
  geRail: {
    fact: 'Georgian Railway Tbilisi–Batumi day trains take about four hours since 3 August 2026 (Batumi 16:50 → Tbilisi 20:50); second class from about 35 GEL; timetable changes seasonally. Baku night train since 26 May 2026, Yerevan night train on alternate nights.',
    sources: ['https://www.railway.ge/en/', 'https://tkt.ge/', 'https://bm.ge/en/news/tbilisi-batumi-train-journey-to-be-reduced-to-4-hours-from-august-3'],
    usedOn: ['tbilisiRailwayStation', 'blog:ultimate-guide-to-traveling-to-georgia', 'tour:georgia-group-tour', 'tour:5-day-private-tour-from-tbilisi-to-batumi', 'tour:georgias-wonders-11-day-grand-tour-from-kutaisi-to-kazbegi-and-batumi', 'tour:13-day-georgia-grand-tour-from-kutaisi-culture-and-nature', 'tour:20-day-georgia-grand-tour-wine-hiking-and-culture'],
  },
  unesco: {
    fact: 'UNESCO World Heritage properties: Georgia 4, Armenia 3, Azerbaijan 5 (no additions at the 2025 or 2026 sessions).',
    sources: ['https://whc.unesco.org/en/list/'],
    usedOn: ['aboutGeorgia', 'aboutArmenia', 'aboutAzerbaijan', 'blog:ultimate-guide-to-traveling-to-armenia', 'blog:ultimate-guide-to-traveling-to-azerbaijan'],
  },
}

const A = 'A', B = 'B', C = 'C', D = 'D'
// Pages whose copy materially changed in the 2026-10-03 audit.
const CHANGED_2026_10_03 = new Set(["borderCrossingsOverview","armeniaBorderCrossings","azerbaijanBorderCrossings","visaGuide","armeniaVisaGuide","azerbaijanVisaGuide","kazbegiUpperLarsBorderCrossing","lagodekhiBalakanBorderCrossing","gugutiGogavanBorderCrossing","kartsakhiBorderCrossing","sadakhloBagratashenBorderCrossing","aboutGeorgia","aboutArmenia","aboutAzerbaijan","tbilisiAirportGuide","tbilisiRailwayStation"])
const page = (id, path, country, type, tier, factCategories, factIds, extra = {}) => ({
  id, path, country, type, tier, factCategories, facts: factIds,
  lastVerified: '2026-10-03', lastChanged: CHANGED_2026_10_03.has(id) ? '2026-10-03' : null, yearInTitle: false, visibleReviewed: false, ...extra,
})

// Every tracked page. `id` is the pages.json content key, or `blog:<slug>` /
// `tour:<slug>` / `data:<file>` for content that lives elsewhere.
export const pages = [
  // ---- Tier A: highly volatile (title carries the year, visible review date)
  page('borderCrossingsOverview', '/georgia/border-crossings', 'georgia', 'border-guide', A, ['border status', 'rail', 'insurance', 'permits'], ['azLandEntry', 'azGeRail', 'geInsurance', 'amBorders'], { yearInTitle: true, visibleReviewed: true }),
  page('armeniaBorderCrossings', '/armenia/border-crossings', 'armenia', 'border-guide', A, ['border status', 'rail', 'visa'], ['amBorders', 'amVisa'], { yearInTitle: true, visibleReviewed: true }),
  page('azerbaijanBorderCrossings', '/azerbaijan/border-crossings', 'azerbaijan', 'border-guide', A, ['border status', 'rail', 'e-Visa', 'Nakhchivan access'], ['azLandEntry', 'azGeRail', 'azEvisa'], { yearInTitle: true, visibleReviewed: true }),
  page('visaGuide', '/georgia-visa-entry-requirements', 'georgia', 'visa-guide', A, ['visa-free list', 'e-Visa', 'insurance', 'passport validity'], ['geVisa', 'geInsurance'], { yearInTitle: true, visibleReviewed: true }),
  page('armeniaVisaGuide', '/armenia-visa-entry-requirements', 'armenia', 'visa-guide', A, ['visa-free list', 'e-Visa', 'stay length'], ['amVisa'], { yearInTitle: true, visibleReviewed: true }),
  page('azerbaijanVisaGuide', '/azerbaijan-visa-entry-requirements', 'azerbaijan', 'visa-guide', A, ['e-Visa', 'visa-free list', 'registration', 'land entry'], ['azEvisa', 'azLandEntry', 'azGeRail'], { yearInTitle: true, visibleReviewed: true }),
  ...[
    ['akhkerpiBorderCrossing', 'akhkerpi-border-crossing', ['amBorders']],
    ['gugutiGogavanBorderCrossing', 'guguti-gogavan-border-crossing', ['amBorders']],
    ['kartsakhiBorderCrossing', 'kartsakhi-border-crossing', []],
    ['kazbegiUpperLarsBorderCrossing', 'kazbegi-dariali-upper-lars-border-crossing', []],
    ['lagodekhiBalakanBorderCrossing', 'lagodekhi-balakan-border-crossing', ['azLandEntry', 'geInsurance']],
    ['ninotsmindaBavraBorderCrossing', 'ninotsminda-bavra-border-crossing', ['amBorders']],
    ['redBridgeBorderCrossing', 'red-bridge-border-crossing', ['azLandEntry']],
    ['sadakhloBagratashenBorderCrossing', 'sadakhlo-bagratashen-border-crossing', ['amBorders']],
    ['sarpiBorderCrossing', 'sarpi-border-crossing', []],
    ['valeBorderCrossing', 'vale-border-crossing', []],
  ].map(([id, slug, f]) => page(id, `/georgia/border-crossings/${slug}`, 'georgia', 'border-crossing', A, ['open/closed status', 'operating hours', 'who may cross'], f, { visibleReviewed: true })),

  // ---- Tier B: moderately volatile practical content
  page('aboutGeorgia', '/about-georgia', 'georgia', 'about', B, ['entry', 'currency', 'transport', 'SIM', 'statistics', 'UNESCO'], ['geVisa', 'geInsurance', 'geFx', 'unesco']),
  page('aboutArmenia', '/about-armenia', 'armenia', 'about', B, ['entry', 'currency', 'transport', 'borders', 'UNESCO'], ['amVisa', 'amBorders', 'unesco']),
  page('aboutAzerbaijan', '/about-azerbaijan', 'azerbaijan', 'about', B, ['entry', 'land border', 'e-Visa', 'currency', 'Nakhchivan', 'UNESCO'], ['azLandEntry', 'azEvisa', 'unesco']),
  page('tbilisiAirportGuide', '/tbilisi-international-airport', 'georgia', 'transport-guide', B, ['airport bus', 'fares', 'airlines', 'taxi prices'], ['tbilisiFares']),
  page('airportGuide', '/kutaisi-international-airport', 'georgia', 'transport-guide', B, ['airlines', 'shuttle operators', 'shuttle fares'], []),
  page('tbilisiMetro', '/tbilisi-metro', 'georgia', 'transport-guide', B, ['fares', 'hours', 'lines'], ['tbilisiFares']),
  page('tbilisiRailwayStation', '/tbilisi-railway-station', 'georgia', 'transport-guide', B, ['train routes', 'international trains', 'ticketing'], ['geRail', 'azGeRail']),
  page('lariGuide', '/georgian-lari-currency-guide', 'georgia', 'practical-guide', B, ['exchange rate', 'prices', 'cards'], ['geFx']),
  page('rikeNarikalaCableCar', '/georgia/tbilisi/rike-narikala-cable-car', 'georgia', 'attraction', B, ['fare', 'hours'], ['tbilisiFares']),
  page('tbilisiFunicular', '/georgia/tbilisi/tbilisi-funicular', 'georgia', 'attraction', B, ['fare', 'hours'], ['tbilisiFares']),

  // ---- Tier C: every published blog article and guide card
  page('blog:ultimate-guide-to-traveling-to-georgia', '/blog/ultimate-guide-to-traveling-to-georgia', 'georgia', 'blog', C, ['visa', 'insurance', 'prices', 'transport', 'borders', 'SIM'], ['geVisa', 'geInsurance', 'geFx', 'tbilisiFares', 'geRail', 'azLandEntry']),
  page('blog:ultimate-guide-to-traveling-to-armenia', '/blog/ultimate-guide-to-traveling-to-armenia', 'armenia', 'blog', C, ['visa', 'borders', 'transport', 'UNESCO'], ['amVisa', 'amBorders', 'unesco']),
  page('blog:ultimate-guide-to-traveling-to-azerbaijan', '/blog/ultimate-guide-to-traveling-to-azerbaijan', 'azerbaijan', 'blog', C, ['e-Visa', 'land border', 'registration', 'UNESCO'], ['azEvisa', 'azLandEntry', 'azGeRail', 'unesco']),
  page('blog:azerbaijan-georgia-armenia-2-weeks-current-borders', '/blog/azerbaijan-georgia-armenia-2-weeks-current-borders', 'caucasus', 'blog', C, ['border direction', 'rail exception', 'insurance', 'visa'], ['azLandEntry', 'azGeRail', 'azEvisa', 'geInsurance', 'amBorders']),
  page('blog:essential-georgian-words-phrases', '/blog/essential-georgian-words-phrases', 'georgia', 'blog', C, ['none time-sensitive'], []),
  page('blog:essential-armenian-words', '/blog/essential-armenian-words', 'armenia', 'blog', C, ['English proficiency statement'], []),
  page('blog:why-georgia-is-called-georgia-sakartvelo', '/blog/why-georgia-is-called-georgia-sakartvelo', 'georgia', 'blog', C, ['population figure'], []),
  page('blog:georgian-flag-history-meaning', '/blog/georgian-flag-history-meaning', 'georgia', 'blog', C, ['none time-sensitive'], []),
  page('languagesGuide', '/languages-of-georgia', 'georgia', 'blog-guide', C, ['none time-sensitive'], []),

  // ---- Tier D: other content carrying a volatile fact
  page('tour:14-day-caucasus-tour', '/private-tours/14-day-caucasus-tour', 'caucasus', 'tour', D, ['border direction', 'foot crossings', 'Azerbaijan visa'], ['azLandEntry', 'amBorders']),
  page('tour:10-day-georgia-armenia-tour', '/private-tours/10-day-georgia-armenia-tour', 'caucasus', 'tour', D, ['Sadakhlo–Bagratashen crossing'], ['amBorders']),
  page('tour:georgia-group-tour', '/group-tours/georgia-group-tour', 'georgia', 'tour', D, ['Batumi–Tbilisi train'], ['geRail']),
  page('tour:5-day-private-tour-from-tbilisi-to-batumi', '/private-tours/5-day-private-tour-from-tbilisi-to-batumi', 'georgia', 'tour', D, ['Batumi–Tbilisi train'], ['geRail']),
  page('tour:georgias-wonders-11-day-grand-tour-from-kutaisi-to-kazbegi-and-batumi', '/private-tours/georgias-wonders-11-day-grand-tour-from-kutaisi-to-kazbegi-and-batumi', 'georgia', 'tour', D, ['Batumi–Tbilisi train'], ['geRail']),
  page('tour:13-day-georgia-grand-tour-from-kutaisi-culture-and-nature', '/private-tours/13-day-georgia-grand-tour-from-kutaisi-culture-and-nature', 'georgia', 'tour', D, ['Batumi–Tbilisi train'], ['geRail']),
  page('tour:20-day-georgia-grand-tour-wine-hiking-and-culture', '/private-tours/20-day-georgia-grand-tour-wine-hiking-and-culture', 'georgia', 'tour', D, ['Batumi–Tbilisi train'], ['geRail']),
  page('data:embassyData', '/embassies', 'caucasus', 'directory', D, ['embassy addresses and phone numbers'], [], { lastVerified: null, note: 'Not re-verified in the 2026-10-03 audit.' }),
  page('data:shuttleData', '/shuttle-service', 'georgia', 'service', D, ['own prices (owner-controlled)'], [], { lastVerified: null, note: 'Owner-controlled prices; not an external fact.' }),
]

const byId = new Map(pages.map((p) => [p.id, p]))

// Date to show as "Last reviewed" for a pages.json content key, or null.
export function reviewedDateFor(contentKey) {
  const p = byId.get(contentKey)
  return p && p.visibleReviewed && p.lastVerified ? p.lastVerified : null
}

// Date of the last material content change, for Article `dateModified`.
export function changedDateFor(contentKey) {
  const p = byId.get(contentKey)
  return p && p.lastChanged ? p.lastChanged : null
}
