/**
 * Image Metadata (Google "image license metadata") fallbacks for every
 * ImageObject the site emits.
 *
 * Google's Image Metadata feature reads an ImageObject's `contentUrl` plus at
 * least one of creator / creditText / copyrightNotice / license, and RECOMMENDS
 * two URL fields on every such node:
 *
 *   license            — a page describing the terms governing use of the image
 *   acquireLicensePage — a page where a user finds out how to obtain permission
 *                        or a licence ("a general page that explains how to
 *                        contact you" is explicitly allowed)
 *
 * Search Console flagged "Missing field acquireLicensePage" on hero, body-figure
 * and route-map ImageObjects alike, because none of the ten places that build
 * ImageObject nodes (SitePage, CityPage, RegionPage, ThingsToDoCityPage,
 * BlogArticlePage, tourSeo.js, the hand-authored tour/places nodes, and the
 * build-time scripts/seo-jsonld.js) ever set it.
 *
 * Rather than patch ten builders, the two JSON-LD sinks — useSEO (hydrated DOM)
 * and scripts/prerender.js renderJsonLd (static HTML) — pass every graph through
 * `withImageLicensing()` just before serialisation. Any ImageObject that names an
 * image file (contentUrl or url) and lacks `acquireLicensePage` / `license` gets
 * the locale's Image Usage & Licensing page for the missing field(s). A node that
 * already carries either field (e.g. an image under a Creative Commons licence,
 * or a node whose package shipped its own value) keeps it untouched, so
 * image-specific rights always take precedence over the site-level fallback.
 *
 * The fallback page (/<lang>/image-licensing/, see ImageLicensingPage.jsx) is
 * deliberately truthful for EVERY image on the site: it states that rights vary
 * by image (own photography, partner/hotel-supplied imagery, openly licensed
 * photos, maps made for Hikasus), that no reuse is permitted without permission,
 * and how to ask. It therefore performs both functions — the terms governing use
 * (`license`) and the route to permission (`acquireLicensePage`) — without
 * asserting ownership, authorship or a licence the company may not hold.
 * Nothing here adds or changes creator / creditText / copyrightNotice.
 */

const SITE_URL = 'https://www.hikasustravel.com'

export const IMAGE_LICENSING_PATH = 'image-licensing'

const LANGS = new Set(['en', 'de', 'fr', 'es', 'nl', 'cs', 'pl'])

/** Absolute, trailing-slash URL of the locale's Image Usage & Licensing page. */
export function imageLicensingUrl(lang = 'en') {
  const l = LANGS.has(lang) ? lang : 'en'
  return `${SITE_URL}/${l}/${IMAGE_LICENSING_PATH}/`
}

function isImageObject(node) {
  const t = node['@type']
  return t === 'ImageObject' || (Array.isArray(t) && t.includes('ImageObject'))
}

function namesAnImage(node) {
  return typeof node.contentUrl === 'string' || typeof node.url === 'string'
}

/**
 * Return a copy of a JSON-LD value in which every ImageObject that names an
 * image file carries `acquireLicensePage` and `license`, filling only the
 * field(s) the node does not already have. Walks arrays, @graph and nested
 * objects; everything that is not such an ImageObject is returned unchanged.
 */
export function withImageLicensing(node, lang = 'en') {
  if (Array.isArray(node)) return node.map((n) => withImageLicensing(n, lang))
  if (!node || typeof node !== 'object') return node
  const out = {}
  for (const [key, value] of Object.entries(node)) out[key] = withImageLicensing(value, lang)
  if (isImageObject(out) && namesAnImage(out)) {
    const page = imageLicensingUrl(lang)
    if (out.acquireLicensePage === undefined) out.acquireLicensePage = page
    if (out.license === undefined) out.license = page
  }
  return out
}
