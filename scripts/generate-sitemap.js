import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, join } from 'path'
import { createHash } from 'crypto'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Canonical-URL helper (trailing-slash form matching how the host serves pages).
const { withTrailingSlash } = await import(
  pathToFileURL(join(__dirname, '../src/utils/url.js')).href
)

// Published destination detail pages (regions / cities / sites) from the registry.
const { publishedDestinationPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/places.js')).href
)

// Published border-crossing pages (overview guide + individual crossings).
const { publishedBorderPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/borders.js')).href
)

// Registry arrays + path helpers, used only to attach each URL to the data that
// actually renders it, so <lastmod> can track real content changes (see below).
const {
  regions, cities, sites, regionPath, cityPath, sitePath, thingsToDoPath,
} = await import(pathToFileURL(join(__dirname, '../src/data/places.js')).href)

// Full tour objects for the same purpose. The path list below still comes from
// the regex scan, so the set of emitted URLs is unaffected by this import.
const { tours: tourObjects } = await import(
  pathToFileURL(join(__dirname, '../src/data/tours.js')).href
)

// Blog posts keep their copy in blogData, not in pages.json.
const { blogArticles } = await import(
  pathToFileURL(join(__dirname, '../src/data/blogData.js')).href
)

// Generated "<Entity> Tours" listing pages (destination/attraction -> tours).
const { entityTourPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/entityTours.js')).href
)
const { privateTourCollectionPages } = await import(
  pathToFileURL(join(__dirname, '../src/data/privateTourCollections.js')).href
)

// Parse tours data from the source file
const toursFile = readFileSync(join(__dirname, '../src/data/tours.js'), 'utf-8')
const slugTypeRegex = /"slug":\s*"([^"]+)"[\s\S]*?"type":\s*"([^"]+)"/g
const tours = []
let match
while ((match = slugTypeRegex.exec(toursFile)) !== null) {
  tours.push({ slug: match[1], type: match[2] })
}

const SITE_URL = 'https://www.hikasustravel.com'
const languages = ['en', 'es', 'fr', 'de', 'pl', 'cs', 'nl']
const today = new Date().toISOString().split('T')[0]

const staticPages = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: 'about-us', changefreq: 'monthly', priority: '0.7' },
  { path: 'about-georgia', changefreq: 'monthly', priority: '0.7' },
  { path: 'georgian-lari-currency-guide', changefreq: 'monthly', priority: '0.6' },
  { path: 'georgia-visa-entry-requirements', changefreq: 'monthly', priority: '0.7' },
  { path: 'languages-of-georgia', changefreq: 'monthly', priority: '0.6' },
  { path: 'kutaisi-international-airport', changefreq: 'monthly', priority: '0.6' },
  { path: 'tbilisi-international-airport', changefreq: 'monthly', priority: '0.6' },
  { path: 'tbilisi-metro', changefreq: 'monthly', priority: '0.6' },
  { path: 'tbilisi-railway-station', changefreq: 'monthly', priority: '0.6' },
  { path: 'abkhazia', changefreq: 'monthly', priority: '0.5' },
  { path: 'georgia', changefreq: 'monthly', priority: '0.7' },
  { path: 'georgia/regions', changefreq: 'monthly', priority: '0.7' },
  { path: 'georgia/cities', changefreq: 'monthly', priority: '0.7' },
  { path: 'georgia/places-to-visit', changefreq: 'monthly', priority: '0.7' },
  // Armenia's two hub pages. Its region detail pages and their things-to-do
  // guides come from the destination registry below, exactly as Georgia's do.
  { path: 'armenia', changefreq: 'monthly', priority: '0.7' },
  { path: 'armenia/regions', changefreq: 'monthly', priority: '0.7' },
  // City detail pages and their things-to-do guides come from the destination
  // registry below (publishedDestinationPages), so they are not listed here.
  { path: 'private-tours', changefreq: 'weekly', priority: '0.9' },
  { path: 'group-tours', changefreq: 'weekly', priority: '0.9' },
  { path: 'shuttle-service', changefreq: 'monthly', priority: '0.8' },
  { path: 'embassies', changefreq: 'monthly', priority: '0.7' },
  { path: 'blog', changefreq: 'weekly', priority: '0.8' },
  { path: 'blog/ultimate-guide-to-traveling-to-georgia', changefreq: 'monthly', priority: '0.8' },
  { path: 'blog/essential-georgian-words-phrases', changefreq: 'monthly', priority: '0.8' },
  { path: 'blog/why-georgia-is-called-georgia-sakartvelo', changefreq: 'monthly', priority: '0.8' },
  { path: 'blog/georgian-flag-history-meaning', changefreq: 'monthly', priority: '0.8' },
  { path: 'faq', changefreq: 'monthly', priority: '0.5' },
  { path: 'contact', changefreq: 'monthly', priority: '0.6' },
  { path: 'privacy-policy', changefreq: 'yearly', priority: '0.2' },
  { path: 'terms-and-conditions', changefreq: 'yearly', priority: '0.2' },
]

