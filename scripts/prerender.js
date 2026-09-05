/**
 * Pre-render SEO meta tags at build time.
 *
 * Reads dist/index.html as a template, then for every route × language
 * combination writes a directory-based HTML file with correct <title>,
 * <meta description>, <meta keywords>, OG tags, Twitter Card tags,
 * canonical URL, hreflang alternates, and <html lang>.
 *
 * Run after `vite build`:  node scripts/prerender.js
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { load } from 'cheerio'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Canonical-URL helper (trailing-slash normalisation to match how the static
// host actually serves each page).
const { withTrailingSlash } = await import(
  pathToFileURL(join(__dirname, '../src/utils/url.js')).href
)

// Destination registry (regions / cities / sites) — published detail pages and
// the legacy flat-city URLs that must redirect to their new nested location.
const { publishedDestinationPages, legacyRedirects } = await import(
  pathToFileURL(join(__dirname, '../src/data/places.js')).href
)

// Published border-crossing pages (overview guide + individual crossings).
const { publishedBorderPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/borders.js')).href
)

// Generated "<Entity> Tours" listing pages (destination/attraction -> tours).
const { entityTourPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/entityTours.js')).href
)

// Private Tours collection pages (starting point / category -> tours).
const { privateTourCollectionPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/privateTourCollections.js')).href
)

// The complete tour records, and the shared builder that turns one into the
// page's JSON-LD graph. Importing the module (rather than re-deriving the
// graph here) is the point: the browser and the build cannot disagree about
// structured data if they run the same function.
const { tours: tourRecords } = await import(
  pathToFileURL(join(__dirname, '../src/data/tours.js')).href
)
const { buildTourSeo } = await import(
  pathToFileURL(join(__dirname, '../src/utils/tourSeo.js')).href
)

// Crawlable internal-link graph (parent / children / siblings / translations)
// written into #root as fallback content — see scripts/seo-links.js.
const { createLinkGraph } = await import(
  pathToFileURL(join(__dirname, 'seo-links.js')).href
)

// Build-time structured data (entity nodes, hero ImageObject, breadcrumbs) —
// see scripts/seo-jsonld.js. Runtime useSEO() overwrites this same element.
const { createJsonLdBuilder } = await import(
  pathToFileURL(join(__dirname, 'seo-jsonld.js')).href
)

// Trailing-slash normaliser for JSON-LD item/url/@id keys, shared with useSEO.
const { normalizeJsonLdUrls } = await import(
  pathToFileURL(join(__dirname, '../src/utils/url.js')).href
)

// Build-time React renderer (dist-ssr, produced by `vite build --ssr`). Renders
// the real page body into #root so the article text is in the static HTML
// without executing JavaScript. See src/entry-server.jsx.
const { prepareLocale, renderPage } = await import(
  pathToFileURL(join(__dirname, '../dist-ssr/entry-server.js')).href
)

const DIST = join(__dirname, '..', 'dist')
const SITE_URL = 'https://www.hikasustravel.com'
const LANGS = ['en', 'es', 'fr', 'de', 'pl', 'cs', 'nl']

const localeMap = {
  en: 'en_US', es: 'es_ES', fr: 'fr_FR',
  de: 'de_DE', pl: 'pl_PL', cs: 'cs_CZ', nl: 'nl_NL',
}

// Native language names — anchor text for the root document's locale links.
const langNames = {
  en: 'English', es: 'Español', fr: 'Français',
  de: 'Deutsch', pl: 'Polski', cs: 'Čeština', nl: 'Nederlands',
}

// ---------------------------------------------------------------------------
// 1. Load data sources
// ---------------------------------------------------------------------------

// --- Page SEO (title / description / keywords, per locale) ---
// Imported straight from the authoring source, which now exports the object.
// This replaces a regex-and-new-Function parse of the old seoData.js — the
// runtime file no longer holds the data, only the per-locale lookup.
const { seo } = await import(
  pathToFileURL(join(__dirname, '../src/data/seoData.source.js')).href
)

function getSEO(pageKey, lang = 'en') {
  const page = seo[pageKey]
  if (!page) return { title: 'Hikasus Travel', description: '', keywords: '' }
  return page[lang] || page.en
}

// --- tours.js (tour slugs, types, titles, descriptions, images, days, itinerary) ---
const toursFile = readFileSync(join(__dirname, '../src/data/tours.js'), 'utf-8')

function parseTours(source) {
  const tours = []
  // Match each tour object to extract key fields, splitting the source by slug.
  // Split by slug to get chunks
  const slugMatches = [...source.matchAll(/"slug":\s*"([^"]+)"/g)]
  for (let i = 0; i < slugMatches.length; i++) {
    const start = slugMatches[i].index
    const end = i + 1 < slugMatches.length ? slugMatches[i + 1].index : source.length
    const chunk = source.slice(start, end)

    const slug = slugMatches[i][1]
    const typeM = chunk.match(/"type":\s*"([^"]+)"/)
    const titleM = chunk.match(/"title":\s*"([^"]+)"/)
    const descM = chunk.match(/"description":\s*"([^"]+)"/)
    const heroM = chunk.match(/"heroImage":\s*"([^"]+)"/)
    // Optional dedicated 1.91:1 social image + dimensions (e.g. the Gudauri ski
    // tour). `ogImage` is `{ src, width, height }`; when absent, og:image falls
    // back to the hero below.
    const ogImageM = chunk.match(/"ogImage":\s*\{\s*"src":\s*"([^"]+)",\s*"width":\s*(\d+),\s*"height":\s*(\d+)/)
    // Per-locale hero alt text from imageMeta.alt (the first "alt": {...} block in
    // the tour object). Used as og:image:alt when a social image is defined.
    const altBlockM = chunk.match(/"alt":\s*\{([\s\S]*?)\}/)
    const imageAlt = {}
    if (altBlockM) {
      for (const m of altBlockM[1].matchAll(/"(\w+)":\s*"([^"]*)"/g)) imageAlt[m[1]] = m[2]
    }
    const daysM = chunk.match(/"days":\s*(\d+)/)
    const seoTitleM = chunk.match(/"seoTitle":\s*"([^"]+)"/)
    const metaDescM = chunk.match(/"metaDescription":\s*"([^"]+)"/)
    const formerSlugM = chunk.match(/"formerSlug":\s*"([^"]+)"/)
    // A tour renamed more than once carries an array of every prior slug so
    // each old URL keeps redirecting. Both `formerSlug` (single) and
    // `formerSlugs` (array) are supported and merged into one list.
    const formerSlugsM = chunk.match(/"formerSlugs":\s*\[([\s\S]*?)\]/)
    const formerSlugs = [
      ...(formerSlugM ? [formerSlugM[1]] : []),
      ...(formerSlugsM ? [...formerSlugsM[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : []),
    ]

    // Extract itinerary day titles for keywords
    const itineraryTitles = []
    const itinMatches = chunk.matchAll(/"title":\s*"(Day \d+[^"]+)"/g)
    for (const m of itinMatches) itineraryTitles.push(m[1])

    tours.push({
      slug,
      type: typeM?.[1] || 'private',
      title: titleM?.[1] || slug,
      description: descM?.[1] || '',
      seoTitle: seoTitleM?.[1] || '',
      metaDescription: metaDescM?.[1] || '',
      heroImage: heroM?.[1] || '',
      ogImage: ogImageM?.[1] || '',
      ogImageWidth: ogImageM?.[2] || '',
      ogImageHeight: ogImageM?.[3] || '',
      imageAlt,
      days: daysM ? parseInt(daysM[1]) : 0,
      formerSlugs,
      itineraryTitles,
    })
  }
  return tours
}

const tours = parseTours(toursFile)

// --- Tour translations (per language) ---
function loadTourTranslations(lang) {
  try {
    const filePath = join(__dirname, `../src/i18n/locales/${lang}/tours.json`)
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return {}
  }
}

// --- Blog data ---
const blogArticles = [
  {
    slug: 'ultimate-guide-to-traveling-to-georgia',
    titleKey: 'blog.article1.title',
    title: 'The Ultimate Guide to Traveling to Georgia: Everything You Need to Know Before You Go',
    excerpt: 'From visa requirements and the best time to visit, to must-try dishes, ancient wine traditions, and hidden gems most tourists never find — this is the only Georgia travel guide you will ever need.',
    heroImage: '/images/files/georgia-home.jpg',
    tags: ['travel-guide', 'visa', 'food', 'wine', 'culture'],
  },
  {
    slug: 'essential-georgian-words-phrases',
    titleKey: 'blog.article2.title',
    descKey: 'blog.article2.desc',
    title: '25 Essential Georgian Words and Phrases for Travelers',
    seoTitle: '25 Essential Georgian Words & Phrases for Travelers',
    excerpt: 'Learn 25 essential Georgian words and phrases — hello, thank you, cheers, and more — with simple pronunciation, for travelers to Georgia (the country).',
    metaDescription: 'Learn 25 essential Georgian words and phrases — hello, thank you, cheers, and more — with simple pronunciation, for travelers to Georgia (the country).',
    heroImage: '/images/files/georgian-alphabet-mkhedruli-1200.webp',
    ogImage: '/images/files/georgian-alphabet-mkhedruli-og-1200x630.jpg',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: {
      en: 'Chart of the 33 letters of the Georgian Mkhedruli alphabet with their romanized names',
      de: 'Tafel der 33 Buchstaben des georgischen Mchedruli-Alphabets mit ihren romanisierten Namen',
      fr: "Tableau des 33 lettres de l'alphabet géorgien mkhedruli avec leurs noms romanisés",
      es: 'Tabla de las 33 letras del alfabeto georgiano mkhedruli con sus nombres romanizados',
      nl: 'Overzicht van de 33 letters van het Georgische Mchedroeli-alfabet met hun geromaniseerde namen',
      cs: 'Přehled 33 písmen gruzínské abecedy mchedruli s jejich přepisem do latinky',
      pl: 'Tablica 33 liter gruzińskiego alfabetu mchedruli z ich zlatynizowanymi nazwami',
    },
    tags: ['language', 'culture', 'travel-tips'],
  },
  {
    slug: 'why-georgia-is-called-georgia-sakartvelo',
    titleKey: 'blog.article3.title',
    descKey: 'blog.article3.desc',
    title: "Why Is Georgia Called Georgia — and Why Do Georgians Call It Sakartvelo?",
    seoTitle: "Why Is Georgia Called Georgia — and Why Sakartvelo? | Hikasus Travel",
    excerpt: "Georgia is not named after St George — that's a medieval mistake that stuck. The real story runs through Persian, and Georgians call it Sakartvelo.",
    metaDescription: "Georgia is not named after St George — that's a medieval mistake that stuck. The real story runs through Persian, and Georgians call it Sakartvelo.",
    heroImage: '/images/files/georgia-home.jpg',
    tags: ['history', 'culture', 'language'],
  },
  {
    slug: 'georgian-flag-history-meaning',
    titleKey: 'blog.article4.title',
    descKey: 'blog.article4.desc',
    title: 'The Georgian Flag: Five Crosses, Eight Centuries, and One Revolution',
    seoTitle: 'The Georgian Flag: History, Meaning & the Five Crosses | Hikasus Travel',
    excerpt: "Georgia's five-cross flag looks medieval and is — but it only became the national flag in 2004, carried first as a protest banner. The real story is stranger than the legend.",
    metaDescription: "Georgia's five-cross flag looks medieval and is — but it only became the national flag in 2004, carried first as a protest banner. The real story is stranger than the legend.",
    heroImage: '/images/files/georgian-flag-five-cross-flag-georgia-1600.webp',
    ogImage: '/images/files/georgian-flag-five-cross-flag-georgia-og.jpg',
    ogImageWidth: 1200,
    ogImageHeight: 630,
    ogImageAlt: {
      en: 'The national flag of Georgia, the Five Cross Flag, with a central red cross and four smaller crosses, waving against a blue sky',
      de: 'Die Nationalflagge Georgiens, die Fünf-Kreuz-Flagge, mit einem zentralen roten Kreuz und vier kleineren Kreuzen, vor blauem Himmel',
      fr: 'Le drapeau national de la Géorgie, le drapeau aux cinq croix, avec une grande croix rouge centrale et quatre petites croix, flottant sur un ciel bleu',
      es: 'La bandera nacional de Georgia, la bandera de las cinco cruces, con una cruz roja central y cuatro cruces más pequeñas, ondeando contra un cielo azul',
      nl: 'De nationale vlag van Georgië, de vijfkruisenvlag, met een centraal rood kruis en vier kleinere kruisen, wapperend tegen een blauwe lucht',
      cs: 'Státní vlajka Gruzie, vlajka pěti křížů, s ústředním červeným křížem a čtyřmi menšími kříži, vlající proti modré obloze',
      pl: 'Flaga narodowa Gruzji, flaga pięciu krzyży, z centralnym czerwonym krzyżem i czterema mniejszymi krzyżami, powiewająca na tle błękitnego nieba',
    },
    tags: ['history', 'culture', 'flag'],
  },
]

// Blog title translation for a given article key from ui.json
function loadBlogTitle(lang, key) {
  try {
    const ui = JSON.parse(readFileSync(join(__dirname, `../src/i18n/locales/${lang}/ui.json`), 'utf-8'))
    return ui[key] || null
  } catch {
    return null
  }
}

// Full ui.json for a locale (used for the entity-tours listing meta templates).
function loadUi(lang) {
  try {
    return JSON.parse(readFileSync(join(__dirname, `../src/i18n/locales/${lang}/ui.json`), 'utf-8'))
  } catch {
    return {}
  }
}
const interp = (tpl, name) => (tpl || '').replace(/\{name\}/g, name)

// ---------------------------------------------------------------------------
// 2. Define all routes
// ---------------------------------------------------------------------------

const seoPageMap = {
  '': 'home',
  'about-us': 'aboutUs',
  'about-georgia': 'aboutGeorgia',
  'georgian-lari-currency-guide': 'lariGuide',
  'georgia-visa-entry-requirements': 'visaGuide',
  'languages-of-georgia': 'languagesGuide',
  'kutaisi-international-airport': 'airportGuide',
  'tbilisi-international-airport': 'tbilisiAirportGuide',
  'tbilisi-metro': 'tbilisiMetro',
  'tbilisi-railway-station': 'tbilisiRailwayStation',
  'abkhazia': 'abkhazia',
  'georgia': 'destinations',
  'georgia/regions': 'destinationsRegions',
  'georgia/cities': 'destinationsCities',
  'georgia/places-to-visit': 'destinationsPlaces',
  'armenia': 'armenia',
  'armenia/regions': 'armeniaRegions',
  // City detail pages + their things-to-do guides are emitted from the
  // destination registry (publishedDestinationPages), not from this map.
  'private-tours': 'privateTours',
  'group-tours': 'groupTours',
  'shuttle-service': 'shuttle',
  'embassies': 'embassies',
  'blog': 'blog',
  'faq': 'faq',
  'contact': 'contact',
  'privacy-policy': 'privacy',
  'terms-and-conditions': 'terms',
}

// Per-path og:image overrides for static pages (default is georgia-home.jpg).
const staticPageImages = {
  'kutaisi-international-airport': '/images/files/kutaisi-airport.jpg',
  'tbilisi-international-airport': '/images/files/tbilisi-old-town-narikala-mtkvari-georgia-1200.webp',
  'tbilisi-metro': '/images/files/tbilisi-metekhi-mtatsminda.jpg',
  'tbilisi-railway-station': '/images/files/old-tbilisi.jpg',
}

// ---------------------------------------------------------------------------
// 3. Build per-route HTML
// ---------------------------------------------------------------------------

// Internal-link graph, keyed by locale + route path. Built from the same
// registries as the routes above, so it can only ever reference pages this
// script actually emits.
const linkGraph = createLinkGraph({
  tours,
  blogArticles,
  langs: LANGS,
  seoTitle: getSEO,
  tourTitle: (lang, tour) => loadTourTranslations(lang)[tour.slug]?.title || tour.title,
  blogTitle: (lang, article) => loadBlogTitle(lang, article.titleKey) || article.title,
})

const jsonLdBuilder = createJsonLdBuilder({ seoFor: getSEO })

// Page-specific structured data, tagged data-seo-jsonld so the runtime hook
// replaces this element's contents instead of appending a second block. `<` is
// escaped so a description containing "</script>" cannot close the tag early.
function renderJsonLd(graph) {
  if (!graph) return ''
  const json = JSON.stringify(normalizeJsonLdUrls(graph)).replace(/</g, '\\u003c')
  return `<script type="application/ld+json" data-seo-jsonld>${json}</script>`
}

// Fallback navigation rendered inside #root. React mounts with createRoot(),
// which empties the container on first render, so this is only ever seen by a
// client that does not run JavaScript — which is exactly the client that
// otherwise sees a blank page and no links at all.
function renderCrawlLinks(links) {
  if (!links.length) return ''
  const items = links
    .map(({ href, text }) => `<li><a href="${escAttr(href)}">${escHtml(text)}</a></li>`)
    .join('')
  return `<nav class="prerender-nav" aria-label="Site navigation"><ul>${items}</ul></nav>`
}

const template = readFileSync(join(DIST, 'index.html'), 'utf-8')
let fileCount = 0

// Set a meta tag's content, appending the tag if the template doesn't have it.
// Used for the optional image-SEO tags (og:image:alt / width / height) that the
// base template doesn't ship. No-op when content is empty.
function setOrAppendMeta($, name, content, attr = 'property') {
  if (content === undefined || content === null || content === '') return
  const sel = `meta[${attr}="${name}"]`
  if ($(sel).length) $(sel).attr('content', String(content))
  else $('head').append(`<meta ${attr}="${name}" content="${escAttr(String(content))}">`)
}

// Page writes are queued rather than executed inline: rendering the body is
// async (see emitHtml), while the generation loops below are plain synchronous
// for-loops. drainPages() runs the queue once they have all been walked.
const pageQueue = []
function writeHtml(filePath, lang, meta) {
  pageQueue.push({ filePath, lang, meta })
}

async function drainPages() {
  for (const { filePath, lang, meta } of pageQueue) {
    await emitHtml(filePath, lang, meta)
  }
}

async function emitHtml(filePath, lang, { title, description, keywords, canonical, image, ogImage, ogImageAlt, ogImageWidth, ogImageHeight, heroPreload, ogLocale, jsonLd }) {
  // Use the trailing-slash form the host serves at 200; this also flows through
  // to the hreflang/x-default alternates and og:url derived from it below.
  canonical = withTrailingSlash(canonical)
  const $ = load(template)

  // html lang
  $('html').attr('lang', lang)

  // title
  $('title').text(title)

  // meta description
  $('meta[name="description"]').attr('content', description)

  // meta keywords
  if (keywords) {
    if ($('meta[name="keywords"]').length) {
      $('meta[name="keywords"]').attr('content', keywords)
    } else {
      $('head').append(`<meta name="keywords" content="${escAttr(keywords)}">`)
    }
  }

  // canonical
  $('link[rel="canonical"]').attr('href', canonical)

  // Optional LCP hero preload (only pages that set heroPreload) — a static
  // <link rel=preload as=image> so the browser fetches the hero (a CSS
  // background, discovered late) from the initial HTML. Tagged data-seo-preload
  // so the client-side useSEO reuses this element instead of appending a second.
  if (heroPreload) {
    $('head').append(
      `<link rel="preload" as="image" href="${escAttr(heroPreload)}" type="image/avif" fetchpriority="high" data-seo-preload>`,
    )
  }

  // OG tags
  $('meta[property="og:title"]').attr('content', title)
  $('meta[property="og:description"]').attr('content', description)
  $('meta[property="og:url"]').attr('content', canonical)
  $('meta[property="og:locale"]').attr('content', ogLocale)
  // Prefer a dedicated 1.91:1 social image when supplied, otherwise the hero.
  const ogImg = ogImage || image
  if (ogImg) {
    const imgUrl = ogImg.startsWith('http') ? ogImg : `${SITE_URL}${ogImg}`
    $('meta[property="og:image"]').attr('content', imgUrl)
    setOrAppendMeta($, 'og:image:alt', ogImageAlt, 'property')
    setOrAppendMeta($, 'og:image:width', ogImageWidth, 'property')
    setOrAppendMeta($, 'og:image:height', ogImageHeight, 'property')
  }

  // Twitter Card
  $('meta[name="twitter:title"]').attr('content', title)
  $('meta[name="twitter:description"]').attr('content', description)
  if (ogImg) {
    const imgUrl = ogImg.startsWith('http') ? ogImg : `${SITE_URL}${ogImg}`
    $('meta[name="twitter:image"]').attr('content', imgUrl)
    setOrAppendMeta($, 'twitter:image:alt', ogImageAlt, 'name')
  }

  // Remove existing og:locale:alternate tags
  $('meta[property="og:locale:alternate"]').remove()

  // Add hreflang alternates
  // Remove any existing hreflang links
  $('link[rel="alternate"][hreflang]').remove()

  // Build the path portion from canonical (everything after SITE_URL/{lang})
  const canonicalPath = canonical.replace(`${SITE_URL}/${lang}`, '')

  // The Ivory theme is site-wide now, so `theme-ivory` lives on <html> in
  // index.html and arrives here with the template — there is no per-route hook
  // any more. The Google Fonts link it used to strip is gone from the template
  // too, so nothing needs removing here either.

  for (const altLang of LANGS) {
    const altUrl = `${SITE_URL}/${altLang}${canonicalPath}`
    $('head').append(`<link rel="alternate" hreflang="${altLang}" href="${altUrl}">`)
    if (altLang !== lang) {
      const altLocale = localeMap[altLang]
      $('meta[property="og:locale"]').after(`<meta property="og:locale:alternate" content="${altLocale}">`)
    }
  }
  // x-default points to English version
  $('head').append(`<link rel="alternate" hreflang="x-default" href="${SITE_URL}/en${canonicalPath}">`)

  // Page-specific JSON-LD (see renderJsonLd). The generic TravelAgency block
  // from the template stays; this adds the entity/breadcrumb/image nodes.
  // A caller may hand over a finished graph instead of one looked up by
  // route — tour pages do, because theirs is built by the same module the
  // React page uses rather than by the route table in seo-jsonld.js.
  const ldHtml = renderJsonLd(jsonLd || jsonLdBuilder.forRoute(lang, canonicalPath))
  if (ldHtml) $('head').append(ldHtml)

  // The page body, rendered from the same React tree the browser mounts, so the
  // article text is in the static HTML without executing JavaScript.
  await prepareLocale(lang)
  const body = await renderPage(`/${lang}${canonicalPath}`)

  // The real page carries most of the crawlable link graph now (header, footer,
  // in-content links), but not all of it: the language switcher is a JS dropdown
  // that renders buttons rather than anchors, and the parent/sibling links the
  // graph adds are not all expressed in the UI — without this, 91 pages (the
  // border crossings and the Tbilisi transport guides) end up with no inbound
  // link at all. So the block is kept, moved out of #root and into <noscript>.
  //
  // Out of #root because React now hydrates that container and would treat any
  // markup it did not render as a mismatch; <noscript> because a JS visitor must
  // see exactly what they saw before, i.e. nothing. This is the element's proper
  // use — a genuine no-script fallback, not links hidden behind CSS.
  const crawlLinks = renderCrawlLinks(linkGraph.linksFor(lang, canonicalPath))
  const noscript = crawlLinks ? `<noscript>${crawlLinks}</noscript>` : ''

  // Injected into the serialised string rather than through cheerio. Re-parsing
  // React's markup would re-serialise it (attribute quoting, void elements,
  // entity escaping) and hydration compares the two character by character.
  $('#root').empty()
  let html = $.html()
  const ROOT_EMPTY = '<div id="root"></div>'
  if (!html.includes(ROOT_EMPTY)) {
    throw new Error(`No empty #root to fill in ${filePath} — template changed?`)
  }
  // data-ssr tells src/main.jsx to hydrate rather than render from scratch. It
  // lives on the container element, which React does not manage or diff.
  html = html.replace(ROOT_EMPTY, `<div id="root" data-ssr="">${body}</div>${noscript}`)

  const dir = dirname(filePath)
  mkdirSync(dir, { recursive: true })
  writeFileSync(filePath, html, 'utf-8')
  fileCount++
}

function escAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Static redirect stub for an old URL -> its new canonical location. Crawlers
// without JS follow the meta-refresh + canonical; the SPA router redirects
// in-browser. Used for the legacy flat city URLs after the move under /cities.
function writeRedirectStub(filePath, target) {
  target = withTrailingSlash(target)
  const $ = load(template)
  $('head').prepend(`<meta http-equiv="refresh" content="0; url=${target}">`)
  $('link[rel="canonical"]').attr('href', target)
  // ⚠️ NO `noindex` HERE — deliberately. A stub previously carried
  // `noindex, follow` AND a rel=canonical to its destination, which are
  // contradictory instructions: noindex says "drop this URL", canonical says
  // "merge this URL into that one". Google's guidance is to pick one, and if the
  // page is dropped before the canonical is processed the consolidation signal
  // is simply lost — the legacy URL's accumulated equity goes nowhere instead of
  // flowing to the live page.
  //
  // Canonical + an instant meta-refresh is the coherent pairing for a moved URL,
  // so the robots meta inherited from the template is removed and none is added
  // back (absence = the default index,follow, and the canonical does the work).
  //
  // The tradeoff, stated plainly: without noindex a stub *could* be indexed if
  // Google disregards the canonical. The instant refresh makes that unlikely,
  // and a real 301 at the edge would remove the question entirely — see
  // docs/redirects/, which is generated and still unapplied.
  $('meta[name="robots"]').remove()
  // Give the stub a real anchor to its destination, not only the meta-refresh
  // and the canonical, so a crawler without JS has a link to follow.
  $('#root').html(renderCrawlLinks([{ href: target, text: target }]))
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, $.html(), 'utf-8')
  fileCount++
}

// ---------------------------------------------------------------------------
// 4. Generate all pages
// ---------------------------------------------------------------------------

console.log('Pre-rendering SEO HTML files...')

for (const lang of LANGS) {
  const tourTrans = loadTourTranslations(lang)
  const ogLocale = localeMap[lang]

  // --- Static pages ---
  for (const [path, seoKey] of Object.entries(seoPageMap)) {
    const data = getSEO(seoKey, lang)
    const canonical = path
      ? `${SITE_URL}/${lang}/${path}`
      : `${SITE_URL}/${lang}`
    const filePath = path
      ? join(DIST, lang, path, 'index.html')
      : join(DIST, lang, 'index.html')

    writeHtml(filePath, lang, {
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      canonical,
      image: staticPageImages[path] || '/images/files/georgia-home.jpg',
      ogLocale,
    })
  }

  // --- Destination detail pages (regions / cities / sites) from the registry ---
  for (const dest of publishedDestinationPages()) {
    const data = getSEO(dest.seoKey, lang)
    const canonical = `${SITE_URL}/${lang}/${dest.path}`
    const filePath = join(DIST, lang, dest.path, 'index.html')
    writeHtml(filePath, lang, {
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      canonical,
      image: dest.image || '/images/files/georgia-home.jpg',
      // Optional image-SEO extras (only sites that define them, e.g. Batonis
      // Tsikhe): dedicated social image + dimensions + per-locale alt text.
      ogImage: dest.ogImage,
      ogImageAlt: dest.imageAlt?.[lang],
      ogImageWidth: dest.ogImageWidth,
      ogImageHeight: dest.ogImageHeight,
      heroPreload: dest.heroPreload,
      ogLocale,
    })
  }

  // --- Border-crossing pages (overview guide + individual crossings) ---
  for (const bp of publishedBorderPages()) {
    const data = getSEO(bp.seoKey, lang)
    const canonical = `${SITE_URL}/${lang}/${bp.path}`
    const filePath = join(DIST, lang, bp.path, 'index.html')
    writeHtml(filePath, lang, {
      title: data.title,
      description: data.description,
      keywords: data.keywords,
      canonical,
      image: bp.image || '/images/files/georgia-home.jpg',
      ogLocale,
    })
  }

  // --- Old URLs (the /destinations tree + flat things-to-do) -> redirect
  //     stubs pointing at their new /georgia home. ---
  for (const { from, to } of legacyRedirects()) {
    const filePath = join(DIST, lang, from, 'index.html')
    writeRedirectStub(filePath, `${SITE_URL}/${lang}/${to}`)
  }

  // --- Tour detail pages ---
  for (const tour of tours) {
    const tt = tourTrans[tour.slug]
    const prefix = tour.type === 'group' ? 'group-tours' : 'private-tours'
    const title = `${tt?.seoTitle || tour.seoTitle || tt?.title || tour.title} | Hikasus Travel`
    const description = tt?.metaDescription || tour.metaDescription || (tt?.description || tour.description || '').slice(0, 160)

    // Generate keywords matching the runtime logic
    const typeLabel = tour.type === 'group' ? 'group tour' : 'private tour'
    const daysLabel = tour.days ? `${tour.days}-day Georgia tour` : 'Georgia tour'
    const itinKeywords = tour.itineraryTitles.map(loc => `${loc} tour`)
    const keywords = [
      `book ${typeLabel} Georgia`,
      daysLabel,
      ...itinKeywords,
      `Georgia ${typeLabel} itinerary`,
      'book Georgia adventure',
    ].join(', ')

    const canonical = `${SITE_URL}/${lang}/${prefix}/${tour.slug}`
    const filePath = join(DIST, lang, prefix, tour.slug, 'index.html')

    writeHtml(filePath, lang, {
      title,
      description,
      keywords,
      canonical,
      image: tour.heroImage,
      // When the tour ships a dedicated social image (1.91:1 og.jpg), use it for
      // og:image with a per-locale alt; otherwise og:image falls back to the hero
      // (no alt), matching the previous behaviour for every other tour.
      ogImage: tour.ogImage || undefined,
      ogImageAlt: tour.ogImage ? (tour.imageAlt?.[lang] || tour.imageAlt?.en || undefined) : undefined,
      ogImageWidth: tour.ogImage ? tour.ogImageWidth : undefined,
      ogImageHeight: tour.ogImage ? tour.ogImageHeight : undefined,
      ogLocale,
      // The page graph, from the tour record proper (not the regex-parsed
      // summary this loop iterates) and from this locale's translations.
      jsonLd: buildTourSeo({
        tour: tourRecords.find((r) => r.slug === tour.slug),
        tt,
        lang,
      }).jsonLd,
    })

    // Renamed tour slug(s): every old URL 301-redirects to the new canonical
    // (mirrors the client-side TourSlugRedirect routes in App.jsx).
    for (const former of tour.formerSlugs) {
      const oldFilePath = join(DIST, lang, prefix, former, 'index.html')
      writeRedirectStub(oldFilePath, canonical)
    }
  }

  // --- Destination/attraction "<Entity> Tours" listing pages ---
  const ui = loadUi(lang)
  for (const ep of entityTourPages) {
    const title = interp(ui['tours.listMetaTitle'], ep.name)
    const description = interp(ui['tours.listMetaDescription'], ep.name)
    const canonical = `${SITE_URL}/${lang}/${ep.path}`
    const filePath = join(DIST, lang, ep.path, 'index.html')
    writeHtml(filePath, lang, {
      title,
      description,
      canonical,
      image: '/images/files/georgia-tour-01.jpg',
      ogLocale,
    })
  }

  // --- Private Tours collection pages (/:lang/private-tours/<collection>) ---
  for (const c of privateTourCollectionPages) {
    writeHtml(join(DIST, lang, c.path, 'index.html'), lang, {
      title: ui[c.titleKey],
      description: ui[c.descriptionKey],
      canonical: `${SITE_URL}/${lang}/${c.path}`,
      image: '/images/files/georgia-tour-01.jpg',
      ogLocale,
    })
  }

  // --- Blog article pages ---
  for (const article of blogArticles) {
    const translatedTitle = loadBlogTitle(lang, article.titleKey) || article.title
    const title = (lang === 'en' && article.seoTitle)
      ? article.seoTitle
      : `${translatedTitle} | Hikasus Travel Blog`
    const description = (article.descKey && loadBlogTitle(lang, article.descKey)) || article.metaDescription || article.excerpt
    const tagKeywords = article.tags.flatMap(tag => [
      `Georgia ${tag.replace(/-/g, ' ')}`,
    ])
    const keywords = [...tagKeywords, 'travel tips Georgia'].join(', ')

    const canonical = `${SITE_URL}/${lang}/blog/${article.slug}`
    const filePath = join(DIST, lang, 'blog', article.slug, 'index.html')

    writeHtml(filePath, lang, {
      title,
      description,
      keywords,
      canonical,
      image: article.heroImage,
      ogImage: article.ogImage,
      ogImageAlt: article.ogImageAlt?.[lang],
      ogImageWidth: article.ogImageWidth,
      ogImageHeight: article.ogImageHeight,
      ogLocale,
    })
  }
}

// ---------------------------------------------------------------------------
// 4b. Render and write the queued pages (see writeHtml/drainPages)
// ---------------------------------------------------------------------------
console.log(`Rendering ${pageQueue.length} page bodies...`)
await drainPages()

// ---------------------------------------------------------------------------
// 5. Generate 404.html (SPA fallback)
// ---------------------------------------------------------------------------
copyFileSync(join(DIST, 'index.html'), join(DIST, '404.html'))
console.log('Created dist/404.html (SPA fallback)')

// ---------------------------------------------------------------------------
// 6. Root document — canonicalises to /en/ and is deliberately absent from the
//    sitemap, but it is the URL the domain resolves to, so it must offer a
//    crawl path into the seven locale home pages rather than an empty body.
//    Written after the 404 copy so the fallback keeps its previous content.
// ---------------------------------------------------------------------------
{
  const $ = load(readFileSync(join(DIST, 'index.html'), 'utf-8'))
  $('#root').html(renderCrawlLinks(
    LANGS.map((l) => ({ href: `/${l}/`, text: langNames[l] || l })),
  ))
  writeFileSync(join(DIST, 'index.html'), $.html(), 'utf-8')
  console.log('Added locale links to dist/index.html')
}

console.log(`Pre-render complete: ${fileCount} HTML files generated.`)