// Build all route paths (language-independent)
const allPaths = []

for (const page of staticPages) {
  allPaths.push({ path: page.path, changefreq: page.changefreq, priority: page.priority })
}

for (const tour of tours) {
  const prefix = tour.type === 'group' ? 'group-tours' : 'private-tours'
  allPaths.push({ path: `${prefix}/${tour.slug}`, changefreq: 'monthly', priority: '0.8' })
}

// Published destination detail pages (cities/regions/sites) at their nested URLs.
for (const dest of publishedDestinationPages()) {
  allPaths.push({ path: dest.path, changefreq: 'monthly', priority: '0.7' })
}

// Published border-crossing pages (overview + individual crossings).
for (const ep of entityTourPages) {
  allPaths.push({ path: ep.path, changefreq: 'monthly', priority: '0.6' })
}

// Private Tours collection pages (starting point / category listings).
for (const c of privateTourCollectionPages) {
  allPaths.push({ path: c.path, changefreq: 'weekly', priority: '0.8' })
}

for (const bp of publishedBorderPages()) {
  allPaths.push({ path: bp.path, changefreq: 'monthly', priority: '0.7' })
}

/* ---------------------------------------------------------------------------
 * <lastmod> without per-deploy churn
 *
 * lastmod used to be `new Date()`, so every deploy restamped all ~2,700 URLs
 * with the build date whether or not anything had changed. Crawlers discount a
 * lastmod that moves on every fetch, so the signal was worth nothing.
 *
 * Instead we hash the data that actually renders each URL (its body copy, its
 * SEO entry and its registry object) and keep the date in a tracked manifest.
 * A rebuild with no content change reuses the stored date, so the sitemap is
 * byte-identical; only pages whose own content moved get today's date.
 * ------------------------------------------------------------------------- */

const sha1 = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16)

// Key order must not depend on object construction order, or an unrelated
// refactor would look like a content change.
const stableStringify = (value) => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null'
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  return `{${Object.keys(value).sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
    .join(',')}}`
}

// Per-locale body copy and SEO metadata. generate-en-fallback and
// generate-seo-locales both run before this script, so these are current.
const localeContent = {}
const localeSeo = {}
const localeUi = {}
const localeContentHash = {}
for (const lang of languages) {
  localeContent[lang] = JSON.parse(
    readFileSync(join(__dirname, `../src/i18n/locales/${lang}/pages.json`), 'utf-8'))
  localeSeo[lang] = JSON.parse(
    readFileSync(join(__dirname, `../src/data/seo/${lang}.json`), 'utf-8'))
  localeUi[lang] = JSON.parse(
    readFileSync(join(__dirname, `../src/i18n/locales/${lang}/ui.json`), 'utf-8'))
  localeContentHash[lang] = sha1(stableStringify(localeContent[lang]))
}
const enFallback = JSON.parse(
  readFileSync(join(__dirname, '../src/i18n/locales/en-fallback.json'), 'utf-8'))

// path -> the registry object that renders it. Paths in allPaths carry no
// leading slash; the path helpers return one.
const strip = (p) => p.replace(/^\//, '')
const registryData = new Map()
for (const r of regions) registryData.set(strip(regionPath(r.slug)), r)
for (const c of cities) {
  registryData.set(strip(cityPath(c.slug)), c)
  registryData.set(strip(thingsToDoPath(c.slug)), c)
}
for (const s of sites) registryData.set(strip(sitePath(s)), s)

const tourBySlug = new Map(tourObjects.map((t) => [t.slug, t]))
const entityPageByPath = new Map(entityTourPages.map((ep) => [ep.path, ep]))
const collectionByPath = new Map(privateTourCollectionPages.map((c) => [c.path, c]))
const blogBySlug = new Map(blogArticles.map((a) => [a.slug, a]))

// `private-tours/<slug>` / `group-tours/<slug>` -> the tour slug, else null.
const tourSlugOf = (path) => path.match(/^(?:private-tours|group-tours)\/(.+)$/)?.[1] ?? null
const blogSlugOf = (path) => path.match(/^blog\/(.+)$/)?.[1] ?? null
const seoKeyByPath = new Map()
for (const d of publishedDestinationPages()) seoKeyByPath.set(d.path, d.seoKey)
for (const bp of publishedBorderPages()) seoKeyByPath.set(bp.path, bp.seoKey)

// Static pages are keyed inconsistently across pages.json / seo (`terms`,
// `shuttle`, `tbilisiMetro`...), so try the plausible spellings and use EN as
// the canonical keyspace so every locale agrees on the key.
const camel = (s) => s.replace(/[/-]([a-z0-9])/g, (_, c) => c.toUpperCase()).replace(/[/-]/g, '')
const resolveStaticKey = (path) => {
  if (!path) return 'home'
  const last = path.split('/').pop()
  for (const cand of [camel(path), camel(last), path, last]) {
    if (localeContent.en[cand] !== undefined || localeSeo.en[cand] !== undefined) return cand
  }
  return null
}

const unresolved = new Set()
const contentKeyByPath = new Map()
for (const { path } of allPaths) {
  const key = seoKeyByPath.get(path) ?? resolveStaticKey(path)
  contentKeyByPath.set(path, key)
  const hasOwnData = registryData.has(path)
    || entityPageByPath.has(path)
    || collectionByPath.has(path)
    || tourBySlug.has(tourSlugOf(path))
    || blogBySlug.has(blogSlugOf(path))
  if (key === null && !hasOwnData) unresolved.add(path)
}

// The signature for one URL: everything that decides what the page renders.
const signatureFor = (lang, path, changefreq, priority) => {
  const key = contentKeyByPath.get(path) ?? null
  const entityPage = entityPageByPath.get(path) ?? null

  const payload = {
    path,
    changefreq,
    priority,
    key,
    content: key ? (localeContent[lang]?.[key] ?? enFallback?.[key] ?? null) : null,
    seo: key ? (localeSeo[lang]?.[key] ?? null) : null,
    registry: registryData.get(path) ?? null,
    tour: tourBySlug.get(tourSlugOf(path)) ?? null,
    blog: blogBySlug.get(blogSlugOf(path)) ?? null,
    entity: entityPage,
    // A tours listing page renders the tours it links to.
    entityTours: entityPage
      ? entityPage.tourSlugs.map((s) => tourBySlug.get(s) ?? s)
      : null,
    // Same for a Private Tours collection page: the tours it lists plus its own
    // per-locale copy, so it is keyed precisely instead of falling back to the
    // whole-locale hash.
    collectionTours: collectionByPath.has(path)
      ? collectionByPath.get(path).tourSlugs.map((s) => tourBySlug.get(s) ?? s)
      : null,
    collectionCopy: collectionByPath.has(path)
      ? [collectionByPath.get(path).h1Key, collectionByPath.get(path).titleKey,
        collectionByPath.get(path).descriptionKey, collectionByPath.get(path).introKey]
        .map((k) => localeUi[lang]?.[k] ?? null)
      : null,
  }

  // Pages we cannot key precisely (a handful of static routes rendered from
  // components) fall back to the whole-locale copy hash: conservative, so they
  // may restamp when unrelated copy changes, but they never go stale.
  if (unresolved.has(path)) payload.localeFallback = localeContentHash[lang]

  return sha1(stableStringify(payload))
}

// Generate URL entries with hreflang alternates
const urlEntries = []

for (const lang of languages) {
  for (const { path, changefreq, priority } of allPaths) {
    const loc = withTrailingSlash(path
      ? `${SITE_URL}/${lang}/${path}`
      : `${SITE_URL}/${lang}`)

    // Build hreflang alternates
    const hreflangs = languages.map(altLang => {
      const altUrl = withTrailingSlash(path
        ? `${SITE_URL}/${altLang}/${path}`
        : `${SITE_URL}/${altLang}`)
      return `      <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}" />`
    })
    // x-default points to English
    const xDefaultUrl = withTrailingSlash(path ? `${SITE_URL}/en/${path}` : `${SITE_URL}/en`)
    hreflangs.push(`      <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultUrl}" />`)

    urlEntries.push({
      loc,
      sig: signatureFor(lang, path, changefreq, priority),
      changefreq,
      priority,
      hreflangs,
    })
  }
}

/* Reconcile against the stored manifest: same signature keeps its date. */
const manifestPath = join(__dirname, '../src/data/sitemap-lastmod.json')
let stored = {}
if (existsSync(manifestPath)) {
  try {
    stored = JSON.parse(readFileSync(manifestPath, 'utf-8')).urls ?? {}
  } catch {
    console.warn('sitemap-lastmod.json unreadable — rebuilding it from scratch')
  }
}

const nextUrls = {}
let reused = 0
let restamped = 0
let added = 0
for (const u of urlEntries) {
  const prev = stored[u.loc]
  if (prev && prev.sig === u.sig) {
    u.lastmod = prev.lastmod
    reused++
  } else {
    u.lastmod = today
    if (prev) restamped++
    else added++
  }
  nextUrls[u.loc] = { sig: u.sig, lastmod: u.lastmod }
}
const removed = Object.keys(stored).filter((loc) => !(loc in nextUrls))

// Sorted keys so the file is stable regardless of iteration order.
const sortedUrls = {}
for (const loc of Object.keys(nextUrls).sort()) sortedUrls[loc] = nextUrls[loc]
const manifestJson = `${JSON.stringify({ version: 1, urls: sortedUrls }, null, 2)}\n`

// Compare ignoring line endings (core.autocrlf rewrites the checked-out file),
// and only write when something really moved, so rebuilds leave it untouched.
const previousJson = existsSync(manifestPath) ? readFileSync(manifestPath, 'utf-8') : null
const manifestChanged = (previousJson ?? '').replace(/\r/g, '') !== manifestJson
if (manifestChanged) {
  writeFileSync(manifestPath, manifestJson, 'utf-8')
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
${u.hreflangs.join('\n')}
  </url>`).join('\n')}
</urlset>
`

const outPath = join(__dirname, '../public/sitemap.xml')
writeFileSync(outPath, xml, 'utf-8')
console.log(`Sitemap generated: ${urlEntries.length} URLs written to public/sitemap.xml`)
console.log(
  `  lastmod: ${reused} unchanged, ${restamped} restamped, ${added} new` +
  (removed.length ? `, ${removed.length} pruned` : ''))
if (unresolved.size) {
  console.log(`  ${unresolved.size} route(s) use the locale-wide fallback: ${[...unresolved].join(', ')}`)
}
if (manifestChanged) {
  console.log('  src/data/sitemap-lastmod.json updated — COMMIT IT, or the dates restamp on the next deploy.')
}
